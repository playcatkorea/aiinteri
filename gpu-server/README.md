# GPU 서버 설정 가이드

자체 GPU PC에서 AI 모델을 실행하기 위한 서버 구성 가이드입니다.

## 필수 사양

- **GPU**: NVIDIA RTX 3060 12GB 이상 (VRAM 최소 8GB)
- **RAM**: 16GB 이상
- **Python**: 3.10+
- **CUDA**: 11.8+ / 12.x

## 빠른 시작

### 1. 환경 설정

```bash
cd gpu-server
pip install -r requirements.txt
```

### 2. 서버 실행

```bash
python server.py
# 기본 포트: 7860
```

### 3. Next.js 앱 연결

`.env.local` 파일 수정:
```
AI_BACKEND_MODE=gpu
GPU_API_URL=http://your-gpu-pc-ip:7860
```

## API 엔드포인트

### POST /api/remodel
인테리어 리모델링 (ControlNet + Stable Diffusion)

```json
{
  "image_base64": "base64_encoded_image",
  "prompt": "modern scandinavian living room...",
  "negative_prompt": "lowres, watermark...",
  "prompt_strength": 0.8,
  "guidance_scale": 15,
  "num_inference_steps": 50
}
```

응답:
```json
{
  "image_base64": "base64_encoded_result",
  "seed": 12345
}
```

### POST /api/enhance
사진 보정 (Inpainting + img2img)

```json
{
  "image_base64": "base64_encoded_image",
  "prompt": "Professional real estate photo editing..."
}
```

### GET /api/health
서버 상태 확인

응답:
```json
{
  "status": "ok",
  "gpu": "NVIDIA RTX 4090",
  "vram_total": 24576,
  "vram_used": 8192,
  "models": ["stable-diffusion-v1.5-inpainting", "controlnet-mlsd"]
}
```

## 권장 모델

| 용도 | 모델 | VRAM |
|------|------|------|
| 인테리어 리모델링 | Realistic Vision V3.0 + ControlNet MLSD | ~6GB |
| 잡동사니 제거 | LaMa (Large Mask Inpainting) | ~2GB |
| 범용 인페인팅 | Stable Diffusion Inpainting V1.5 | ~4GB |
| 고품질 생성 | SDXL + ControlNet | ~10GB |

## 대안 서버

이 예제 서버 대신 아래 도구의 API 모드를 사용해도 됩니다:

- **ComfyUI** (권장): `python main.py --listen 0.0.0.0 --port 7860`
- **Automatic1111 WebUI**: `python launch.py --api --listen`
- **InvokeAI**: `invokeai-web --host 0.0.0.0`

해당 서버 사용 시 `gpu-api.ts`의 엔드포인트 경로를 맞게 수정하세요.
