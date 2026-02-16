import Phaser from 'phaser';
import { GridManager } from '../classes/GridManager';
import { CropTile } from '../classes/CropTile';
import { OrderManager } from '../classes/OrderManager';
import { OrderBoardUI } from '../classes/OrderBoardUI';
import { SaveManager } from '../classes/SaveManager';

export class MainScene extends Phaser.Scene {
    private gridManager!: GridManager;
    private cropTiles: CropTile[] = [];
    private currentTool: 'seed' | 'scythe' = 'seed';
    private selectedCrop: string = 'wheat';
    private orderManager!: OrderManager;
    private lastInteractTime: number = 0;

    constructor() {
        super('MainScene');
    }

    preload() {
        // Load generated assets
        this.load.image('logo', 'assets/logo.png');
        this.load.image('coin_icon', 'assets/icon_coin.png');
        this.load.image('star', 'assets/icon_star.png');
        this.load.image('tool_scythe', 'assets/tool_scythe.png');
        this.load.image('tool_seed', 'assets/tool_seedbag.png'); // Mapped to 'tool_seed'

        // Load Crop Icons
        this.load.image('icon_wheat', 'assets/icon_wheat.png');
        this.load.image('icon_corn', 'assets/icon_corn.png');
        this.load.image('icon_carrot', 'assets/icon_carrot.png');
        this.load.image('icon_tomato', 'assets/icon_tomato.png');
        this.load.image('icon_strawberry', 'assets/icon_strawberry.png');

        this.generateTextures();
    }

