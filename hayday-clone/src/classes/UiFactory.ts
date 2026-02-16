import Phaser from 'phaser';

// ==========================================
//  GLOBAL STYLE SHEET (Hay Day Architecture)
// ==========================================
export const UI_THEME = {
    // SHADOWS (Box Shadow equivalent)
    SHADOW: {
        SMALL: { y: 4, blur: 0, color: 0x000000, alpha: 0.4 },
        MEDIUM: { y: 8, blur: 2, color: 0x000000, alpha: 0.5 }, // Standard Button
        HEAVY: { y: 15, blur: 5, color: 0x000000, alpha: 0.6 }, // Popups
    },

    // BORDER RADIUS (Squircle Logic)
    RADIUS: {
        SMALL: 8,
        MEDIUM: 16, // Standard Button
        LARGE: 24,  // Panels
        ROUND: 999, // Pills/Circles
    },

    // GRADIENTS (Sun-Soaked Vibrancy)
    GRADIENT: {
        BTN_GREEN: { top: 0xAED581, bottom: 0x558B2F }, // Fresh Leaf
        BTN_RED: { top: 0xEF9A9A, bottom: 0xC62828 }, // Alert
        WOOD: { top: 0xA1887F, bottom: 0x5D4037 }, // Warm Wood
        GOLD: { top: 0xFFECB3, bottom: 0xFFA000 }, // Shiny Gold
    },

    // STROKES (The "Cartoon" Outline)
    STROKE: {
        WIDTH: 3,
        COLOR_BROWN: 0x3E2723, // Universal distinct outline
        COLOR_LIGHT: 0xFFFFFF, // Highlights
    }
};

export interface ButtonOptions {
    width?: number;
    height?: number;
    color?: number;
    strokeColor?: number;
    fontSize?: string;
    icon?: string;
    iconScale?: number; // New option
    textColor?: string;
    isSquircle?: boolean; // If true, squircle. If false, pill shape.
}

export class UiFactory {
    // ===========================
    //  HAY DAY COLOR PALETTE (Phase 8: Sun-Soaked)
    // ===========================
    static readonly COLORS = {
        // Wood (Warm Orange/Reddish Brown)
        WOOD_LIGHT: 0xFFCC80, // Orange Peel
        WOOD_BASE: 0xFFB74D,  // Apricot
        WOOD_DARK: 0xE65100,  // Persimmon
        WOOD_SHADOW: 0xBF360C, // Deep Red Brown (Stroke)

        // Parchment (Creamy)
        PARCHMENT_LIGHT: 0xFFF9C4,
        PARCHMENT_BASE: 0xFFF176,
        PARCHMENT_SHADOW: 0xFBC02D,

        // Buttons
        BTN_GREEN_LIGHT: 0xDCEDC8,
        BTN_GREEN_BASE: 0x8BC34A,
        BTN_GREEN_DARK: 0x558B2F,
        BTN_GREEN_STROKE: 0x33691E,

        BTN_RED_LIGHT: 0xFFCDD2,
        BTN_RED_BASE: 0xE57373,
        BTN_RED_DARK: 0xC62828,

        // Currency
        GOLD: 0xFFD54F,
        GOLD_DARK: 0xFFA000,
        XP_BLUE: 0x4FC3F7,

        TEXT_DARK: '#3E2723',
        TEXT_LIGHT: '#FFFFFF',
    };

    /**
     * Helper to draw a "Squircle" (Rounded Rect with large radius) with depth.
     */
    private static drawSquircle(
        g: Phaser.GameObjects.Graphics,
        width: number,
        height: number,
        color: number,
        depth: number = 8
    ) {
        const radius = Math.min(width, height) / 3.5; // Large radius for squircle look

        // 1. Drop Shadow (Soft)
        g.fillStyle(0x000000, 0.3);
        g.fillRoundedRect(-width / 2 + 4, -height / 2 + depth + 4, width, height, radius);

        // 2. Depth Layer (Darker side)
        g.fillStyle(Phaser.Display.Color.IntegerToColor(color).darken(30).color, 1);
        g.fillRoundedRect(-width / 2, -height / 2 + depth, width, height, radius);

        // 3. Main Body
        g.fillStyle(color, 1);
        g.fillRoundedRect(-width / 2, -height / 2, width, height, { tl: radius, tr: radius, bl: radius - 4, br: radius - 4 });

        // 4. Highlight Bevel (Top Edge)
        g.fillStyle(0xFFFFFF, 0.25);
        g.fillRoundedRect(-width / 2 + 4, -height / 2 + 2, width - 8, height / 2 - 2, { tl: radius, tr: radius, bl: 0, br: 0 });
    }

