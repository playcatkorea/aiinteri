"""
AI 인테리어 - 자체 GPU 서버

Stable Diffusion + ControlNet + LaMa 기반 인테리어 리모델링 & 사진 보정 서버.
Next.js 프론트엔드와 REST API로 통신합니다.

사용법:
    python server.py
    python server.py --port 7860 --host 0.0.0.0
"""

import argparse
import base64
import io
import logging
import os
import sys
from contextlib import asynccontextmanager

import torch
import numpy as np
from PIL import Image
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

# ============================
# 모델 로딩 (지연 로딩)
# ============================

models = {}


def get_device():
    if torch.cuda.is_available():
        return "cuda"
    elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        return "mps"
    return "cpu"


def load_remodel_pipeline():
    """인테리어 리모델링용 파이프라인 로드 (ControlNet + SD Inpainting)"""
    if "remodel" in models:
        return models["remodel"]

    logger.info("리모델링 파이프라인 로딩 중...")

    from diffusers import (
        StableDiffusionControlNetPipeline,
        ControlNetModel,
        UniPCMultistepScheduler,
    )

    device = get_device()

    # ControlNet MLSD (직선 감지 - 방 구조 보존)
    controlnet = ControlNetModel.from_pretrained(
        "lllyasviel/control_v11p_sd15_mlsd",
        torch_dtype=torch.float16 if device == "cuda" else torch.float32,
    )

    # Realistic Vision V3.0 (포토리얼리스틱 결과)
    pipe = StableDiffusionControlNetPipeline.from_pretrained(
        "SG161222/Realistic_Vision_V3.0_VAE",
        controlnet=controlnet,
        torch_dtype=torch.float16 if device == "cuda" else torch.float32,
        safety_checker=None,
    )
    pipe.scheduler = UniPCMultistepScheduler.from_config(pipe.scheduler.config)
    pipe = pipe.to(device)

    if device == "cuda":
        pipe.enable_model_cpu_offload()

    models["remodel"] = pipe
    logger.info("리모델링 파이프라인 로딩 완료")
    return pipe


def load_inpaint_pipeline():
    """사진 보정용 인페인팅 파이프라인 로드"""
    if "inpaint" in models:
        return models["inpaint"]

    logger.info("인페인팅 파이프라인 로딩 중...")

    from diffusers import StableDiffusionInpaintPipeline

    device = get_device()

    pipe = StableDiffusionInpaintPipeline.from_pretrained(
        "runwayml/stable-diffusion-inpainting",
        torch_dtype=torch.float16 if device == "cuda" else torch.float32,
        safety_checker=None,
    )
    pipe = pipe.to(device)

    if device == "cuda":
        pipe.enable_model_cpu_offload()

    models["inpaint"] = pipe
    logger.info("인페인팅 파이프라인 로딩 완료")
    return pipe


def load_lama():
    """LaMa 모델 로드 (잡동사니 제거 전용)"""
    if "lama" in models:
        return models["lama"]

    logger.info("LaMa 모델 로딩 중...")

    try:
        from simple_lama_inpainting import SimpleLama
        lama = SimpleLama()
        models["lama"] = lama
        logger.info("LaMa 모델 로딩 완료")
        return lama
    except Exception as e:
        logger.warning(f"LaMa 로딩 실패 (인페인팅으로 대체): {e}")
        return None


# ============================
# API 모델
# ============================


class RemodelRequest(BaseModel):
    image_base64: str | None = None
    image_url: str | None = None
    prompt: str
    negative_prompt: str = "lowres, watermark, banner, logo, text, deformed, blurry, ugly"
    prompt_strength: float = Field(default=0.8, ge=0.0, le=1.0)
    guidance_scale: float = Field(default=15.0, ge=1.0, le=30.0)
    num_inference_steps: int = Field(default=50, ge=10, le=100)


class EnhanceRequest(BaseModel):
    image_base64: str | None = None
    image_url: str | None = None
    prompt: str


class HealthResponse(BaseModel):
    status: str
    gpu: str
    vram_total: int | None = None
    vram_used: int | None = None
    models: list[str]


# ============================
# 유틸리티
# ============================


def decode_image(base64_str: str | None, url: str | None) -> Image.Image:
    """base64 또는 URL에서 PIL Image로 변환"""
    if base64_str:
        image_data = base64.b64decode(base64_str)
        return Image.open(io.BytesIO(image_data)).convert("RGB")
    elif url:
        import requests
        response = requests.get(url, timeout=30)
        return Image.open(io.BytesIO(response.content)).convert("RGB")
    else:
        raise HTTPException(status_code=400, detail="image_base64 또는 image_url이 필요합니다")