    private generateTextures() {
        const g = this.add.graphics();

        // === GROUND TILE ===
        g.clear();
        g.fillStyle(0x4caf50, 1);
        g.beginPath();
        g.moveTo(32, 0); g.lineTo(64, 16); g.lineTo(32, 32); g.lineTo(0, 16);
        g.closePath(); g.fillPath();
        g.fillStyle(0x66bb6a, 0.6);
        g.beginPath();
        g.moveTo(32, 2); g.lineTo(60, 16); g.lineTo(32, 28); g.lineTo(16, 20);
        g.closePath(); g.fillPath();
        g.fillStyle(0x388e3c, 1);
        g.beginPath();
        g.moveTo(0, 16); g.lineTo(32, 32); g.lineTo(32, 38); g.lineTo(0, 22);
        g.closePath(); g.fillPath();
        g.fillStyle(0x43a047, 1);
        g.beginPath();
        g.moveTo(64, 16); g.lineTo(32, 32); g.lineTo(32, 38); g.lineTo(64, 22);
        g.closePath(); g.fillPath();
        g.lineStyle(1, 0x2e7d32, 0.8);
        g.beginPath();
        g.moveTo(32, 0); g.lineTo(64, 16); g.lineTo(32, 32); g.lineTo(0, 16);
        g.closePath(); g.strokePath();
        g.generateTexture('ground', 64, 40);

        // === PLOWED SOIL ===
        g.clear();
        g.fillStyle(0x795548, 1);
        g.beginPath();
        g.moveTo(32, 0); g.lineTo(64, 16); g.lineTo(32, 32); g.lineTo(0, 16);
        g.closePath(); g.fillPath();
        g.lineStyle(1, 0x5d4037, 0.5);
        for (let i = 0; i < 5; i++) {
            g.beginPath(); g.moveTo(8 + i * 5, 8 + i * 2); g.lineTo(28 + i * 5, 16 + i * 2); g.strokePath();
        }
        g.fillStyle(0x8d6e63, 0.4);
        g.beginPath();
        g.moveTo(32, 4); g.lineTo(56, 14); g.lineTo(32, 24); g.lineTo(20, 18);
        g.closePath(); g.fillPath();
        g.fillStyle(0x4e342e, 1);
        g.beginPath();
        g.moveTo(0, 16); g.lineTo(32, 32); g.lineTo(32, 38); g.lineTo(0, 22);
        g.closePath(); g.fillPath();
        g.fillStyle(0x5d4037, 1);
        g.beginPath();
        g.moveTo(64, 16); g.lineTo(32, 32); g.lineTo(32, 38); g.lineTo(64, 22);
        g.closePath(); g.fillPath();
        g.lineStyle(1, 0x3e2723, 0.6);
        g.beginPath();
        g.moveTo(32, 0); g.lineTo(64, 16); g.lineTo(32, 32); g.lineTo(0, 16);
        g.closePath(); g.strokePath();
        g.generateTexture('soil', 64, 40);

        // =========================================================
        //  WHEAT TEXTURES
        // =========================================================
        // Wheat Seed
        g.clear();
        g.fillStyle(0xa1887f, 0.9);
        g.fillCircle(12, 16, 4); g.fillCircle(24, 12, 4);
        g.fillCircle(18, 22, 4); g.fillCircle(30, 18, 4);
        g.fillStyle(0x8d6e63, 0.6);
        g.fillCircle(12, 16, 2); g.fillCircle(24, 12, 2);
        g.fillCircle(18, 22, 2); g.fillCircle(30, 18, 2);
        g.generateTexture('wheat_seed', 42, 32);

        // Wheat Sprout
        g.clear();
        g.lineStyle(2, 0x558b2f, 1);
        g.beginPath(); g.moveTo(10, 30); g.lineTo(10, 16); g.strokePath();
        g.beginPath(); g.moveTo(21, 30); g.lineTo(21, 12); g.strokePath();
        g.beginPath(); g.moveTo(32, 30); g.lineTo(32, 18); g.strokePath();
        g.fillStyle(0x7cb342, 1);
        g.fillEllipse(10, 14, 8, 6); g.fillEllipse(21, 10, 10, 7);
        g.fillEllipse(32, 16, 8, 6);
        g.fillStyle(0x9ccc65, 0.7);
        g.fillEllipse(10, 13, 5, 4); g.fillEllipse(21, 9, 6, 4);
        g.generateTexture('wheat_sprout', 42, 32);

        // Wheat Mature
        g.clear();
        g.lineStyle(2, 0x689f38, 1);
        g.beginPath(); g.moveTo(6, 36); g.lineTo(6, 10); g.strokePath();
        g.beginPath(); g.moveTo(16, 36); g.lineTo(16, 4); g.strokePath();
        g.beginPath(); g.moveTo(26, 36); g.lineTo(26, 8); g.strokePath();
        g.beginPath(); g.moveTo(36, 36); g.lineTo(36, 12); g.strokePath();
        // Golden wheat heads
        g.fillStyle(0xffc107, 1);
        g.fillEllipse(6, 7, 8, 12); g.fillEllipse(16, 2, 8, 10);
        g.fillEllipse(26, 5, 8, 12); g.fillEllipse(36, 9, 8, 10);
        g.fillStyle(0xffb300, 1);
        g.fillEllipse(6, 7, 5, 8); g.fillEllipse(16, 2, 5, 7);
        g.fillEllipse(26, 5, 5, 8); g.fillEllipse(36, 9, 5, 7);
        // tiny grain lines
        g.lineStyle(1, 0xff8f00, 0.6);
        g.beginPath(); g.moveTo(4, 4); g.lineTo(8, 4); g.strokePath();
        g.beginPath(); g.moveTo(4, 8); g.lineTo(8, 8); g.strokePath();
        g.beginPath(); g.moveTo(14, 0); g.lineTo(18, 0); g.strokePath();
        g.generateTexture('wheat_mature', 44, 38);

        // Wheat Icon - REPLACED BY ASSET
        // (Loaded in preload as icon_wheat)

        // =========================================================
        //  CORN TEXTURES
        // =========================================================
        // Corn Seed
        g.clear();
        g.fillStyle(0xcddc39, 0.9);
        g.fillCircle(12, 16, 5); g.fillCircle(26, 14, 5);
        g.fillCircle(18, 22, 4);
        g.fillStyle(0xc0ca33, 0.6);
        g.fillCircle(12, 16, 2.5); g.fillCircle(26, 14, 2.5);
        g.generateTexture('corn_seed', 42, 32);

        // Corn Sprout
        g.clear();
        g.lineStyle(3, 0x558b2f, 1);
        g.beginPath(); g.moveTo(14, 30); g.lineTo(14, 10); g.strokePath();
        g.beginPath(); g.moveTo(28, 30); g.lineTo(28, 14); g.strokePath();
        // Broad leaves
        g.fillStyle(0x7cb342, 1);
        g.beginPath();
        g.moveTo(14, 14); g.lineTo(6, 10); g.lineTo(14, 18);
        g.closePath(); g.fillPath();
        g.beginPath();
        g.moveTo(14, 16); g.lineTo(22, 12); g.lineTo(14, 20);
        g.closePath(); g.fillPath();
        g.beginPath();
        g.moveTo(28, 18); g.lineTo(22, 14); g.lineTo(28, 22);
        g.closePath(); g.fillPath();
        g.generateTexture('corn_sprout', 42, 32);

        // Corn Mature
        g.clear();
        g.lineStyle(3, 0x558b2f, 1);
        g.beginPath(); g.moveTo(12, 38); g.lineTo(12, 6); g.strokePath();
        g.beginPath(); g.moveTo(30, 38); g.lineTo(30, 10); g.strokePath();
        // Broad corn leaves
        g.fillStyle(0x689f38, 1);
        g.beginPath(); g.moveTo(12, 20); g.lineTo(2, 14); g.lineTo(12, 26); g.closePath(); g.fillPath();
        g.beginPath(); g.moveTo(12, 24); g.lineTo(22, 18); g.lineTo(12, 30); g.closePath(); g.fillPath();
        g.beginPath(); g.moveTo(30, 22); g.lineTo(38, 16); g.lineTo(30, 28); g.closePath(); g.fillPath();
        g.beginPath(); g.moveTo(30, 26); g.lineTo(22, 20); g.lineTo(30, 32); g.closePath(); g.fillPath();
        // Yellow corn cobs
        g.fillStyle(0xffeb3b, 1);
        g.fillRoundedRect(8, 10, 8, 14, 4);
        g.fillRoundedRect(26, 14, 8, 12, 4);
        g.fillStyle(0xfdd835, 1);
        g.fillRoundedRect(9, 11, 6, 12, 3);
        g.fillRoundedRect(27, 15, 6, 10, 3);
        // Corn kernel dots
        g.fillStyle(0xf9a825, 0.6);
        g.fillCircle(12, 14, 1.5); g.fillCircle(12, 18, 1.5); g.fillCircle(12, 22, 1.5);
        g.fillCircle(30, 18, 1.5); g.fillCircle(30, 22, 1.5);
        // Corn silk
        g.lineStyle(1, 0xa1887f, 0.8);
        g.beginPath(); g.moveTo(12, 8); g.lineTo(8, 4); g.strokePath();
        g.beginPath(); g.moveTo(12, 8); g.lineTo(16, 4); g.strokePath();
        g.generateTexture('corn_mature', 44, 40);

        // Corn Icon (HUD)
        g.clear();
        g.lineStyle(2, 0x558b2f, 1);
        g.beginPath(); g.moveTo(12, 28); g.lineTo(12, 6); g.strokePath();
        g.fillStyle(0x689f38, 1);
        g.beginPath(); g.moveTo(12, 18); g.lineTo(6, 14); g.lineTo(12, 22); g.closePath(); g.fillPath();
        g.fillStyle(0xffeb3b, 1);
        g.fillRoundedRect(8, 8, 8, 12, 4);
        g.fillStyle(0xfdd835, 1);
        g.fillRoundedRect(9, 9, 6, 10, 3);
        g.generateTexture('corn_icon', 24, 30);

        // =========================================================
        //  CARROT TEXTURES
        // =========================================================
        // Carrot Seed
        g.clear();
        g.fillStyle(0x4caf50, 0.8);
        g.fillCircle(12, 16, 4); g.fillCircle(24, 14, 4);
        g.fillCircle(18, 22, 3);
        g.fillStyle(0x388e3c, 0.5);
        g.fillCircle(12, 16, 2); g.fillCircle(24, 14, 2);
        g.generateTexture('carrot_seed', 42, 32);

        // Carrot Sprout
        g.clear();
        // Feathery carrot tops
        g.lineStyle(2, 0x66bb6a, 1);
        g.beginPath(); g.moveTo(14, 24); g.lineTo(14, 12); g.strokePath();
        g.beginPath(); g.moveTo(28, 24); g.lineTo(28, 14); g.strokePath();
        g.lineStyle(1, 0x81c784, 1);
        g.beginPath(); g.moveTo(14, 14); g.lineTo(8, 8); g.strokePath();
        g.beginPath(); g.moveTo(14, 14); g.lineTo(20, 8); g.strokePath();
        g.beginPath(); g.moveTo(14, 18); g.lineTo(8, 14); g.strokePath();
        g.beginPath(); g.moveTo(28, 16); g.lineTo(22, 10); g.strokePath();
        g.beginPath(); g.moveTo(28, 16); g.lineTo(34, 10); g.strokePath();
        // Orange tips peeking
        g.fillStyle(0xff9800, 0.6);
        g.fillCircle(14, 26, 3); g.fillCircle(28, 26, 3);
        g.generateTexture('carrot_sprout', 42, 32);

        // Carrot Mature
        g.clear();
        // Lush feathery tops
        g.lineStyle(2, 0x4caf50, 1);
        g.beginPath(); g.moveTo(10, 16); g.lineTo(10, 4); g.strokePath();
        g.beginPath(); g.moveTo(22, 16); g.lineTo(22, 2); g.strokePath();
        g.beginPath(); g.moveTo(34, 16); g.lineTo(34, 6); g.strokePath();
        g.lineStyle(1, 0x66bb6a, 1);
        g.beginPath(); g.moveTo(10, 6); g.lineTo(4, 0); g.strokePath();
        g.beginPath(); g.moveTo(10, 6); g.lineTo(16, 0); g.strokePath();
        g.beginPath(); g.moveTo(10, 10); g.lineTo(4, 6); g.strokePath();
        g.beginPath(); g.moveTo(10, 10); g.lineTo(16, 6); g.strokePath();
        g.beginPath(); g.moveTo(22, 4); g.lineTo(16, 0); g.strokePath();
        g.beginPath(); g.moveTo(22, 4); g.lineTo(28, 0); g.strokePath();
        g.beginPath(); g.moveTo(34, 8); g.lineTo(28, 2); g.strokePath();
        g.beginPath(); g.moveTo(34, 8); g.lineTo(40, 2); g.strokePath();
        // Orange carrot bodies
        g.fillStyle(0xff9800, 1);
        g.beginPath(); g.moveTo(6, 16); g.lineTo(10, 36); g.lineTo(14, 16); g.closePath(); g.fillPath();
        g.beginPath(); g.moveTo(18, 16); g.lineTo(22, 38); g.lineTo(26, 16); g.closePath(); g.fillPath();
        g.beginPath(); g.moveTo(30, 16); g.lineTo(34, 34); g.lineTo(38, 16); g.closePath(); g.fillPath();
        g.fillStyle(0xf57c00, 0.6);
        g.beginPath(); g.moveTo(8, 16); g.lineTo(10, 32); g.lineTo(12, 16); g.closePath(); g.fillPath();
        g.beginPath(); g.moveTo(20, 16); g.lineTo(22, 34); g.lineTo(24, 16); g.closePath(); g.fillPath();
        g.generateTexture('carrot_mature', 44, 40);

        // Carrot Icon - REPLACED BY ASSET
        // (Loaded in preload as icon_carrot)

        // =========================================================
        //  TOMATO TEXTURES
        // =========================================================
        // Tomato Seed
        g.clear();
        g.fillStyle(0x8d6e63, 0.8);
        g.fillCircle(12, 16, 3); g.fillCircle(24, 14, 3);
        g.fillCircle(18, 22, 3); g.fillCircle(30, 20, 3);
        g.fillStyle(0xa1887f, 0.5);
        g.fillCircle(12, 15, 1.5); g.fillCircle(24, 13, 1.5);
        g.generateTexture('tomato_seed', 42, 32);

        // Tomato Sprout
        g.clear();
        g.lineStyle(2, 0x4caf50, 1);
        g.beginPath(); g.moveTo(14, 28); g.lineTo(14, 12); g.strokePath();
        g.beginPath(); g.moveTo(28, 28); g.lineTo(28, 14); g.strokePath();
        // Classic tomato leaves
        g.fillStyle(0x66bb6a, 1);
        g.fillEllipse(10, 14, 10, 6); g.fillEllipse(18, 12, 10, 6);
        g.fillEllipse(24, 16, 10, 6); g.fillEllipse(32, 14, 10, 6);
        // Tiny green buds
        g.fillStyle(0x81c784, 1);
        g.fillCircle(14, 10, 3); g.fillCircle(28, 12, 3);
        g.generateTexture('tomato_sprout', 42, 32);

        // Tomato Mature
        g.clear();
        // Stems & leaves
        g.lineStyle(2, 0x558b2f, 1);
        g.beginPath(); g.moveTo(10, 22); g.lineTo(10, 6); g.strokePath();
        g.beginPath(); g.moveTo(24, 22); g.lineTo(24, 4); g.strokePath();
        g.beginPath(); g.moveTo(36, 24); g.lineTo(36, 8); g.strokePath();
        g.fillStyle(0x689f38, 1);
        g.fillEllipse(6, 8, 8, 5); g.fillEllipse(14, 6, 8, 5);
        g.fillEllipse(20, 6, 8, 5); g.fillEllipse(28, 6, 8, 5);
        g.fillEllipse(32, 10, 8, 5); g.fillEllipse(40, 8, 8, 5);
        // Big red tomatoes
        g.fillStyle(0xf44336, 1);
        g.fillCircle(10, 28, 9); g.fillCircle(24, 26, 10); g.fillCircle(36, 30, 8);
        // Highlight (shine)
        g.fillStyle(0xef5350, 0.8);
        g.fillCircle(8, 25, 4); g.fillCircle(22, 23, 5); g.fillCircle(34, 27, 3);
        g.fillStyle(0xffffff, 0.25);
        g.fillCircle(7, 24, 2); g.fillCircle(21, 22, 2.5);
        // Stem caps
        g.fillStyle(0x558b2f, 1);
        g.fillEllipse(10, 20, 8, 4); g.fillEllipse(24, 17, 9, 4); g.fillEllipse(36, 23, 7, 4);
        g.generateTexture('tomato_mature', 48, 40);

        // Tomato Icon - REPLACED BY ASSET
        // (Loaded in preload as icon_tomato)

        // =========================================================
        //  STRAWBERRY TEXTURES
        // =========================================================
        // Strawberry Seed
        g.clear();
        g.fillStyle(0x795548, 0.7);
        g.fillCircle(12, 16, 3); g.fillCircle(24, 14, 3);
        g.fillCircle(18, 22, 3);
        g.fillStyle(0xa1887f, 0.5);
        g.fillCircle(12, 15, 1.5); g.fillCircle(24, 13, 1.5);
        g.generateTexture('strawberry_seed', 42, 32);

        // Strawberry Sprout
        g.clear();
        g.lineStyle(2, 0x4caf50, 1);
        g.beginPath(); g.moveTo(14, 28); g.lineTo(14, 14); g.strokePath();
        g.beginPath(); g.moveTo(28, 28); g.lineTo(28, 16); g.strokePath();
        // Rounded leaves
        g.fillStyle(0x66bb6a, 1);
        g.fillCircle(10, 14, 5); g.fillCircle(18, 12, 5);
        g.fillCircle(24, 16, 5); g.fillCircle(32, 14, 5);
        g.fillStyle(0x81c784, 0.6);
        g.fillCircle(10, 13, 3); g.fillCircle(18, 11, 3);
        g.generateTexture('strawberry_sprout', 42, 32);

        // Strawberry Mature
        g.clear();
        // Low-growing stems
        g.lineStyle(2, 0x4caf50, 1);
        g.beginPath(); g.moveTo(10, 14); g.lineTo(10, 6); g.strokePath();
        g.beginPath(); g.moveTo(24, 12); g.lineTo(24, 4); g.strokePath();
        g.beginPath(); g.moveTo(38, 14); g.lineTo(38, 8); g.strokePath();
        // Leaves
        g.fillStyle(0x66bb6a, 1);
        g.fillEllipse(6, 8, 10, 6); g.fillEllipse(14, 6, 10, 6);
        g.fillEllipse(20, 6, 8, 5); g.fillEllipse(28, 6, 10, 6);
        g.fillEllipse(34, 10, 8, 5); g.fillEllipse(42, 8, 8, 5);
        // Heart-shaped strawberries (triangular approximation)
        g.fillStyle(0xe91e63, 1);
        // Berry 1
        g.fillCircle(8, 20, 6); g.fillCircle(14, 20, 6);
        g.beginPath(); g.moveTo(4, 22); g.lineTo(11, 34); g.lineTo(18, 22); g.closePath(); g.fillPath();
        // Berry 2
        g.fillCircle(22, 18, 7); g.fillCircle(28, 18, 7);
        g.beginPath(); g.moveTo(17, 20); g.lineTo(25, 36); g.lineTo(33, 20); g.closePath(); g.fillPath();
        // Berry 3
        g.fillCircle(36, 20, 5); g.fillCircle(41, 20, 5);
        g.beginPath(); g.moveTo(33, 22); g.lineTo(38, 32); g.lineTo(44, 22); g.closePath(); g.fillPath();
        // Seeds/dots on berries
        g.fillStyle(0xffeb3b, 0.7);
        g.fillCircle(10, 22, 1); g.fillCircle(12, 26, 1); g.fillCircle(8, 26, 1);
        g.fillCircle(23, 22, 1); g.fillCircle(27, 22, 1); g.fillCircle(25, 27, 1);
        g.fillCircle(38, 24, 1); g.fillCircle(40, 22, 1);
        // Shine
        g.fillStyle(0xf48fb1, 0.5);
        g.fillCircle(7, 18, 3); g.fillCircle(21, 16, 3); g.fillCircle(35, 18, 2);
        // Stem caps
        g.fillStyle(0x388e3c, 1);
        g.fillEllipse(11, 16, 8, 4); g.fillEllipse(25, 14, 10, 4); g.fillEllipse(39, 16, 7, 4);
        g.generateTexture('strawberry_mature', 48, 38);

        // Strawberry Icon
        g.clear();
        g.fillStyle(0xe91e63, 1);
        g.fillCircle(9, 14, 6); g.fillCircle(15, 14, 6);
        g.beginPath(); g.moveTo(5, 16); g.lineTo(12, 28); g.lineTo(19, 16); g.closePath(); g.fillPath();
        g.fillStyle(0xffeb3b, 0.7);
        g.fillCircle(10, 16, 1); g.fillCircle(14, 16, 1); g.fillCircle(12, 20, 1);
        g.fillStyle(0xf48fb1, 0.5);
        g.fillCircle(9, 12, 3);
        g.fillStyle(0x388e3c, 1);
        g.fillEllipse(12, 10, 10, 4);
        g.lineStyle(2, 0x388e3c, 1);
        g.beginPath(); g.moveTo(12, 10); g.lineTo(12, 4); g.strokePath();
        g.generateTexture('strawberry_icon', 24, 30);

        // =========================================================
        //  SHARED TEXTURES (trees, fence, UI, particles)
        // =========================================================
        // Tree
        g.clear();
        g.fillStyle(0x5d4037, 1);
        g.fillRect(12, 30, 8, 20);
        g.fillStyle(0x2e7d32, 1);
        g.fillCircle(16, 20, 16);
        g.fillStyle(0x388e3c, 1);
        g.fillCircle(16, 16, 14);
        g.fillStyle(0x43a047, 0.8);
        g.fillCircle(12, 12, 8);
        g.fillCircle(22, 14, 7);
        g.generateTexture('tree', 32, 50);

        // Fence
        g.clear();
        g.fillStyle(0x8d6e63, 1);
        g.fillRect(2, 0, 4, 20);
        g.fillStyle(0x795548, 1);
        g.fillRect(0, 4, 8, 3);
        g.fillRect(0, 12, 8, 3);
        g.generateTexture('fence', 8, 20);

        // Coin
        // (Loaded in preload)

        // Star
        // (Loaded in preload)

        // Panel BG
        g.clear();
        g.fillStyle(0x6d4c41, 1);
        g.fillRoundedRect(0, 0, 200, 50, 8);
        g.fillStyle(0x8d6e63, 1);
        g.fillRoundedRect(2, 2, 196, 46, 6);
        g.lineStyle(2, 0x4e342e, 0.8);
        g.strokeRoundedRect(0, 0, 200, 50, 8);
        g.generateTexture('panel_bg', 200, 50);

        // Tool Seed Bag
        // (Loaded in preload)

        // Scythe
        // (Loaded in preload)

        // Order Board (World Object) - Phase 8 Sun-Soaked
        g.clear();
        // Posts (Dark Wood - Persimmon)
        g.fillStyle(0xE65100, 1);
        g.fillRect(8, 0, 6, 55);
        g.fillRect(36, 0, 6, 55);

        // Board Base (Wood - Apricot)
        g.fillStyle(0xFFB74D, 1);
        g.fillRoundedRect(0, 10, 50, 40, 4);
        g.lineStyle(2, 0xBF360C, 1); // Stroke - Deep Red Brown
        g.strokeRoundedRect(0, 10, 50, 40, 4);

        // Inner Recess (Darker - Deep Red Brown)
        g.fillStyle(0xBF360C, 1);
        g.fillRoundedRect(4, 14, 42, 32, 2);

        // Papers (Parchment orders pinned)
        // Paper 1
        g.fillStyle(0xfff9c4, 1);
        g.fillRect(8, 18, 14, 10);
        g.fillStyle(0x000000, 0.2); // Text lines
        g.fillRect(10, 20, 10, 1); g.fillRect(10, 23, 8, 1);
        // Paper 2
        g.fillStyle(0xfff9c4, 1);
        g.fillRect(26, 20, 12, 12);
        g.fillStyle(0x000000, 0.2);
        g.fillRect(28, 22, 8, 1); g.fillRect(28, 25, 6, 1);
        // Paper 3 (Pinned overlap)
        g.fillStyle(0xffecb3, 1);
        g.fillRect(16, 30, 18, 12);
        g.fillStyle(0x000000, 0.2);
        g.fillRect(18, 33, 14, 1); g.fillRect(18, 36, 10, 1);

        // Red Pin
        g.fillStyle(0xd32f2f, 1);
        g.fillCircle(25, 31, 1.5);

        // Header / Roof (Deep Red Brown)
        g.fillStyle(0xBF360C, 1);
        g.beginPath();
        g.moveTo(-4, 10);
        g.lineTo(54, 10);
        g.lineTo(25, 2);
        g.closePath();
        g.fillPath();

        g.generateTexture('order_board', 55, 60);

        // Highlight
        g.clear();
        g.lineStyle(2, 0xffffff, 0.8);
        g.beginPath();
        g.moveTo(32, 0); g.lineTo(64, 16); g.lineTo(32, 32); g.lineTo(0, 16);
        g.closePath(); g.strokePath();
        g.fillStyle(0xffffff, 0.15);
        g.beginPath();
        g.moveTo(32, 0); g.lineTo(64, 16); g.lineTo(32, 32); g.lineTo(0, 16);
        g.closePath(); g.fillPath();
        g.generateTexture('tile_highlight', 64, 32);

        // Particles
        g.clear();
        g.fillStyle(0xffeb3b, 1);
        g.fillCircle(4, 4, 4);
        g.generateTexture('particle_gold', 8, 8);

        g.clear();
        g.fillStyle(0x4caf50, 1);
        g.fillCircle(3, 3, 3);
        g.generateTexture('particle_leaf', 6, 6);

        // Harvest reward popup background
        g.clear();
        g.fillStyle(0x000000, 0.55);
        g.fillRoundedRect(0, 0, 120, 70, 12);
        g.lineStyle(2, 0xffd700, 0.6);
        g.strokeRoundedRect(1, 1, 118, 68, 12);
        g.generateTexture('harvest_popup_bg', 120, 70);

        g.destroy();
    }

