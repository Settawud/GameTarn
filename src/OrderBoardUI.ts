import Phaser from 'phaser';
import { OrderManager, Order } from './OrderManager';
import { GameManager } from './GameManager';

export class OrderBoardUI extends Phaser.GameObjects.Container {
    private orderManager: OrderManager;
    private orderContainer: Phaser.GameObjects.Container;

    constructor(scene: Phaser.Scene, x: number, y: number, orderManager: OrderManager) {
        super(scene, x, y);
        this.orderManager = orderManager;

        // Board Visual (Clickable object in the world)
        const boardSprite = scene.add.rectangle(0, 0, 60, 40, 0x8b4513);
        boardSprite.setStrokeStyle(2, 0x5c2e0e);
        boardSprite.setInteractive({ cursor: 'pointer' });
        boardSprite.on('pointerdown', () => this.showOrderModal());
        this.add(boardSprite);

        const boardText = scene.add.text(-20, -10, 'Orders', { fontSize: '12px', color: '#ffffff' });
        this.add(boardText);

        // Modal Container (Hidden by default, centered on screen)
        // We add this to the scene directly so it renders on top of everything
        this.orderContainer = scene.add.container(scene.cameras.main.width / 2, scene.cameras.main.height / 2);
        this.orderContainer.setVisible(false);
        this.orderContainer.setDepth(1000); // High depth to be on top

        this.createModalBackground();
    }

    private createModalBackground() {
        const bg = this.scene.add.rectangle(0, 0, 500, 400, 0xffffff);
        bg.setStrokeStyle(4, 0x000000);
        this.orderContainer.add(bg);

        const title = this.scene.add.text(-230, -180, 'Order Board', { fontSize: '24px', color: '#000', fontStyle: 'bold' });
        this.orderContainer.add(title);

        const closeBtn = this.scene.add.text(220, -190, 'X', { color: 'red', fontSize: '28px', fontStyle: 'bold' })
            .setInteractive({ cursor: 'pointer' })
            .on('pointerdown', () => this.hideOrderModal());
        this.orderContainer.add(closeBtn);
    }

    private showOrderModal() {
        this.orderContainer.setVisible(true);
        this.refreshOrders();
    }

    private hideOrderModal() {
        this.orderContainer.setVisible(false);
    }

    private refreshOrders() {
        // Clear previous entries (by name)
        this.orderContainer.getAll().forEach(child => {
            if (child.name === 'orderEntry') child.destroy();
        });

        const orders = this.orderManager.getOrders();
        let yOffset = -80;

        orders.forEach(order => {
            this.createOrderEntry(order, yOffset);
            yOffset += 100;
        });
    }

    private createOrderEntry(order: Order, y: number) {
        const entryBg = this.scene.add.rectangle(0, y, 440, 80, 0xeeeeee);
        entryBg.setStrokeStyle(1, 0xcccccc);
        entryBg.setName('orderEntry');
        this.orderContainer.add(entryBg);

        // Requirements Text
        const reqText = order.requirements.map(req => `${req.quantity}x ${req.itemId}`).join(', ');
        const text = this.scene.add.text(-200, y - 20, `Request: ${reqText}`, { color: '#333', fontSize: '18px' });
        text.setName('orderEntry');
        this.orderContainer.add(text);

        // Rewards Text
        const rewardText = this.scene.add.text(-200, y + 10, `Reward: ${order.rewardGold} G, ${order.rewardXp} XP`, { color: '#008800', fontSize: '16px' });
        rewardText.setName('orderEntry');
        this.orderContainer.add(rewardText);

        // Deliver Button
        const canDeliver = order.requirements.every(req =>
            GameManager.Instance.getInventoryQuantity(req.itemId) >= req.quantity
        );

        const btnColor = canDeliver ? 0x2ecc71 : 0x95a5a6;
        const btn = this.scene.add.rectangle(160, y, 90, 40, btnColor)
            .setInteractive({ cursor: canDeliver ? 'pointer' : 'default' });
        btn.setName('orderEntry');

        const btnText = this.scene.add.text(135, y - 10, 'Deliver', { color: '#fff', fontSize: '16px' });
        btnText.setName('orderEntry');

        if (canDeliver) {
            btn.on('pointerdown', () => {
                const success = this.orderManager.completeOrder(order.id);
                if (success) {
                    this.playDeliveryAnimation();
                    this.refreshOrders(); // Refresh UI to show new order
                }
            });
        }

        this.orderContainer.add(btn);
        this.orderContainer.add(btnText);
    }

    private playDeliveryAnimation() {
        // Simple tween for "Truck Leaving"
        const truck = this.scene.add.rectangle(0, 0, 60, 40, 0x3498db); // Blue truck
        const wheels = this.scene.add.circle(-20, 20, 5, 0x000000); // Visual flair
        this.scene.add.existing(truck);

        // Start from center
        truck.setPosition(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2);

        this.scene.tweens.add({
            targets: truck,
            x: this.scene.cameras.main.width + 100, // Move off screen
            duration: 1500,
            ease: 'Power2',
            onComplete: () => truck.destroy()
        });
    }
}
