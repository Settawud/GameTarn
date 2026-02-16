import Phaser from 'phaser';
import { GameManager } from './GameManager';
import type { CropInfo } from './CropData';
import { getCropInfo } from './CropData';

export const CropState = {
    EMPTY: 'EMPTY',
    PLANTED: 'PLANTED',
    GROWING: 'GROWING',
    READY: 'READY'
} as const;

export type CropStateType = typeof CropState[keyof typeof CropState];

export class CropTile extends Phaser.GameObjects.Container {
    private cropState: CropStateType;
    private groundSprite: Phaser.GameObjects.Sprite;
    private cropSprite: Phaser.GameObjects.Sprite;
    private highlightSprite: Phaser.GameObjects.Sprite;

    public gridX: number;
    public gridY: number;

    private plantedAt: number = 0;
    private cropId: string = 'wheat';
    private cropInfo: CropInfo;

    // For idle sway tween tracking
    private idleSwayTween: Phaser.Tweens.Tween | null = null;

    constructor(scene: Phaser.Scene, x: number, y: number, gridX: number, gridY: number) {
        super(scene, x, y);
        this.gridX = gridX;
        this.gridY = gridY;
        this.cropState = CropState.EMPTY;
        this.cropInfo = getCropInfo('wheat');

        // Ground sprite
        this.groundSprite = scene.add.sprite(0, 0, 'soil');
        this.add(this.groundSprite);

        // Crop sprite (starts hidden, offset up)
        this.cropSprite = scene.add.sprite(0, -14, 'wheat_seed');
        this.cropSprite.setVisible(false);
        this.add(this.cropSprite);

        // Highlight overlay
        this.highlightSprite = scene.add.sprite(0, 0, 'tile_highlight');
        this.highlightSprite.setVisible(false);
        this.add(this.highlightSprite);

        // Interactive area (diamond hitbox)
        this.setSize(64, 32);
        this.setInteractive(new Phaser.Geom.Polygon([
            0, 16,
            32, 0,
            64, 16,
            32, 32
        ]), Phaser.Geom.Polygon.Contains);

        // Hover effects
        this.on('pointerover', () => {
            this.highlightSprite.setVisible(true);
            this.groundSprite.setScale(1.03);
        });
        this.on('pointerout', () => {
            this.highlightSprite.setVisible(false);
            this.groundSprite.setScale(1);
        });
    }

    // --- Persistence ---
    public getPersistenceData(): any {
        return {
            state: this.cropState,
            plantedAt: this.plantedAt,
            cropId: this.cropId,
        };
    }

    public setPersistenceData(data: any): void {
        this.cropState = data.state;
        this.plantedAt = data.plantedAt;
        this.cropId = data.cropId || 'wheat';
        this.cropInfo = getCropInfo(this.cropId);
        this.updateVisuals();
    }

    // --- Update Loop ---
    public preUpdate(_time: number, _delta: number) {
        if (this.cropState === CropState.PLANTED || this.cropState === CropState.GROWING) {
            this.checkGrowth();
        }
    }

    private checkGrowth(): void {
        const elapsed = Date.now() - this.plantedAt;
        if (elapsed >= this.cropInfo.growTime) {
            this.cropState = CropState.READY;
            this.updateVisuals();
        } else if (elapsed >= this.cropInfo.halfGrowTime && this.cropState === CropState.PLANTED) {
            this.cropState = CropState.GROWING;
            this.updateVisuals();
        }
    }

    // --- Interaction ---
    public interact(tool: string, selectedCrop?: string): void {
        if (this.cropState === CropState.EMPTY && tool === 'seed') {
            this.tryPlant(selectedCrop || 'wheat');
        } else if (this.cropState === CropState.READY && tool === 'scythe') {
            this.harvest();
        }
    }

    private tryPlant(cropId: string): void {
        this.cropInfo = getCropInfo(cropId);
        this.cropId = cropId;

        if (GameManager.instance.spendGold(this.cropInfo.seedCost)) {
            this.plant();
        } else {
            this.showFeedback('💰 Not enough gold!', '#ff5252');
        }
    }