def encode_image(image: Image.Image, format: str = "JPEG", quality: int = 90) -> str:
    """PIL Image를 base64로 변환"""
    buffer = io.BytesIO()
    image.save(buffer, format=format, quality=quality)
    return base64.b64encode(buffer.getvalue()).decode("utf-8")


def get_mlsd_lines(image: Image.Image) -> Image.Image:
    """MLSD 선분 감지 (방 구조 추출)"""
    from controlnet_aux import MLSDdetector
    if "mlsd" not in models:
        models["mlsd"] = MLSDdetector.from_pretrained("lllyasviel/Annotators")
    return models["mlsd"](image)


# ============================
# FastAPI 앱
# ============================


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"GPU 서버 시작 (device: {get_device()})")
    if torch.cuda.is_available():
        gpu_name = torch.cuda.get_device_name(0)
        vram = torch.cuda.get_device_properties(0).total_mem / 1024**3
        logger.info(f"GPU: {gpu_name} ({vram:.1f} GB)")
    yield
    logger.info("GPU 서버 종료")


app = FastAPI(title="AI 인테리어 GPU 서버", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    gpu_name = "CPU"
    vram_total = None
    vram_used = None

    if torch.cuda.is_available():
        gpu_name = torch.cuda.get_device_name(0)
        vram_total = int(torch.cuda.get_device_properties(0).total_mem / 1024**2)
        vram_used = int(torch.cuda.memory_allocated(0) / 1024**2)
    elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        gpu_name = "Apple MPS"

    loaded_models = list(models.keys())

    return HealthResponse(
        status="ok",
        gpu=gpu_name,
        vram_total=vram_total,
        vram_used=vram_used,
        models=loaded_models,
    )


@app.post("/api/remodel")
async def remodel(req: RemodelRequest):
    """인테리어 리모델링: 원본 사진 → 새 인테리어 디자인"""
    try:
        image = decode_image(req.image_base64, req.image_url)

        # 이미지 리사이즈 (512x512 또는 768x768)
        image = image.resize((512, 512), Image.LANCZOS)

        # MLSD 선분 감지 (방 구조 보존)
        control_image = get_mlsd_lines(image)

        # ControlNet + SD로 생성
        pipe = load_remodel_pipeline()
        result = pipe(
            prompt=req.prompt,
            negative_prompt=req.negative_prompt,
            image=control_image,
            num_inference_steps=req.num_inference_steps,
            guidance_scale=req.guidance_scale,
            controlnet_conditioning_scale=1.0 - req.prompt_strength,
        ).images[0]

        result_b64 = encode_image(result)

        return {"image_base64": result_b64}

    except Exception as e:
        logger.error(f"리모델링 오류: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/enhance")
async def enhance(req: EnhanceRequest):
    """사진 보정: 잡동사니 제거, 수평 보정, 반사 제거 등"""
    try:
        image = decode_image(req.image_base64, req.image_url)

        # 이미지 리사이즈
        max_size = 1024
        w, h = image.size
        if max(w, h) > max_size:
            scale = max_size / max(w, h)
            image = image.resize((int(w * scale), int(h * scale)), Image.LANCZOS)

        # SD Inpainting으로 보정
        pipe = load_inpaint_pipeline()

        # 전체 이미지를 약간 수정하는 방식 (마스크 = 전체 흰색)
        w, h = image.size
        mask = Image.new("RGB", (w, h), (255, 255, 255))

        result = pipe(
            prompt=req.prompt,
            image=image,
            mask_image=mask,
            num_inference_steps=50,
            guidance_scale=12,
            strength=0.4,  # 원본 구조 유지하면서 보정
        ).images[0]

        result_b64 = encode_image(result)

        return {"image_base64": result_b64}

    except Exception as e:
        logger.error(f"보정 오류: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# ============================
# 실행
# ============================

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AI 인테리어 GPU 서버")
    parser.add_argument("--host", default="0.0.0.0", help="바인드 호스트 (기본: 0.0.0.0)")
    parser.add_argument("--port", type=int, default=7860, help="포트 (기본: 7860)")
    args = parser.parse_args()

    import uvicorn
    uvicorn.run(app, host=args.host, port=args.port)
