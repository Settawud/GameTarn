import { GameManager } from './GameManager';

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
        const possibleItems = ['wheat', 'corn', 'carrot']; // Add more items as needed
        const requirements = [];
        const numItems = Phaser.Math.Between(1, 2);

        for (let i = 0; i < numItems; i++) {
            const item = Phaser.Utils.Array.GetRandom(possibleItems);
            const qty = Phaser.Math.Between(2, 5);
            requirements.push({ itemId: item, quantity: qty });
        }

        const order: Order = {
            id: Phaser.Math.RND.uuid(),
            requirements: requirements,
            rewardGold: Phaser.Math.Between(50, 150),
            rewardXp: Phaser.Math.Between(10, 30)
        };

        this.orders.push(order);
    }

    public completeOrder(orderId: string): boolean {
        const orderIndex = this.orders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return false;

        const order = this.orders[orderIndex];
        
        // Check if player has enough items
        // Assuming GameManager singleton exists from Phase 3
        const hasEnough = order.requirements.every(req => 
            GameManager.Instance.getInventoryQuantity(req.itemId) >= req.quantity
        );

        if (hasEnough) {
            // Deduct items and give rewards
            order.requirements.forEach(req => {
                GameManager.Instance.removeFromInventory(req.itemId, req.quantity);
            });
            
            GameManager.Instance.addGold(order.rewardGold);
            GameManager.Instance.addXp(order.rewardXp);

            // Remove order and generate a new one
            this.orders.splice(orderIndex, 1);
            this.createNewOrder();
            return true;
        }

        return false;
    }
}