    private plant(): void {
        this.cropState = CropState.PLANTED;
        this.plantedAt = Date.now();
        this.updateVisuals();

        // Plant animation
        this.scene.tweens.add({
            targets: this.cropSprite,
            scaleY: { from: 0, to: 0.9 },
            scaleX: { from: 0, to: 0.9 },
            duration: 350,
            ease: 'Back.easeOut'
        });

        this.showFeedback(`-${this.cropInfo.seedCost} 💰`, '#ffd700');
    }

    private harvest(): void {
        const info = this.cropInfo;
        this.cropState = CropState.EMPTY;

        // Economic actions
        GameManager.instance.addToInventory(info.id, info.harvestYield);
        GameManager.instance.addXp(info.xpReward);

        // Kill idle sway if running
        if (this.idleSwayTween) {
            this.idleSwayTween.stop();
            this.idleSwayTween = null;
            this.cropSprite.setAngle(0);
        }

        // === Satisfying Harvest Animation Sequence ===
        // Step 1: Shake the crop
        this.scene.tweens.add({
            targets: this.cropSprite,
            angle: { from: -6, to: 6 },
            duration: 60,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                this.cropSprite.setAngle(0);
                // Step 2: Pop up & fade
                this.scene.tweens.add({
                    targets: this.cropSprite,
                    scaleX: 1.6,
                    scaleY: 1.6,
                    y: this.cropSprite.y - 15,
                    alpha: 0,
                    duration: 350,
                    ease: 'Power2',
                    onComplete: () => {
                        this.cropSprite.setScale(1);
                        this.cropSprite.setAlpha(1);
                        this.cropSprite.y = -14;
                        this.updateVisuals();
                    }
                });
            }
        });

        // Step 3: Particle burst (crop-colored)
        this.showHarvestFX(info);

