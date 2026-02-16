import Phaser from 'phaser';

type ItemId = string;

export class GameManager {
    private static _instance: GameManager;

    // Game State
    private gold: number = 100;
    private xp: number = 0;
    private level: number = 1;
    private inventory: Map<ItemId, number>;

    // Event Emitter for UI updates
    public events: Phaser.Events.EventEmitter;

    private constructor() {
        this.inventory = new Map<ItemId, number>();
        this.events = new Phaser.Events.EventEmitter();

        // Initial items
        this.inventory.set('wheat_seed', 5);
    }

    public static get instance(): GameManager {
        if (!GameManager._instance) {
            GameManager._instance = new GameManager();
        }
        return GameManager._instance;
    }

    // --- Economy ---

    public getGold(): number {
        return this.gold;
    }

    public addGold(amount: number): void {
        this.gold += amount;
        this.events.emit('update-gold', this.gold);
    }

    public spendGold(amount: number): boolean {
        if (this.gold >= amount) {
            this.gold -= amount;
            this.events.emit('update-gold', this.gold);
            return true;
        }
        return false;
    }

    // --- XP & Level ---

    public getXp(): number {
        return this.xp;
    }

    public getLevel(): number {
        return this.level;
    }

    public addXp(amount: number): void {
        this.xp += amount;
        this.checkLevelUp();
        this.events.emit('update-xp', this.xp);
    }

    private checkLevelUp(): void {
        // Simple level formula: Level * 100 XP required
        const xpRequired = this.level * 100;
        if (this.xp >= xpRequired) {
            this.level++;
            this.xp -= xpRequired; // Optional: Keep overflow or reset? Let's keep total XP growing usually, but here simple reset/overflow
            // Actually, let's just keep total XP and calculate level from it, or just increment level.
            // For now, simple increment.
            this.events.emit('level-up', this.level);
        }
    }

    // --- Inventory ---

    public getInventoryQuantity(itemId: ItemId): number {
        return this.inventory.get(itemId) || 0;
    }

    public addToInventory(itemId: ItemId, amount: number = 1): void {
        const current = this.getInventoryQuantity(itemId);
        this.inventory.set(itemId, current + amount);
        this.events.emit('update-inventory', { itemId, quantity: current + amount });
    }

    public removeFromInventory(itemId: ItemId, amount: number = 1): boolean {
        const current = this.getInventoryQuantity(itemId);
        if (current >= amount) {
            this.inventory.set(itemId, current - amount);
            this.events.emit('update-inventory', { itemId, quantity: current - amount });
            return true;
        }
        return false;
    }

    // --- Persistence ---

    public getData(): any {
        return {
            gold: this.gold,
            xp: this.xp,
            level: this.level,
            inventory: Array.from(this.inventory.entries())
        };
    }

    public setData(data: any): void {
        this.gold = data.gold;
        this.xp = data.xp;
        this.level = data.level;
        this.inventory = new Map(data.inventory);

        // Notify UI of full update
        this.events.emit('update-gold', this.gold);
        this.events.emit('update-xp', this.xp);
        // this.events.emit('update-level', this.level); // If we had this event
    }
}