    /**
     * Draws procedural wood grain lines on the given graphics object.
     * Updated for Phase 7: More subtle, less noise.
     */
    private static drawWoodGrain(g: Phaser.GameObjects.Graphics, width: number, height: number) {
        g.lineStyle(2, this.COLORS.WOOD_DARK, 0.08); // Reduced alpha from 0.15
        const count = Math.ceil(height / 25); // Fewer lines

        // Draw wood plank lines
        for (let i = 0; i < count; i++) {
            const y = -height / 2 + (i * 25) + Phaser.Math.Between(-8, 8);

            // Start path
            const path = new Phaser.Curves.Path(-width / 2 + 10, y);

            // Control points for wavy curve
            const midX = Phaser.Math.Between(-20, 20);
            const midY = y + Phaser.Math.Between(-5, 5);
            const endX = width / 2 - 10;
            const endY = y + Phaser.Math.Between(-5, 5);

            // Draw curve
            path.quadraticBezierTo(midX, midY, endX, endY);
            path.draw(g);
        }

        // Knots (More subtle)
        g.fillStyle(this.COLORS.WOOD_DARK, 0.1);
        const knots = Phaser.Math.Between(1, 2);
        for (let k = 0; k < knots; k++) {
            g.fillEllipse(
                Phaser.Math.Between(-width / 3, width / 3),
                Phaser.Math.Between(-height / 3, height / 3),
                Phaser.Math.Between(15, 25),
                Phaser.Math.Between(6, 10)
            );
        }
    }

    /**
     * Draws an Advanced Skeuomorphic Panel Component (Phase 7).
     * Features: Double Border, Vertical Gradient, Bevel Highlights.
     */
    /**
     * Draws an Advanced Skeuomorphic Panel Component (Phase 8: Sun-Soaked).
     * Layering: DropShadow -> Stroke -> Volume -> Texture -> Bevels -> InsetShadow.
     */
    private static drawAdvancedPanel(
        g: Phaser.GameObjects.Graphics,
        width: number,
        height: number,
        radius: number = 24
    ) {
        // 1. Drop Shadow (Heavy & Hard)
        const shadow = UI_THEME.SHADOW.HEAVY;
        g.fillStyle(shadow.color, shadow.alpha);
        g.fillRoundedRect(-width / 2 + 4, -height / 2 + shadow.y, width, height, radius);

        // 2. Silhouette (Stroke) - The "Cartoon" Outline
        g.lineStyle(6, this.COLORS.WOOD_SHADOW, 1);
        g.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);

        // 3. Base Volume (Vertical Gradient: Dark to Light)
        // Simulate "Log" curvature by going Dark (Bottom) -> Light (Top) -> Dark (Very Top)
        // Simplification for Graphics: Dark Base + Gradient Overlay
        g.fillStyle(this.COLORS.WOOD_DARK, 1);
        g.fillRoundedRect(-width / 2, -height / 2, width, height, radius);

        // Gradient Overlay (Orange/Apricot)
        g.fillGradientStyle(this.COLORS.WOOD_BASE, this.COLORS.WOOD_BASE, this.COLORS.WOOD_DARK, this.COLORS.WOOD_DARK, 1);
        g.fillRoundedRect(-width / 2, -height / 2, width, height, radius);

        // 4. Texture (Grain)
        this.drawWoodGrain(g, width, height);

