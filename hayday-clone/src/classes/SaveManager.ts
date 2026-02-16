import { GameManager } from '../classes/GameManager';
import { GridManager } from '../classes/GridManager';

export class SaveManager {
    private static STORAGE_KEY = 'hayday_clone_save_v1';

    public static saveGame(gridManager: GridManager): void {
        const gameState = GameManager.instance.getData();
        const gridState = gridManager.getData();

        const saveData = {
            game: gameState,
            grid: gridState,
            timestamp: Date.now()
        };

        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(saveData));
            console.log('Game Saved at', new Date().toLocaleTimeString());
        } catch (e) {
            console.error('Failed to save game:', e);
        }
    }

    public static loadGame(gridManager: GridManager): boolean {
        try {
            const dataStr = localStorage.getItem(this.STORAGE_KEY);
            if (!dataStr) return false;

            const saveData = JSON.parse(dataStr);

            if (saveData.game) {
                GameManager.instance.setData(saveData.game);
            }

            if (saveData.grid) {
                gridManager.setData(saveData.grid);
            }

            console.log('Game Loaded successfully');
            return true;
        } catch (e) {
            console.error('Failed to load game:', e);
            return false;
        }
    }
}
