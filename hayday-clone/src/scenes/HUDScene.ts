import Phaser from 'phaser';
import { GameManager } from '../classes/GameManager';
import { MainScene } from './MainScene';
import type { CropInfo } from '../classes/CropData';
import { CROP_LIST } from '../classes/CropData';
import { UiFactory } from '../classes/UiFactory';

export class HUDScene extends Phaser.Scene {
    private goldText!: Phaser.GameObjects.Text;
    private levelText!: Phaser.GameObjects.Text;
    private xpBarFill!: Phaser.GameObjects.Graphics;
    private xpText!: Phaser.GameObjects.Text;

    // Inventory display
    private inventoryTexts: Map<string, Phaser.GameObjects.Text> = new Map();

    // Crop selector
    private cropButtons: Phaser.GameObjects.Container[] = [];
    private selectedCropIndex: number = 0;
    private scytheBtn!: Phaser.GameObjects.Container;
    private currentMode: 'plant' | 'harvest' = 'plant';

    // Mode button refs
    private plantModeBtn!: Phaser.GameObjects.Container;
    private harvestModeBtn!: Phaser.GameObjects.Container;
    private cropSelectorGroup!: Phaser.GameObjects.Container;

    constructor() {
        super('HUDScene');
    }

    create() {
        const gm = GameManager.instance;

        // ===== TOP BAR =====
        this.createTopBar(gm);

        // ===== INVENTORY PANEL (Right side) =====
        this.createInventoryPanel(gm);

        // ===== BOTTOM TOOL / CROP SELECTOR =====
        this.createBottomBar();

        // ===== INSTRUCTIONS =====
        this.add.text(this.scale.width / 2, this.scale.height - 12, '🖱 Right-click drag to pan  •  Scroll to zoom', {
            fontSize: '11px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5);

        // ===== EVENT LISTENERS =====
        gm.events.on('update-gold', (gold: number) => {
            this.goldText.setText(`${gold}`);
            this.pulseText(this.goldText);
        });

        gm.events.on('update-xp', (xp: number) => {
            this.updateXpBar(xp, gm.getLevel());
            this.xpText.setText(`${xp} XP`);
        });

        gm.events.on('level-up', (level: number) => {
            this.levelText.setText(`${level}`); // Just number inside star
            this.showLevelUpAnimation(level);
            this.updateXpBar(gm.getXp(), level);
        });

        gm.events.on('update-inventory', (data: { itemId: string; quantity: number }) => {
            const text = this.inventoryTexts.get(data.itemId);
            if (text) {
                text.setText(`${data.quantity}`);
                this.pulseText(text);
            }
        });
    }

    // ===========================
    //  TOP BAR
    // ===========================
    private createTopBar(gm: GameManager) {
        // Level Indicator (Star Sprite)
        const starX = 40;
        const starY = 40;
        // Replaced Geometry Star with shiny asset
        this.add.sprite(starX, starY, 'star').setScale(0.15);
        // star.setStrokeStyle(3, 0x000000); // Sprites don't support stroke style directly

        this.levelText = this.add.text(starX, starY, `${gm.getLevel()}`, {
            fontSize: '26px',
            fontFamily: 'Fredoka',
            color: '#FFFFFF',
            stroke: '#3E2723',
            strokeThickness: 4,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // XP Bar
        const xpX = 90;
        const xpY = 28;
        const xpW = 200;
        const xpH = 24;

        const xpBarContainer = UiFactory.createBar(this, xpW, xpH);
        xpBarContainer.setPosition(xpX + xpW / 2, xpY + xpH / 2);
        this.add.existing(xpBarContainer);

        this.xpBarFill = this.add.graphics();
        this.updateXpBar(gm.getXp(), gm.getLevel());

        this.xpText = this.add.text(xpX + xpW / 2, xpY + 12, `${gm.getXp()} XP`, {
            fontSize: '12px',
            fontFamily: 'Fredoka',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Gold Display
        const goldX = this.scale.width - 20;
        const goldY = 40;
        const goldW = 120;
        const goldH = 36;

        const coinBar = UiFactory.createBar(this, goldW, goldH);
        coinBar.setPosition(goldX - goldW / 2, goldY);
        this.add.existing(coinBar);

        // Scale down the giant coin
        this.add.sprite(goldX - goldW + 10, goldY, 'coin_icon').setScale(0.12);

        this.goldText = this.add.text(goldX - 20, goldY, `${gm.getGold()}`, {
            fontSize: '20px',
            fontFamily: 'Fredoka',
            color: '#FFD54F',
            stroke: '#3E2723',
            strokeThickness: 4,
            fontStyle: 'bold'
        }).setOrigin(1, 0.5);

        // Game Logo (Scaled down)
        const centerX = this.scale.width / 2;
        this.add.sprite(centerX, 35, 'logo').setScale(0.25);
    }

    // ===========================
    //  INVENTORY PANEL
    // ===========================
    private createInventoryPanel(gm: GameManager) {
        const panelW = 110;
        const itemH = 34;
        const panelH = 70 + CROP_LIST.length * itemH;

        const panelX = this.scale.width - panelW / 2 - 5;
        const panelY = this.scale.height / 2;

        // Use UiFactory for the wooden panel
        const panel = UiFactory.createPanel(this, panelW, panelH, 'Silo');
        panel.setPosition(panelX, panelY);
        this.add.existing(panel);

        // Calculate start Y relative to panel center
        const contentStartY = -panelH / 2 + 65; // Below title

        CROP_LIST.forEach((crop, i) => {
            const y = contentStartY + i * itemH;

            // Icon
            const icon = this.add.sprite(-30, y, crop.iconTexture).setScale(0.09);
            panel.add(icon);

            // Quantity text
            const qty = gm.getInventoryQuantity(crop.id);
            const text = this.add.text(0, y, `${qty}`, {
                fontSize: '16px',
                fontFamily: 'Fredoka',
                color: UiFactory.COLORS.TEXT_DARK,
                fontStyle: 'bold'
            }).setOrigin(0, 0.5);

            panel.add(text);
            this.inventoryTexts.set(crop.id, text);
        });
    }

    // ... (skipping inventory panel implementation) ...

    // ===========================
    //  BOTTOM BAR
    // ===========================
    private createBottomBar() {
        const centerX = this.scale.width / 2;
        const bottomY = this.scale.height - 40;

        // === Crop Selector (Plant Mode) ===
        this.cropSelectorGroup = this.add.container(0, 0);

        const cropBarW = Math.max(CROP_LIST.length * 70 + 40, 280);
        const barH = 90; // Increased height for "Chunky" look
        const barY = bottomY - 88; // Adjusted Y position

        // Wood Panel Background for crops (Use SeedPanel for parchment look)
        const cropPanel = UiFactory.createSeedPanel(this, cropBarW, barH);
        cropPanel.setPosition(centerX, barY);
        this.cropSelectorGroup.add(cropPanel);

        // Title for selector
        const selectorTitle = this.add.text(centerX, barY - 56, 'Select Crop', {
            fontSize: '14px',
            fontFamily: 'Fredoka',
            color: '#FFFFFF',
            stroke: '#3E2723',
            strokeThickness: 3,
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.cropSelectorGroup.add(selectorTitle);

        CROP_LIST.forEach((crop, i) => {
            const btnX = centerX - ((CROP_LIST.length - 1) * 70) / 2 + i * 70;
            const btn = this.createCropButton(btnX, barY + 4, crop, i);
            this.cropButtons.push(btn);
            this.cropSelectorGroup.add(btn);
        });

        // === Scythe Indicator (Harvest Mode) ===
        this.scytheBtn = this.add.container(centerX, barY);
        const scytheBg = UiFactory.createPanel(this, 160, 74);
        this.scytheBtn.add(scytheBg);

        const scytheIcon = this.add.sprite(0, -10, 'tool_scythe').setScale(1.4);
        this.scytheBtn.add(scytheIcon);
        const scytheText = this.add.text(0, 18, 'Tap Field to Harvest', {
            fontSize: '12px', color: '#ffccbc', stroke: '#000000', strokeThickness: 2, fontStyle: 'bold'
        }).setOrigin(0.5);
        this.scytheBtn.add(scytheText);

        this.scytheBtn.setVisible(false);

        // === Mode Switcher Buttons ===
        this.plantModeBtn = UiFactory.createButton(this, centerX - 90, bottomY, 'SEED BAG', () => {
            this.setMode('plant');
        }, { width: 160, height: 44, color: UiFactory.COLORS.BTN_GREEN_BASE, icon: 'tool_seed', iconScale: 0.12 });

        this.harvestModeBtn = UiFactory.createButton(this, centerX + 90, bottomY, 'SCYTHE', () => {
            this.setMode('harvest');
        }, { width: 160, height: 44, color: UiFactory.COLORS.PARCHMENT_BASE, icon: 'tool_scythe', iconScale: 0.12, strokeColor: UiFactory.COLORS.WOOD_SHADOW });

        this.updateModeHighlight();
    }

    private setMode(mode: 'plant' | 'harvest') {
        this.currentMode = mode;
        const mainScene = this.scene.get('MainScene') as MainScene;
        if (mode === 'plant') {
            mainScene.setTool('seed');
        } else {
            mainScene.setTool('scythe');
        }
        this.updateModeHighlight();
    }

    private updateModeHighlight() {
        const isPlant = this.currentMode === 'plant';

        this.plantModeBtn.setAlpha(isPlant ? 1 : 0.7);
        this.plantModeBtn.setScale(isPlant ? 1.05 : 0.95);

        this.harvestModeBtn.setAlpha(!isPlant ? 1 : 0.7);
        this.harvestModeBtn.setScale(!isPlant ? 1.05 : 0.95);

        // Juiciness: Pop In/Out Logic
        if (isPlant) {
            // Show Crop Selector (Pop In)
            this.scytheBtn.setVisible(false);

            this.cropSelectorGroup.setVisible(true);
            this.cropSelectorGroup.setAlpha(0);
            this.cropSelectorGroup.setScale(0.8);

            this.tweens.add({
                targets: this.cropSelectorGroup,
                alpha: 1,
                scaleX: 1,
                scaleY: 1,
                duration: 500,
                ease: 'Back.easeOut'
            });
        } else {
            // Show Scythe (Pop In)
            this.cropSelectorGroup.setVisible(false);

            this.scytheBtn.setVisible(true);
            this.scytheBtn.setAlpha(0);
            this.scytheBtn.setScale(0.8);

            this.tweens.add({
                targets: this.scytheBtn,
                alpha: 1,
                scaleX: 1,
                scaleY: 1,
                duration: 500,
                ease: 'Back.easeOut'
            });
        }
    }



    private tooltipBg: Phaser.GameObjects.Graphics | null = null;
    private tooltipText: Phaser.GameObjects.Text | null = null;

    private showCropTooltip(x: number, y: number, crop: CropInfo, isLocked: boolean = false) {
        this.hideCropTooltip();
        this.tooltipBg = this.add.graphics();
        this.tooltipBg.fillStyle(0x000000, 0.85);
        this.tooltipBg.fillRoundedRect(x - 60, y - 16, 120, 32, 6);

        let textStr = '';
        let color = '#ffffff';

        if (isLocked) {
            textStr = `🔒 Required Level ${crop.levelRequired}`;
            color = '#ff5252';
        } else {
            const growSec = (crop.growTime / 1000).toFixed(0);
            textStr = `${crop.name} • ${growSec}s • +${crop.xpReward}XP`;
        }

        this.tooltipText = this.add.text(x, y, textStr, {
            fontSize: '10px',
            color: color,
            stroke: '#000000',
            strokeThickness: 1,
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    private hideCropTooltip() {
        if (this.tooltipBg) { this.tooltipBg.destroy(); this.tooltipBg = null; }
        if (this.tooltipText) { this.tooltipText.destroy(); this.tooltipText = null; }
    }

    private updateCropHighlight() {
        this.cropButtons.forEach((btn, i) => {
            const ring = btn.getByName('ring') as Phaser.GameObjects.Graphics;
            ring.setVisible(i === this.selectedCropIndex);
        });
    }



    private createCropButton(x: number, y: number, crop: CropInfo, index: number): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);
        const playerLevel = GameManager.instance.getLevel();
        const isLocked = crop.levelRequired > playerLevel;

        const w = 56;
        const h = 64;

        // Custom "Card" style using UiFactory
        const color = isLocked ? UiFactory.COLORS.WOOD_DARK : UiFactory.COLORS.PARCHMENT_BASE;
        const card = UiFactory.createCard(this, w, h, color);
        container.add(card);

        // Crop icon
        const icon = this.add.sprite(0, -6, crop.iconTexture).setScale(0.09);
        if (isLocked) {
            icon.setTint(0x555555);
            icon.setAlpha(0.6);
        }
        container.add(icon);

        // Label/Lock
        if (isLocked) {
            const lockIcon = this.add.text(0, 18, '🔒', { fontSize: '14px', fontFamily: 'Fredoka' }).setOrigin(0.5);
            container.add(lockIcon);
        } else {
            // Price tag pill
            const tag = this.add.graphics();
            tag.fillStyle(UiFactory.COLORS.WOOD_BASE, 1);
            tag.fillRoundedRect(-24, 12, 48, 16, 8);
            // Phase 9: Cartoon stroke for contrast
            tag.lineStyle(2, UiFactory.COLORS.WOOD_SHADOW, 1);
            tag.strokeRoundedRect(-24, 12, 48, 16, 8);
            container.add(tag);

            const costText = this.add.text(0, 20, `${crop.seedCost}💰`, {
                fontSize: '11px',
                color: '#FFD54F',
                stroke: '#000000',
                strokeThickness: 2,
                fontFamily: 'Fredoka'
            }).setOrigin(0.5);
            container.add(costText);
        }

        // Selection ring
        // We'll overlay a bright green selection frame
        const ring = this.add.graphics();
        ring.lineStyle(3, 0x76FF03, 1); // Bright green
        // Match squircle shape roughly
        const r = Math.min(w, h) / 3.5 + 2;
        ring.strokeRoundedRect(-w / 2 - 2, -h / 2 - 2, w + 4, h + 4, r);
        ring.setName('ring');
        ring.setVisible(index === 0 && !isLocked);
        container.add(ring);

        container.setSize(w, h);
        container.setInteractive({ cursor: 'pointer' });

        container.on('pointerdown', () => {
            if (isLocked) {
                this.tweens.add({
                    targets: container,
                    x: x + 5,
                    duration: 50,
                    yoyo: true,
                    repeat: 2
                });
                return;
            }

            // Bounce
            this.tweens.add({
                targets: container,
                scaleX: 0.9, scaleY: 0.9,
                duration: 50,
                yoyo: true,
                onComplete: () => {
                    this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 100 });
                }
            });

            this.selectedCropIndex = index;
            const mainScene = this.scene.get('MainScene') as MainScene;
            mainScene.setSelectedCrop(crop.id);
            this.updateCropHighlight();
        });

        container.on('pointerover', () => {
            this.tweens.add({ targets: container, y: y - 5, duration: 100, ease: 'Sine.easeOut' });
            this.showCropTooltip(x, y - 60, crop, isLocked);
        });

        container.on('pointerout', () => {
            this.tweens.add({ targets: container, y: y, duration: 100, ease: 'Sine.easeOut' });
            this.hideCropTooltip();
        });

        return container;
    }

    // ===========================
    //  SHARED UTILITIES
    // ===========================
    private updateXpBar(xp: number, level: number) {
        const xpRequired = level * 100;
        const ratio = Math.min(xp / xpRequired, 1);

        // Coords match createTopBar: xpX=90, xpY=28, xpW=200, xpH=24
        // Inner fill: x=92, y=30, h=20
        const fillW = 196;

        this.xpBarFill.clear();
        if (ratio > 0) {
            this.xpBarFill.fillStyle(0x76ff03, 1);
            this.xpBarFill.fillRoundedRect(92, 30, Math.max(fillW * ratio, 8), 20, 6);

            // Gloss
            this.xpBarFill.fillStyle(0xFFFFFF, 0.3);
            this.xpBarFill.fillRoundedRect(92, 30, Math.max(fillW * ratio, 8), 10, { tl: 6, tr: 6, bl: 0, br: 0 });
        }
    }

    private pulseText(text: Phaser.GameObjects.Text) {
        this.tweens.add({
            targets: text,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 150,
            yoyo: true,
            ease: 'Power2'
        });
    }

    private showLevelUpAnimation(level: number) {
        const cx = this.scale.width / 2;
        const cy = this.scale.height / 2;

        const overlay = this.add.rectangle(cx, cy, this.scale.width, this.scale.height, 0x000000, 0.4);

        const star = this.add.sprite(cx, cy, 'star').setScale(0).setAlpha(0);

        const text = this.add.text(cx, cy + 40, `LEVEL ${level}!`, {
            fontSize: '48px',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 6,
            fontStyle: 'bold'
        }).setOrigin(0.5).setAlpha(0).setScale(0.5);

        this.tweens.add({
            targets: star,
            scaleX: 4, scaleY: 4,
            alpha: 1, angle: 360,
            duration: 800,
            ease: 'Elastic.easeOut'
        });

        this.tweens.add({
            targets: text,
            alpha: 1, scaleX: 1, scaleY: 1,
            duration: 600,
            delay: 200,
            ease: 'Back.easeOut'
        });

        this.time.delayedCall(2500, () => {
            this.tweens.add({
                targets: [star, text, overlay],
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    star.destroy();
                    text.destroy();
                    overlay.destroy();
                }
            });
        });
    }
}
