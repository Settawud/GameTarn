import Phaser from 'phaser';
import { OrderManager, type Order } from './OrderManager';
import { GameManager } from './GameManager';
import { getCropInfo } from './CropData';
import { UiFactory } from './UiFactory';

export class OrderBoardUI extends Phaser.GameObjects.Container {
    private orderManager: OrderManager;
    private modalContainer: Phaser.GameObjects.Container | null = null;
    private hudScene: Phaser.Scene | null = null;

    constructor(scene: Phaser.Scene, x: number, y: number, orderManager: OrderManager) {
        super(scene, x, y);
        this.orderManager = orderManager;

        // Board sprite in the world
        const board = scene.add.sprite(0, 0, 'order_board').setScale(1.3);
        board.setInteractive({ cursor: 'pointer' });
        board.on('pointerdown', () => this.showOrderModal());
        this.add(board);

        // Floating label
        const label = scene.add.text(0, 30, '📋 Orders', {
            fontSize: '11px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add(label);

        // Hover effect
        board.on('pointerover', () => {
            scene.tweens.add({
                targets: board,
                scaleX: 1.45,
                scaleY: 1.45,
                duration: 150
            });
        });
        board.on('pointerout', () => {
            scene.tweens.add({
                targets: board,
                scaleX: 1.3,
                scaleY: 1.3,
                duration: 150
            });
        });
    }

    private showOrderModal() {
        if (this.modalContainer) {
            this.modalContainer.destroy();
            this.modalContainer = null;
        }

        // Get HUD scene for camera-fixed modal
        this.hudScene = this.scene.scene.get('HUDScene');
        if (!this.hudScene) return;

        const w = this.hudScene.scale.width;
        const h = this.hudScene.scale.height;
        const cx = w / 2;
        const cy = h / 2;

        this.modalContainer = this.hudScene.add.container(cx, cy);
        this.modalContainer.setDepth(2000);

        // Dark overlay
        const overlay = this.hudScene.add.rectangle(0, 0, w, h, 0x000000, 0.5);
        overlay.setInteractive(); // Block clicks below
        this.modalContainer.add(overlay);

        // Wooden panel via UiFactory
        const panelW = 420;
        const panelH = 380;
        const panel = UiFactory.createPanel(this.hudScene, panelW, panelH, 'Order Board');
        this.modalContainer.add(panel);

        // Close button
        const closeBtn = UiFactory.createButton(this.hudScene, panelW / 2 - 30, -panelH / 2 + 25, '✕', () => {
            this.hideOrderModal();
        }, { width: 44, height: 44, color: UiFactory.COLORS.BTN_RED_BASE, fontSize: '20px' });
        this.modalContainer.add(closeBtn);

        // Render orders
        this.renderOrders(panelW, panelH);

        // Animate in
        this.modalContainer.setScale(0.8);
        this.modalContainer.setAlpha(0);
        this.hudScene.tweens.add({
            targets: this.modalContainer,
            scaleX: 1,
            scaleY: 1,
            alpha: 1,
            duration: 250,
            ease: 'Back.easeOut'
        });
    }

    private hideOrderModal() {
        if (!this.modalContainer || !this.hudScene) return;

        this.hudScene.tweens.add({
            targets: this.modalContainer,
            scaleX: 0.8,
            scaleY: 0.8,
            alpha: 0,
            duration: 200,
            ease: 'Power2',
            onComplete: () => {
                this.modalContainer?.destroy();
                this.modalContainer = null;
            }
        });
    }

    private renderOrders(panelW: number, panelH: number) {
        if (!this.hudScene || !this.modalContainer) return;

        const orders = this.orderManager.getOrders();
        const startY = -panelH / 2 + 70;
        const slotH = 90;

        orders.forEach((order, index) => {
            const y = startY + index * (slotH + 10);
            this.createOrderSlot(order, y, panelW);
        });
    }

    private createOrderSlot(order: Order, y: number, panelW: number) {
        if (!this.hudScene || !this.modalContainer) return;

        const slotW = panelW - 40;

        // Slot Container
        const slotContainer = this.hudScene.add.container(0, 0);
        this.modalContainer.add(slotContainer);

        // Parchment slot background
        const slotBg = this.hudScene.add.graphics();
        // Shadow
        slotBg.fillStyle(0x000000, 0.1);
        slotBg.fillRoundedRect(-slotW / 2 + 2, y - 3, slotW, 80, 8);

        // Base
        slotBg.fillStyle(UiFactory.COLORS.PARCHMENT_BASE, 1);
        slotBg.fillRoundedRect(-slotW / 2, y - 5, slotW, 80, 8);

        // Stroke
        slotBg.lineStyle(1, 0x8d6e63, 0.5);
        slotBg.strokeRoundedRect(-slotW / 2, y - 5, slotW, 80, 8);

        // Divider line (dashed)
        // ... (optional, skipping for simplicity)

        slotContainer.add(slotBg);

        // Requirements
        let reqX = -slotW / 2 + 30;
        const reqY = y + 25;

        order.requirements.forEach(req => {
            if (!this.hudScene || !this.modalContainer) return;

            const cropInfo = getCropInfo(req.itemId);
            const have = GameManager.instance.getInventoryQuantity(req.itemId);
            const isEnough = have >= req.quantity;

            // Icon background bubble
            const iconBg = this.hudScene.add.circle(reqX, reqY, 22, isEnough ? 0xdcedc8 : 0xffcdd2);
            slotContainer.add(iconBg);

            // Crop Icon
            const icon = this.hudScene.add.sprite(reqX, reqY, cropInfo.iconTexture).setScale(0.09);
            slotContainer.add(icon);

            // Quantity text
            const qtyStr = `${have}/${req.quantity}`;
            const qtyText = this.hudScene.add.text(reqX + 12, reqY + 14, qtyStr, {
                fontSize: '11px',
                color: isEnough ? '#33691e' : '#b71c1c',
                stroke: '#ffffff',
                strokeThickness: 3,
                fontStyle: 'bold'
            }).setOrigin(0, 0.5);
            slotContainer.add(qtyText);

            reqX += 60; // Spacing
        });

        // Reward 
        const rewardText = this.hudScene.add.text(slotW / 2 - 80, y - 25, `${order.rewardGold}💰  ${order.rewardXp}⭐`, {
            fontSize: '14px',
            color: '#558b2f',
            fontStyle: 'bold',
            stroke: '#ffffff',
            strokeThickness: 2
        }).setOrigin(0.5);
        slotContainer.add(rewardText);

        // Deliver button
        const canDeliver = order.requirements.every(req =>
            GameManager.instance.getInventoryQuantity(req.itemId) >= req.quantity
        );

        const btnX = slotW / 2 - 55;
        const btnY = y + 32;

        const deliverBtn = UiFactory.createButton(this.hudScene, btnX, btnY, canDeliver ? 'DELIVER' : 'WAIT', () => {
            if (canDeliver) {
                const success = this.orderManager.completeOrder(order.id);
                if (success) {
                    this.hideOrderModal();
                    this.scene.time.delayedCall(300, () => this.showOrderModal());
                }
            }
        }, {
            width: 90,
            height: 36,
            fontSize: '12px',
            color: canDeliver ? UiFactory.COLORS.BTN_GREEN_BASE : 0x9e9e9e,
            strokeColor: canDeliver ? UiFactory.COLORS.BTN_GREEN_STROKE : 0x616161,
            // If not deliverable, maybe no callback? UiFactory adds one anyway.
            // We handle logic inside.
        });

        if (!canDeliver) {
            deliverBtn.setAlpha(0.7);
        }

        slotContainer.add(deliverBtn);
    }
}