        // 5. Hard Bevels (The Toy Look)
        // Top Highlight (Sharp White)
        g.fillStyle(0xFFFFFF, 0.4);
        g.beginPath();
        g.moveTo(-width / 2 + radius, -height / 2);
        g.lineTo(width / 2 - radius, -height / 2);
        g.lineTo(width / 2 - radius, -height / 2 + 5);
        g.lineTo(-width / 2 + radius, -height / 2 + 5);
        g.closePath();
        g.fillPath();

        // Bottom Shadow (Deep Dark)
        g.fillStyle(0x000000, 0.3);
        g.beginPath();
        g.moveTo(-width / 2 + radius, height / 2 - 5);
        g.lineTo(width / 2 - radius, height / 2 - 5);
        g.lineTo(width / 2 - radius, height / 2);
        g.lineTo(-width / 2 + radius, height / 2);
        g.closePath();
        g.fillPath();

        // Inner Rim Light (Subtle)
        g.lineStyle(2, 0xFFFFFF, 0.2);
        g.strokeRoundedRect(-width / 2 + 3, -height / 2 + 3, width - 6, height - 6, radius - 2);
    }

    /**
     * Creates a warm wooden bar/plank (for Top HUD bars).
     * Phase 9: Uses drawAdvancedPanel for Sun-Soaked consistency.
     */
    static createBar(scene: Phaser.Scene, width: number, height: number): Phaser.GameObjects.Container {
        const container = scene.add.container(0, 0);
        const g = scene.add.graphics();
        container.add(g);

        this.drawAdvancedPanel(g, width, height, Math.min(height / 2, 12));

        return container;
    }




    /**
     * Creates a high-fidelity "Seed Selection Panel" (Carved Wood + Parchment Overlay)
     * Updated Phase 7: Advanced Skeuomorphism + Spring Animation
     */
    static createSeedPanel(scene: Phaser.Scene, width: number, height: number): Phaser.GameObjects.Container {
        const container = scene.add.container(0, 0);
        const g = scene.add.graphics();
        container.add(g);

        // 1. Advanced Wood Panel Base
        this.drawAdvancedPanel(g, width, height, 24);

        // 2. The Recess (Carved Hole for Parchment)
        const margin = 14;
        const recessW = width - margin * 2;
        const recessH = height - margin * 2;

        // Inner Shadow (Top of recess) - Deep, chunky shadow
        g.fillStyle(0x3E2723, 0.6); // Darker shadow
        g.fillRoundedRect(-recessW / 2, -recessH / 2, recessW, recessH, 18);

        // 3. Parchment Overlay
        const pW = recessW - 6;
        const pH = recessH - 6;
        // Gradient for parchment (Left-Right curve simulation)
        g.fillGradientStyle(this.COLORS.PARCHMENT_LIGHT, this.COLORS.PARCHMENT_BASE, this.COLORS.PARCHMENT_LIGHT, this.COLORS.PARCHMENT_BASE, 1);
        g.fillRoundedRect(-pW / 2, -pH / 2 + 3, pW, pH, 16);

        // Parchment Texture (Subtle Noise)
        g.fillStyle(this.COLORS.PARCHMENT_SHADOW, 0.1);
        for (let i = 0; i < 50; i++) {
            g.fillCircle(
                Phaser.Math.Between(-pW / 2 + 10, pW / 2 - 10),
                Phaser.Math.Between(-pH / 2 + 10, pH / 2 - 10),
                Phaser.Math.Between(1, 3)
            );
        }

        // 4. Nails (Pinning it down) with Highlight
        const nailOffset = 16;
        this.drawNailAt(g, -width / 2 + nailOffset, -height / 2 + nailOffset);
        this.drawNailAt(g, width / 2 - nailOffset, -height / 2 + nailOffset);
        this.drawNailAt(g, -width / 2 + nailOffset, height / 2 - nailOffset);
        this.drawNailAt(g, width / 2 - nailOffset, height / 2 - nailOffset);

        // 5. Initial Animation State (Hidden/Small)
        container.setScale(0.8);
        container.setAlpha(0);

        // 6. Spring Animation (Juiciness)
        scene.tweens.add({
            targets: container,
            scaleX: 1,
            scaleY: 1,
            alpha: 1,
            duration: 600,
            ease: 'Elastic.easeOut', // The "Boing" effect
            delay: 100 // Slight delay for feel
        });

        return container;
    }

    private static drawNailAt(g: Phaser.GameObjects.Graphics, x: number, y: number) {
        g.fillStyle(0x5D4037, 0.5); // Shadow
        g.fillCircle(x + 1, y + 2, 4);
        g.fillStyle(0x8D6E63, 1); // Brass Base
        g.fillCircle(x, y, 4);
        g.fillStyle(0xFFFFFF, 0.4); // Shine
        g.fillCircle(x - 1, y - 1, 1.5);
    }

    /**
     * Creates a high-fidelity wooden panel with procedural texture and depth.
     * Phase 8: Refined for Sun-Soaked consistency.
     */
    static createPanel(scene: Phaser.Scene, width: number, height: number, title?: string): Phaser.GameObjects.Container {
        const container = scene.add.container(0, 0);

        const g = scene.add.graphics();
        container.add(g);

        // -- WOODEN FRAME (Phase 8 Style) --
        this.drawAdvancedPanel(g, width, height, 20);

        // -- PARCHMENT INSET (Inset Shadow Logic) --
        const margin = 20;
        const pW = width - margin * 2;
        const pH = height - margin * 2 - (title ? 35 : 0);
        const pY = (title ? 20 : 0);

        // 1. Deep Inset Shadow (Top)
        g.fillStyle(this.COLORS.WOOD_SHADOW, 0.5);
        g.fillRoundedRect(-pW / 2, pY - pH / 2, pW, pH, 16);

        // 2. Parchment Page
        g.fillStyle(this.COLORS.PARCHMENT_LIGHT, 1);
        g.fillRoundedRect(-pW / 2 + 2, pY - pH / 2 + 3, pW - 4, pH - 5, 14);

        // 3. Parchment Texture (Subtle Noise)
        g.fillStyle(this.COLORS.PARCHMENT_SHADOW, 0.1);
        for (let i = 0; i < 40; i++) {
            g.fillCircle(
                Phaser.Math.Between(-pW / 2 + 10, pW / 2 - 10),
                pY + Phaser.Math.Between(-pH / 2 + 10, pH / 2 - 10),
                Phaser.Math.Between(2, 6)
            );
        }

        // -- TITLE --
        if (title) {
            const titleY = -height / 2 + 32;
            const text = scene.add.text(0, titleY, title, {
                fontFamily: 'Fredoka, sans-serif',
                fontSize: '28px',
                color: '#FFECB3', // Lighter Gold
                stroke: '#BF360C', // Deep Red Brown
                strokeThickness: 6,
            }).setOrigin(0.5);
            text.setShadow(2, 2, '#3E2723', 0.5, true, true);
            container.add(text);
        }

        // 4. Nails
        const nailOff = 16;
        this.drawNailAt(g, -width / 2 + nailOff, -height / 2 + nailOff);
        this.drawNailAt(g, width / 2 - nailOff, -height / 2 + nailOff);
        this.drawNailAt(g, -width / 2 + nailOff, height / 2 - nailOff);
        this.drawNailAt(g, width / 2 - nailOff, height / 2 - nailOff);

        return container;
    }

    /**
     * Creates a small card (for crops/items) with depth.
     */
    static createCard(scene: Phaser.Scene, width: number, height: number, color: number): Phaser.GameObjects.Container {
        const container = scene.add.container(0, 0);
        const g = scene.add.graphics();
        container.add(g);

        const radius = 14;

        // 1. Drop Shadow
        g.fillStyle(0x000000, 0.3);
        g.fillRoundedRect(-width / 2 + 2, -height / 2 + 4, width, height, radius);

        // 2. Cartoon Stroke
        g.lineStyle(3, this.COLORS.WOOD_SHADOW, 1);
        g.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);

        // 3. Base fill with gradient
        const darkColor = Phaser.Display.Color.IntegerToColor(color).darken(25).color;
        g.fillGradientStyle(color, color, darkColor, darkColor, 1);
        g.fillRoundedRect(-width / 2, -height / 2, width, height, radius);

        // 4. Top bevel highlight
        g.fillStyle(0xFFFFFF, 0.3);
        g.fillRoundedRect(-width / 2 + 3, -height / 2 + 2, width - 6, height / 3, { tl: radius, tr: radius, bl: 0, br: 0 });

        return container;
    }

    /**
     * Creates a juicy, chunky button.
     */
    static createButton(
        scene: Phaser.Scene,
        x: number,
        y: number,
        label: string,
        callback: () => void,
        options: ButtonOptions = {}
    ): Phaser.GameObjects.Container {
        const container = scene.add.container(x, y);
        const w = options.width || 120;
        const h = options.height || 50;
        const color = options.color ?? this.COLORS.BTN_GREEN_BASE;
        const textColor = options.textColor || '#FFFFFF';

        const g = scene.add.graphics();
        container.add(g);

        const drawBtn = (isDown: boolean) => {
            g.clear();
            const yOffset = isDown ? 4 : 0; // Push down effect
            const depth = isDown ? 0 : 6;

            // Allow squircle or pill
            if (options.isSquircle) {
                this.drawSquircle(g, w, h, color, depth);
            } else {
                // Pill Shape
                const r = h / 2;
                // Shadow
                if (depth > 0) {
                    g.fillStyle(0x000000, 0.3);
                    g.fillRoundedRect(-w / 2 + 2, -h / 2 + depth + 4, w, h, r);

                    g.fillStyle(Phaser.Display.Color.IntegerToColor(color).darken(25).color, 1);
                    g.fillRoundedRect(-w / 2, -h / 2 + depth, w, h, r);
                }

                // Main
                g.fillStyle(color, 1);
                g.fillRoundedRect(-w / 2, -h / 2 + yOffset, w, h, r);

                // Phase 9: Cartoon Stroke
                g.lineStyle(3, this.COLORS.WOOD_SHADOW, 1);
                g.strokeRoundedRect(-w / 2, -h / 2 + yOffset, w, h, r);

                // Highlight
                g.fillStyle(0xFFFFFF, 0.3);
                g.fillRoundedRect(-w / 2 + 4, -h / 2 + yOffset + 4, w - 8, h / 2 - 4, { tl: r, tr: r, bl: 2, br: 2 });
            }
        };

        drawBtn(false);

        // Icon
        let tx = 0;
        if (options.icon) {
            tx = 10;
            const scale = options.iconScale ?? 0.7; // Default to 0.7 if not provided
            const icon = scene.add.sprite(-w / 2 + 25, 0, options.icon).setScale(scale);
            container.add(icon);
        }

        // Text
        const text = scene.add.text(tx, -2, label, {
            fontFamily: 'Fredoka, sans-serif',
            fontSize: options.fontSize || '20px',
            color: textColor,
            stroke: options.strokeColor ? Phaser.Display.Color.IntegerToColor(options.strokeColor).rgba : '#33691e',
            strokeThickness: 4,
        }).setOrigin(0.5);
        container.add(text);

        // Interactive
        container.setSize(w, h);
        container.setInteractive({ cursor: 'pointer' });

        container.on('pointerdown', () => {
            drawBtn(true);
            text.y = 2; // Move text down
            scene.tweens.add({ targets: container, scaleX: 0.95, scaleY: 0.95, duration: 50 });
        });

        container.on('pointerup', () => {
            drawBtn(false);
            text.y = -2;
            scene.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 50 });
            callback();
        });

        container.on('pointerout', () => {
            drawBtn(false);
            text.y = -2;
            scene.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 50 });
        });

        container.on('pointerover', () => {
            scene.tweens.add({ targets: container, scaleX: 1.05, scaleY: 1.05, duration: 100 });
        });

        return container;
    }
}
