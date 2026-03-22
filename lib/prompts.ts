import type { InteriorStyle, RoomType, EnhanceOption } from '@/types';

const STYLE_PROMPTS: Record<InteriorStyle, string> = {
  modern:
    'modern contemporary interior design with clean lines, neutral colors, sleek furniture, and minimalist decor',
  minimalist:
    'minimalist interior with white walls, simple elegant furniture, lots of natural light, open space',
  scandinavian:
    'scandinavian interior with light wood floors, white and gray palette, cozy textiles, plants, hygge atmosphere',
  industrial:
    'industrial loft style with exposed brick walls, metal elements, concrete floors, Edison bulbs, raw textures',
  japanese:
    'japanese zen interior with tatami, shoji screens, natural materials, wabi-sabi aesthetic, low furniture',
  mediterranean:
    'mediterranean interior with terracotta tiles, arched doorways, warm earth tones, ornate details',
  classic:
    'classic elegant interior with ornate moldings, rich fabrics, traditional furniture, chandeliers',
  bohemian:
    'bohemian interior with colorful patterns, layered textiles, eclectic furniture, plants, artistic decor',
  'art-deco':
    'art deco interior with geometric patterns, gold accents, velvet furniture, glamorous lighting',
  'mid-century':
    'mid-century modern interior with retro furniture, organic curves, teak wood, iconic design pieces',
  coastal:
    'coastal interior with light blue and white palette, natural textures, beach-inspired decor, airy feel',
  farmhouse:
    'farmhouse interior with shiplap walls, rustic wood, vintage decor, cozy warm atmosphere',
};

const ROOM_PROMPTS: Record<RoomType, string> = {
  'living-room': 'spacious living room with comfortable seating, coffee table, entertainment area',
  bedroom: 'cozy bedroom with elegant bed, nightstands, soft ambient lighting',
  kitchen: 'well-equipped kitchen with modern appliances, countertops, organized cabinets',
  bathroom: 'clean bathroom with modern fixtures, vanity, good lighting',
  'dining-room': 'dining room with dining table, chairs, decorative centerpiece',
  office: 'productive home office with desk, ergonomic chair, bookshelves',
  'kids-room': 'fun and colorful kids room with playful furniture, storage, creative space',
  entrance: 'welcoming entrance hallway with shoe storage, mirror, coat hooks',
};

export function buildRemodelPrompt(
  style: InteriorStyle,
  roomType: RoomType,
  colorTheme?: string,
  additionalPrompt?: string
): string {
  let prompt = `A professional interior design photo of a ${ROOM_PROMPTS[roomType]}, ${STYLE_PROMPTS[style]}`;

  if (colorTheme) {
    prompt += `, with a ${colorTheme} color scheme`;
  }
  if (additionalPrompt) {
    prompt += `, ${additionalPrompt}`;
  }

  prompt +=
    ', high quality, 8k resolution, professional real estate photography, well-lit, photorealistic';

  return prompt;
}

export function buildEnhancePrompt(options: EnhanceOption[], additionalNotes?: string): string {
  const instructions: string[] = [];

  if (options.includes('straighten')) {
    instructions.push(
      'Correct the vertical and horizontal perspective to make all walls, edges, and lines perfectly straight and level'
    );
  }
  if (options.includes('perspective')) {
    instructions.push(
      'Transform the perspective of this room photo as if it was taken from directly in front, facing the room straight on. Correct all converging vertical lines to be parallel. Fix keystone distortion so walls appear perfectly vertical. Adjust the viewpoint to simulate a front-facing, eye-level camera position. The result should look like a professional architectural photograph taken with a tilt-shift lens from the ideal centered position'
    );
  }
  if (options.includes('declutter')) {
    instructions.push(
      'Remove all clutter including scattered clothes, shoes, bags, toys, and miscellaneous items. Make the space look clean and organized'
    );
  }
  if (options.includes('remove-reflection')) {
    instructions.push(
      'Remove any reflections of people, cameras, or objects visible in glass surfaces, windows, mirrors, and TV screens'
    );
  }
  if (options.includes('remove-wall-items')) {
    instructions.push(
      'Remove all photos, posters, calendars, clocks, and personal decorations hanging on the walls, leaving clean smooth walls'
    );
  }
  if (options.includes('lighting-fix')) {
    instructions.push(
      'Enhance the lighting to be bright, warm, and professionally balanced throughout the room with no dark corners'
    );
  }
  if (options.includes('color-enhance')) {
    instructions.push(
      'Enhance colors to be vivid, appealing, and well-balanced while maintaining a natural realistic look'
    );
  }

  let prompt = `Professional real estate photo editing. ${instructions.join('. ')}. Keep the room structure, architecture, and overall layout completely intact. The result should look like a high-end professional real estate listing photograph.`;

  if (additionalNotes) {
    prompt += ` Additional instructions: ${additionalNotes}`;
  }

  return prompt;
}