    create() {
        this.input.mouse?.disableContextMenu();

        const mapWidth = 8;
        const mapHeight = 8;

        this.gridManager = new GridManager(this, mapWidth, mapHeight);

        // --- BACKGROUND ENVIRONMENT ---
        this.createEnvironment();

        // --- FARM GRID ---
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2 - 40;

        // Surrounding grass (decoration)
        for (let x = -2; x < mapWidth + 2; x++) {
            for (let y = -2; y < mapHeight + 2; y++) {
                if (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight) continue;
                const pos = this.gridManager.cartesianToIsometric(x, y);
                const grass = this.add.sprite(centerX + pos.x, centerY + pos.y, 'ground');
                grass.setAlpha(0.7);
            }
        }

        // Farmable tiles
        for (let x = 0; x < mapWidth; x++) {
            for (let y = 0; y < mapHeight; y++) {
                const pos = this.gridManager.cartesianToIsometric(x, y);
                const tileX = centerX + pos.x;
                const tileY = centerY + pos.y;

                const tile = new CropTile(this, tileX, tileY, x, y);
                this.add.existing(tile);
                this.cropTiles.push(tile);
                this.gridManager.registerTile(x, y, tile);

                tile.on('pointerdown', () => {
                    this.interactWithTile(tile);
                });

                tile.on('pointerover', () => {
                    if (this.input.activePointer.isDown && this.input.activePointer.button === 0) {
                        this.interactWithTile(tile);
                    }
                });
            }
        }

        // --- DECORATIONS ---
        this.addDecorations(centerX, centerY, mapWidth, mapHeight);

        // --- CAMERA ---
        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (pointer.isDown && pointer.buttons === 2) {
                this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x) / this.cameras.main.zoom;
                this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y) / this.cameras.main.zoom;
            }
        });

        this.input.on('wheel', (_p: Phaser.Input.Pointer, _go: any, _dx: number, dy: number, _dz: number) => {
            const zoom = this.cameras.main.zoom - dy * 0.001;
            this.cameras.main.setZoom(Phaser.Math.Clamp(zoom, 0.5, 3));
        });

        // --- HUD ---
        this.scene.launch('HUDScene');

        // --- ORDER BOARD ---
        this.orderManager = new OrderManager();
        const boardPos = this.gridManager.cartesianToIsometric(-2, mapHeight / 2);
        const orderBoard = new OrderBoardUI(this, centerX + boardPos.x - 20, centerY + boardPos.y, this.orderManager);
        this.add.existing(orderBoard);

        // --- PERSISTENCE ---
        const loaded = SaveManager.loadGame(this.gridManager);
        if (!loaded) {
            console.log('No save found, starting fresh game.');
        }
        this.time.addEvent({
            delay: 10000,
            callback: () => SaveManager.saveGame(this.gridManager),
            loop: true
        });
    }

    private interactWithTile(tile: CropTile) {
        const now = Date.now();
        if (now - this.lastInteractTime < 150) return;
        this.lastInteractTime = now;
        tile.interact(this.currentTool, this.selectedCrop);
    }

    private createEnvironment() {
        const w = this.scale.width;
        const h = this.scale.height;

        const skyGradient = this.add.graphics();
        skyGradient.fillGradientStyle(0x87ceeb, 0x87ceeb, 0x4fc3f7, 0x4fc3f7, 1);
        skyGradient.fillRect(-2000, -2000, 6000, 3000);
        skyGradient.setScrollFactor(0.1);

        const hills = this.add.graphics();
        hills.fillStyle(0x66bb6a, 0.4);
        hills.beginPath();
        hills.moveTo(-200, h * 0.4);
        for (let i = 0; i < w + 400; i += 100) {
            hills.lineTo(i, h * 0.35 + Math.sin(i * 0.01) * 30);
        }
        hills.lineTo(w + 200, h);
        hills.lineTo(-200, h);
        hills.closePath();
        hills.fillPath();
        hills.setScrollFactor(0.3);

        const ground = this.add.graphics();
        ground.fillStyle(0x81c784, 1);
        ground.fillRect(-2000, -2000, 6000, 6000);
        ground.setDepth(-10);
    }

    private addDecorations(centerX: number, centerY: number, mapW: number, mapH: number) {
        const treePositions = [
            { x: -3, y: -1 }, { x: -3, y: 2 }, { x: -3, y: 5 },
            { x: mapW + 1, y: 0 }, { x: mapW + 1, y: 3 }, { x: mapW + 1, y: 6 },
            { x: 1, y: -3 }, { x: 4, y: -3 },
            { x: 2, y: mapH + 1 }, { x: 5, y: mapH + 1 },
        ];

        treePositions.forEach(tp => {
            const pos = this.gridManager.cartesianToIsometric(tp.x, tp.y);
            const tree = this.add.sprite(centerX + pos.x, centerY + pos.y - 25, 'tree');
            tree.setScale(1 + Math.random() * 0.5);
            tree.setAlpha(0.9);
        });

        for (let i = -1; i <= mapH; i++) {
            const pos = this.gridManager.cartesianToIsometric(-1, i);
            const fence = this.add.sprite(centerX + pos.x + 16, centerY + pos.y - 5, 'fence');
            fence.setScale(1.2);
        }
    }

    // Called by HUDScene
    public setTool(tool: 'seed' | 'scythe') {
        this.currentTool = tool;
    }

    public setSelectedCrop(cropId: string) {
        this.selectedCrop = cropId;
    }

    public getCurrentTool(): 'seed' | 'scythe' {
        return this.currentTool;
    }

    public getSelectedCrop(): string {
        return this.selectedCrop;
    }

    update(time: number, delta: number) {
        this.cropTiles.forEach(tile => tile.preUpdate(time, delta));
    }
}
