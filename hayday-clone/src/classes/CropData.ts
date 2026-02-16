// Crop Data Definitions - All crop types and their properties

export interface CropInfo {
    id: string;
    name: string;
    emoji: string;
    seedCost: number;
    growTime: number;      // ms - total time from plant to ready
    halfGrowTime: number;  // ms - time from plant to sprout stage
    xpReward: number;
    sellPrice: number;
    harvestYield: number;
    levelRequired: number; // New: Level required to unlock
    // Texture keys (generated in MainScene)
    seedTexture: string;
    sproutTexture: string;
    matureTexture: string;
    iconTexture: string;
    // Color theme for particles and UI
    primaryColor: number;
    secondaryColor: number;
    particleColors: number[];
}

export const CROP_TYPES: Record<string, CropInfo> = {
    wheat: {
        id: 'wheat',
        name: 'Wheat',
        emoji: '🌾',
        seedCost: 1,
        growTime: 5000,
        halfGrowTime: 2500,
        xpReward: 10,
        sellPrice: 3,
        harvestYield: 2,
        levelRequired: 1,
        seedTexture: 'wheat_seed',
        sproutTexture: 'wheat_sprout',
        matureTexture: 'wheat_mature',
        iconTexture: 'icon_wheat', // Updated
        primaryColor: 0xffc107,
        secondaryColor: 0xffb300,
        particleColors: [0xffd700, 0xffc107, 0xffb300],
    },
    corn: {
        id: 'corn',
        name: 'Corn',
        emoji: '🌽',
        seedCost: 2,
        growTime: 8000,
        halfGrowTime: 4000,
        xpReward: 15,
        sellPrice: 5,
        harvestYield: 2,
        levelRequired: 2,
        seedTexture: 'corn_seed',
        sproutTexture: 'corn_sprout',
        matureTexture: 'corn_mature',
        iconTexture: 'icon_corn', // Updated
        primaryColor: 0xffeb3b,
        secondaryColor: 0xcddc39,
        particleColors: [0xffeb3b, 0xcddc39, 0xfdd835],
    },
    carrot: {
        id: 'carrot',
        name: 'Carrot',
        emoji: '🥕',
        seedCost: 2,
        growTime: 6000,
        halfGrowTime: 3000,
        xpReward: 12,
        sellPrice: 4,
        harvestYield: 3,
        levelRequired: 3,
        seedTexture: 'carrot_seed',
        sproutTexture: 'carrot_sprout',
        matureTexture: 'carrot_mature',
        iconTexture: 'icon_carrot', // Updated
        primaryColor: 0xff9800,
        secondaryColor: 0xf57c00,
        particleColors: [0xff9800, 0xf57c00, 0x4caf50],
    },
    tomato: {
        id: 'tomato',
        name: 'Tomato',
        emoji: '🍅',
        seedCost: 3,
        growTime: 10000,
        halfGrowTime: 5000,
        xpReward: 20,
        sellPrice: 7,
        harvestYield: 2,
        levelRequired: 4,
        seedTexture: 'tomato_seed',
        sproutTexture: 'tomato_sprout',
        matureTexture: 'tomato_mature',
        iconTexture: 'icon_tomato', // Updated
        primaryColor: 0xf44336,
        secondaryColor: 0xd32f2f,
        particleColors: [0xf44336, 0xd32f2f, 0x4caf50],
    },
    strawberry: {
        id: 'strawberry',
        name: 'Strawberry',
        emoji: '🍓',
        seedCost: 4,
        growTime: 12000,
        halfGrowTime: 6000,
        xpReward: 25,
        sellPrice: 9,
        harvestYield: 3,
        levelRequired: 5,
        seedTexture: 'strawberry_seed',
        sproutTexture: 'strawberry_sprout',
        matureTexture: 'strawberry_mature',
        iconTexture: 'icon_strawberry', // Updated
        primaryColor: 0xe91e63,
        secondaryColor: 0xc2185b,
        particleColors: [0xe91e63, 0xc2185b, 0xff5252],
    },
};

export const CROP_LIST: CropInfo[] = Object.values(CROP_TYPES);

export function getCropInfo(cropId: string): CropInfo {
    return CROP_TYPES[cropId] || CROP_TYPES.wheat;
}