        // Step 4: Reward popup card
        this.showHarvestPopup(info);
    }

    // --- Visual State Machine ---
    private updateVisuals(): void {
        // Kill idle sway
        if (this.idleSwayTween) {
            this.idleSwayTween.stop();
            this.idleSwayTween = null;
            this.cropSprite.setAngle(0);
        }

        switch (this.cropState) {
            case CropState.EMPTY:
                this.groundSprite.setTexture('soil');
                this.cropSprite.setVisible(false);
                break;
            case CropState.PLANTED:
                this.groundSprite.setTexture('soil');
                this.cropSprite.setTexture(this.cropInfo.seedTexture);
                this.cropSprite.setVisible(true);
                this.cropSprite.setScale(0.9);
                this.cropSprite.setAlpha(1);
                break;
            case CropState.GROWING:
                this.groundSprite.setTexture('soil');
                this.cropSprite.setTexture(this.cropInfo.sproutTexture);
                this.cropSprite.setVisible(true);
                this.cropSprite.setScale(1);
                this.cropSprite.setAlpha(1);
                // Sprout pop animation
                this.scene.tweens.add({
                    targets: this.cropSprite,
                    scaleY: { from: 0.5, to: 1 },
                    duration: 400,
                    ease: 'Bounce.easeOut'
                });
                break;
            case CropState.READY:
                this.groundSprite.setTexture('soil');
                this.cropSprite.setTexture(this.cropInfo.matureTexture);
                this.cropSprite.setVisible(true);
                this.cropSprite.setScale(1.15);
                this.cropSprite.setAlpha(1);
                // Ready bounce animation
                this.scene.tweens.add({
                    targets: this.cropSprite,
                    scaleX: { from: 0.8, to: 1.15 },
                    scaleY: { from: 0.8, to: 1.15 },
                    duration: 500,
                    ease: 'Elastic.easeOut'
                });
                // Subtle idle sway
                this.idleSwayTween = this.scene.tweens.add({
                    targets: this.cropSprite,
                    angle: { from: -2, to: 2 },
                    duration: 1500,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
                break;
        }
    }

    // --- Harvest Reward Popup ---
    private showHarvestPopup(info: CropInfo) {
        const popupX = this.x;
        const popupY = this.y - 40;

        // Background card
        const bg = this.scene.add.sprite(popupX, popupY, 'harvest_popup_bg');
        bg.setAlpha(0).setScale(0.3);

        // Crop icon (large)
        const icon = this.scene.add.sprite(popupX - 30, popupY - 4, info.iconTexture);
        icon.setScale(1.8).setAlpha(0);

        // Yield text
        const yieldText = this.scene.add.text(popupX - 4, popupY - 16, `+${info.harvestYield} ${info.emoji}`, {
            fontSize: '16px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            fontStyle: 'bold'
        }).setOrigin(0, 0.5).setAlpha(0);

        // XP text
        const xpText = this.scene.add.text(popupX - 4, popupY + 8, `+${info.xpReward} XP`, {
            fontSize: '13px',
            color: '#76ff03',
            stroke: '#000000',
            strokeThickness: 2,
            fontStyle: 'bold'
        }).setOrigin(0, 0.5).setAlpha(0);

        // Crop name
        const nameText = this.scene.add.text(popupX, popupY + 24, info.name, {
            fontSize: '10px',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 2,
        }).setOrigin(0.5, 0.5).setAlpha(0);

        // === Animate in ===
        // BG pop
        this.scene.tweens.add({
            targets: bg,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });

        // Icon pop (slightly delayed)
        this.scene.tweens.add({
            targets: icon,
            alpha: 1,
            scaleX: { from: 0.5, to: 1.8 },
            scaleY: { from: 0.5, to: 1.8 },
            duration: 350,
            delay: 100,
            ease: 'Back.easeOut'
        });

        // Text slide in
        this.scene.tweens.add({
            targets: [yieldText, xpText, nameText],
            alpha: 1,
            x: { from: popupX + 10, to: popupX - 4 },
            duration: 300,
            delay: 150,
            ease: 'Power2'
        });

        // Fix nameText position separately
        this.scene.tweens.add({
            targets: nameText,
            x: popupX,
            duration: 300,
            delay: 150,
            ease: 'Power2'
        });

        // === Float up & fade out ===
        this.scene.time.delayedCall(1200, () => {
            this.scene.tweens.add({
                targets: [bg, icon, yieldText, xpText, nameText],
                y: '-=35',
                alpha: 0,
                duration: 500,
                ease: 'Power2',
                onComplete: () => {
                    bg.destroy();
                    icon.destroy();
                    yieldText.destroy();
                    xpText.destroy();
                    nameText.destroy();
                }
            });
        });
    }

    // --- Effects ---
    private showFeedback(message: string, color: string) {
        const text = this.scene.add.text(this.x, this.y - 25, message, {
            fontSize: '14px',
            color: color,
            stroke: '#000000',
            strokeThickness: 3,
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);

        this.scene.tweens.add({
            targets: text,
            y: this.y - 55,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => text.destroy()
        });
    }

    private showHarvestFX(info: CropInfo) {
        // Crop-colored particle burst
        const particles = this.scene.add.particles(this.x, this.y - 10, 'particle_gold', {
            speed: { min: 80, max: 200 },
            scale: { start: 1.2, end: 0 },
            lifespan: 900,
            gravityY: 250,
            quantity: 12,
            tint: info.particleColors,
            angle: { min: -140, max: -40 }
        });

        // Leaf particles
        const leaves = this.scene.add.particles(this.x, this.y - 10, 'particle_leaf', {
            speed: { min: 40, max: 120 },
            scale: { start: 1.8, end: 0 },
            lifespan: 1100,
            gravityY: 80,
            quantity: 6,
            tint: [0x4caf50, 0x66bb6a, 0x81c784]
        });

        // Sparkle ring (extra juice)
        const sparkles = this.scene.add.particles(this.x, this.y - 10, 'particle_gold', {
            speed: { min: 20, max: 60 },
            scale: { start: 0.8, end: 0 },
            lifespan: 600,
            quantity: 6,
            tint: [0xffffff, 0xffd700],
            alpha: { start: 1, end: 0 },
            angle: { min: 0, max: 360 }
        });

        this.scene.time.delayedCall(1000, () => {
            particles.destroy();
            leaves.destroy();
            sparkles.destroy();
        });
    }
}
