import Phaser from 'phaser';
import { GameManager } from './GameManager';
import { CROP_LIST, getCropInfo } from './CropData';

export interface Order {
    id: string;
    requirements: { itemId: string; quantity: number }[];
    rewardGold: number;
    rewardXp: number;
}

export class OrderManager {
    private orders: Order[] = [];
    private maxOrders: number = 3;

    constructor() {
        this.generateInitialOrders();
    }

    private generateInitialOrders() {
        while (this.orders.length < this.maxOrders) {
            this.createNewOrder();
        }
    }

    public getOrders(): Order[] {
        return this.orders;
    }

    public createNewOrder() {
        const playerLevel = GameManager.instance.getLevel();
        // Filter crops available at current level
        const allowedCrops = CROP_LIST.filter(crop => crop.levelRequired <= playerLevel);

        // Fallback if something goes wrong (shouldn't happen as Wheat is Lv 1)
        if (allowedCrops.length === 0) allowedCrops.push(getCropInfo('wheat'));

        const numItems = Phaser.Math.Between(1, Math.min(3, allowedCrops.length));
        const requirements: { itemId: string; quantity: number }[] = [];
        let totalValue = 0;
        let totalXp = 0;

        // Create requirements
        for (let i = 0; i < numItems; i++) {
            const crop = Phaser.Utils.Array.GetRandom(allowedCrops);
            // Avoid duplicates in same order (simple check)
            if (requirements.some(r => r.itemId === crop.id)) {
                i--;
                continue;
            }

            const qty = Phaser.Math.Between(2, 4 + Math.floor(playerLevel / 2));
            requirements.push({ itemId: crop.id, quantity: qty });

            // Base value calculation
            totalValue += crop.sellPrice * qty;
            totalXp += crop.xpReward * qty;
        }

        // Add some order bonus (20-50%)
        const bonusMultiplier = Phaser.Math.FloatBetween(1.2, 1.5);
        const rewardGold = Math.ceil(totalValue * bonusMultiplier);
        const rewardXp = Math.ceil(totalXp * bonusMultiplier);

        const order: Order = {
            id: Phaser.Math.RND.uuid(),
            requirements: requirements,
            rewardGold: rewardGold,
            rewardXp: rewardXp
        };

        this.orders.push(order);
    }

    public completeOrder(orderId: string): boolean {
        const orderIndex = this.orders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return false;

        const order = this.orders[orderIndex];

        const hasEnough = order.requirements.every(req =>
            GameManager.instance.getInventoryQuantity(req.itemId) >= req.quantity
        );

        if (hasEnough) {
            order.requirements.forEach(req => {
                GameManager.instance.removeFromInventory(req.itemId, req.quantity);
            });

            GameManager.instance.addGold(order.rewardGold);
            GameManager.instance.addXp(order.rewardXp);

            this.orders.splice(orderIndex, 1);
            this.createNewOrder();
            return true;
        }

        return false;
    }
}
