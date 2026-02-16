import Phaser from 'phaser';

export class GridManager {
    private tileWidth: number;
    private tileHeight: number;
    private mapWidth: number;
    private mapHeight: number;

    private cropTiles: Map<string, any> = new Map(); // Store tile references or state

    constructor(_scene: Phaser.Scene, mapWidth: number, mapHeight: number, tileWidth: number = 64, tileHeight: number = 32) {
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
    }

    public registerTile(x: number, y: number, tile: any) {
        this.cropTiles.set(`${x},${y}`, tile);
    }

    public getData(): any {
        const gridData: any[] = [];
        this.cropTiles.forEach((tile, key) => {
            gridData.push({
                key: key,
                state: tile.getPersistenceData()
            });
        });
        return gridData;
    }

    public setData(data: any[]): void {
        data.forEach(item => {
            const tile = this.cropTiles.get(item.key);
            if (tile) {
                tile.setPersistenceData(item.state);
            }
        });
    }

    public cartesianToIsometric(x: number, y: number): { x: number, y: number } {
        const isoX = (x - y) * (this.tileWidth / 2);
        const isoY = (x + y) * (this.tileHeight / 2);
        return { x: isoX, y: isoY };
    }

    public isometricToCartesian(isoX: number, isoY: number): { x: number, y: number } {
        const halfWidth = this.tileWidth / 2;
        const halfHeight = this.tileHeight / 2;
        const y = (isoY / halfHeight - isoX / halfWidth) / 2;
        const x = (isoY / halfHeight + isoX / halfWidth) / 2;
        return { x: Math.round(x), y: Math.round(y) };
    }

    public getCenter(): { x: number, y: number } {
        return this.cartesianToIsometric(this.mapWidth / 2, this.mapHeight / 2);
    }
}
