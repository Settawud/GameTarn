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

    // BORDER RADIUS (Squircle Logic — Phase 10: Rounder)
    RADIUS: {
        SMALL: 12,
        MEDIUM: 20,   // Standard Button
        LARGE: 28,     // Panels
        ROUND: 999,    // Pills/Circles
    },

    // GRADIENTS (Sun-Soaked Vibrancy)
    GRADIENT: {
        BTN_GREEN: { top: 0xAED581, bottom: 0x558B2F },
        BTN_RED: { top: 0xEF9A9A, bottom: 0xC62828 },
        WOOD: { top: 0xA1887F, bottom: 0x5D4037 },
        GOLD: { top: 0xFFECB3, bottom: 0xFFA000 },
    },

    // STROKES (The "Cartoon" Outline)
    STROKE: {
        WIDTH: 4,            // Phase 10: thicker
        COLOR_BROWN: 0x3E2723,
        COLOR_LIGHT: 0xFFFFFF,
    }
};

export interface ButtonOptions {
    width?: number;
    height?: number;
    color?: number;
    strokeColor?: number;
    fontSize?: string;
    icon?: string;
    iconScale?: number;
    textColor?: string;
    isSquircle?: boolean;
}

export class UiFactory {
    // ===========================
    //  HAY DAY COLOR PALETTE (Phase 10: Premium)
    // ===========================
    static readonly COLORS = {
        // Wood (Warm Orange/Reddish Brown)
        WOOD_LIGHT: 0xFFCC80,  // Orange Peel
        WOOD_BASE: 0xFFB74D,   // Apricot
        WOOD_DARK: 0xE65100,   // Persimmon
        WOOD_SHADOW: 0xBF360C, // Deep Red Brown (Stroke)

        // Rim Light (Sunlight on edges)
        RIM_LIGHT: 0xFFE0B2,   // Phase 10: Golden-white
        RIM_BOTTOM: 0x4E342E,  // Phase 10: Deep shadow bottom

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

    // ===========================
    //  PILLAR 1: VOLUME & DEPTH
    // ===========================

    /**
     * Master Panel Renderer — Phase 10 Premium.
     * 9-Layer Stack: SoftShadow -> HardShadow -> CartoonStroke ->
     * DarkBase -> GradientVolume -> WoodGrain -> TopRimLight ->
     * BottomBevel -> InnerRimGlow
     */
    private static drawAdvancedPanel(
        g: Phaser.GameObjects.Graphics,
        width: number,
        height: number,
        radius: number = 28
    ) {
        // 1. Soft Drop Shadow (outer glow)
        g.fillStyle(0x000000, 0.15);
        g.fillRoundedRect(-width / 2 + 6, -height / 2 + 18, width, height, radius + 2);

        // 2. Hard Drop Shadow (crisp depth)
        g.fillStyle(0x000000, 0.45);
        g.fillRoundedRect(-width / 2 + 3, -height / 2 + 12, width, height, radius);

        // 3. Cartoon Stroke (thick dark outline)
        g.lineStyle(UI_THEME.STROKE.WIDTH + 2, UI_THEME.STROKE.COLOR_BROWN, 1);
        g.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);

        // 4. Dark Base (full body — ensures no gaps)
        g.fillStyle(this.COLORS.WOOD_DARK, 1);
        g.fillRoundedRect(-width / 2, -height / 2, width, height, radius);

        // 5. Gradient Volume (Warm: top=light orange, bottom=dark)
        g.fillGradientStyle(
            this.COLORS.WOOD_LIGHT, this.COLORS.WOOD_LIGHT,
            this.COLORS.WOOD_DARK, this.COLORS.WOOD_DARK, 1
        );
        g.fillRoundedRect(-width / 2 + 2, -height / 2 + 2, width - 4, height - 4, radius - 1);

        // 6. Wood Grain Texture
        this.drawWoodGrain(g, width - 8, height - 8);

        // 7. Top Rim Light (sunlight hitting top edge) — golden-white strip
        g.fillStyle(this.COLORS.RIM_LIGHT, 0.6);
        g.fillRoundedRect(
            -width / 2 + radius / 2, -height / 2 + 2,
            width - radius, 6,
            { tl: 3, tr: 3, bl: 0, br: 0 }
        );
        // Secondary softer glow below rim
        g.fillStyle(0xFFFFFF, 0.2);
        g.fillRoundedRect(
            -width / 2 + 6, -height / 2 + 4,
            width - 12, height / 3,
            { tl: radius - 4, tr: radius - 4, bl: 0, br: 0 }
        );

        // 8. Bottom Bevel (thick dark band — simulates underside shadow)
        g.fillGradientStyle(
            0x000000, 0x000000, 0x000000, 0x000000
        );
        g.fillStyle(this.COLORS.RIM_BOTTOM, 0.5);
        g.fillRoundedRect(
            -width / 2 + radius / 2, height / 2 - 8,
            width - radius, 6,
            { tl: 0, tr: 0, bl: 3, br: 3 }
        );

        // 9. Inner Rim Glow (subtle light border inside)
        g.lineStyle(1.5, 0xFFFFFF, 0.15);
        g.strokeRoundedRect(-width / 2 + 4, -height / 2 + 4, width - 8, height - 8, radius - 3);
    }

    // ===========================
    //  PILLAR 2: TEXTURE & MATERIAL
    // ===========================

    /**
     * Phase 10: Multi-layer plank wood grain.
     * Draws alternating plank bands with wavy grain lines, knots with rings.
     */
    private static drawWoodGrain(g: Phaser.GameObjects.Graphics, width: number, height: number) {
        // --- Plank Bands (alternating brightness) ---
        const plankH = 18;
        const plankCount = Math.ceil(height / plankH);

        for (let i = 0; i < plankCount; i++) {
            const y = -height / 2 + i * plankH;
            // Alternate slightly darker/lighter bands
            if (i % 2 === 0) {
                g.fillStyle(0x000000, 0.04);
                g.fillRect(-width / 2 + 6, y, width - 12, plankH);
            }
            // Plank seam line
            g.lineStyle(1, this.COLORS.WOOD_DARK, 0.12);
            g.beginPath();
            g.moveTo(-width / 2 + 8, y);
            g.lineTo(width / 2 - 8, y);
            g.strokePath();
        }

        // --- Grain Lines (wavy, subtle) ---
        g.lineStyle(1, this.COLORS.WOOD_DARK, 0.08);
        const lineCount = Math.ceil(height / 22);
        for (let i = 0; i < lineCount; i++) {
            const y = -height / 2 + (i * 22) + Phaser.Math.Between(-5, 5);
            const path = new Phaser.Curves.Path(-width / 2 + 12, y);
            path.quadraticBezierTo(
                Phaser.Math.Between(-15, 15),
                y + Phaser.Math.Between(-4, 4),
                width / 2 - 12,
                y + Phaser.Math.Between(-4, 4)
            );
            path.draw(g);
        }

        // --- Knots (with concentric rings) ---
        g.fillStyle(this.COLORS.WOOD_DARK, 0.1);
        const knotCount = Phaser.Math.Between(2, 3);
        for (let k = 0; k < knotCount; k++) {
            const kx = Phaser.Math.Between(-width / 3, width / 3);
            const ky = Phaser.Math.Between(-height / 3, height / 3);
            // Outer ring
            g.fillEllipse(kx, ky, Phaser.Math.Between(16, 22), Phaser.Math.Between(8, 12));
            // Inner ring (concentric)
            g.lineStyle(1, this.COLORS.WOOD_DARK, 0.08);
            g.strokeEllipse(kx, ky, Phaser.Math.Between(10, 14), Phaser.Math.Between(5, 8));
            g.strokeEllipse(kx, ky, Phaser.Math.Between(5, 8), Phaser.Math.Between(3, 5));
        }

        // --- Edge Scuff Marks ---
        g.fillStyle(this.COLORS.WOOD_SHADOW, 0.06);
        for (let s = 0; s < 8; s++) {
            g.fillCircle(
                Phaser.Math.Between(-width / 2 + 6, width / 2 - 6),
                Phaser.Math.Between(-height / 2 + 4, height / 2 - 4),
                Phaser.Math.Between(1, 2)
            );
        }
    }

    /**
     * Phase 10: Fiber parchment texture.
     * Short random lines + dots for realistic paper grain.
     */
    private static drawParchmentTexture(
        g: Phaser.GameObjects.Graphics,
        x: number, y: number,
        width: number, height: number
    ) {
        // Fiber lines (short, random orientation)
        g.lineStyle(1, this.COLORS.PARCHMENT_SHADOW, 0.08);
        for (let i = 0; i < 40; i++) {
            const fx = x + Phaser.Math.Between(-width / 2 + 8, width / 2 - 8);
            const fy = y + Phaser.Math.Between(-height / 2 + 8, height / 2 - 8);
            const angle = Phaser.Math.Between(0, 180);
            const len = Phaser.Math.Between(3, 8);
            const dx = Math.cos(angle * Math.PI / 180) * len;
            const dy = Math.sin(angle * Math.PI / 180) * len;
            g.beginPath();
            g.moveTo(fx, fy);
            g.lineTo(fx + dx, fy + dy);
            g.strokePath();
        }

        // Grain dots
        g.fillStyle(this.COLORS.PARCHMENT_SHADOW, 0.06);
        for (let i = 0; i < 30; i++) {
            g.fillCircle(
                x + Phaser.Math.Between(-width / 2 + 6, width / 2 - 6),
                y + Phaser.Math.Between(-height / 2 + 6, height / 2 - 6),
                Phaser.Math.Between(1, 3)
            );
        }
    }

    /**
     * Phase 10: Premium 3-Ring Nail with specular highlight.
     */
    private static drawNailAt(g: Phaser.GameObjects.Graphics, x: number, y: number) {
        // Shadow under nail
        g.fillStyle(0x000000, 0.35);
        g.fillCircle(x + 1, y + 2, 5);
        // Dark ring (outer)
        g.fillStyle(0x5D4037, 1);
        g.fillCircle(x, y, 5);
        // Brass body (middle)
        g.fillStyle(0xA1887F, 1);
        g.fillCircle(x, y, 3.5);
        // Bright center (inner)
        g.fillStyle(0xD7CCC8, 1);
        g.fillCircle(x, y - 0.5, 2);
        // Specular highlight (white dot)
        g.fillStyle(0xFFFFFF, 0.7);
        g.fillCircle(x - 1, y - 1.5, 1.2);
    }

    // ===========================
    //  PILLAR 4: TYPOGRAPHY HELPER
    // ===========================

    /**
     * Phase 10: Consistent text style with thick stroke + shadow.
     * Call on any Phaser.GameObjects.Text to apply the premium look.
     */
    static applyTextStyle(
        text: Phaser.GameObjects.Text,
        options: {
            fontSize?: string;
            color?: string;
            strokeThickness?: number;
            strokeColor?: string;
        } = {}
    ) {
        text.setStyle({
            fontFamily: 'Fredoka, sans-serif',
            fontSize: options.fontSize || text.style.fontSize || '20px',
            color: options.color || '#FFFFFF',
            stroke: options.strokeColor || '#3E2723',
            strokeThickness: options.strokeThickness ?? 7,
            fontStyle: 'bold',
        });
        text.setShadow(2, 3, '#3E2723', 4, true, true);
    }

    // ===========================
    //  COMPONENT FACTORIES
    // ===========================

    /**
     * Creates a warm wooden bar/plank (for Top HUD bars).
     */
    static createBar(scene: Phaser.Scene, width: number, height: number): Phaser.GameObjects.Container {
        const container = scene.add.container(0, 0);
        const g = scene.add.graphics();
        container.add(g);

        this.drawAdvancedPanel(g, width, height, Math.min(height / 2, 14));

        return container;
    }

    /**
     * Squircle helper (legacy, still used by some buttons).
     */
    private static drawSquircle(
        g: Phaser.GameObjects.Graphics,
        width: number,
        height: number,
        color: number,
        depth: number = 8
    ) {
        const radius = Math.min(width, height) / 3;

        // 1. Drop Shadow
        g.fillStyle(0x000000, 0.35);
        g.fillRoundedRect(-width / 2 + 4, -height / 2 + depth + 4, width, height, radius);

        // 2. Depth Layer
        g.fillStyle(Phaser.Display.Color.IntegerToColor(color).darken(30).color, 1);
        g.fillRoundedRect(-width / 2, -height / 2 + depth, width, height, radius);

        // 3. Main Body
        g.fillStyle(color, 1);
        g.fillRoundedRect(-width / 2, -height / 2, width, height, { tl: radius, tr: radius, bl: radius - 4, br: radius - 4 });

        // 4. Cartoon Stroke
        g.lineStyle(3, this.COLORS.WOOD_SHADOW, 1);
        g.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);

        // 5. Highlight Bevel
        g.fillStyle(0xFFFFFF, 0.25);
        g.fillRoundedRect(-width / 2 + 4, -height / 2 + 2, width - 8, height / 2 - 2, { tl: radius, tr: radius, bl: 0, br: 0 });
    }

    /**
     * Phase 10: Premium Seed Selection Panel.
     */
    static createSeedPanel(scene: Phaser.Scene, width: number, height: number): Phaser.GameObjects.Container {
        const container = scene.add.container(0, 0);
        const g = scene.add.graphics();
        container.add(g);

        // 1. Wood Panel Base (Premium)
        this.drawAdvancedPanel(g, width, height, 28);

        // 2. Carved Recess
        const margin = 14;
        const recessW = width - margin * 2;
        const recessH = height - margin * 2;

        // Recess shadow (dark at top, fading down — gradient simulation)
        g.fillStyle(0x3E2723, 0.6);
        g.fillRoundedRect(-recessW / 2, -recessH / 2, recessW, recessH, 20);
        // Inner top shadow gradient (darker top)
        g.fillStyle(0x000000, 0.2);
        g.fillRoundedRect(-recessW / 2 + 2, -recessH / 2 + 2, recessW - 4, recessH / 4, { tl: 18, tr: 18, bl: 0, br: 0 });

        // 3. Parchment Overlay
        const pW = recessW - 6;
        const pH = recessH - 6;
        // Gradient parchment (warmer center)
        g.fillGradientStyle(
            this.COLORS.PARCHMENT_LIGHT, this.COLORS.PARCHMENT_BASE,
            this.COLORS.PARCHMENT_LIGHT, this.COLORS.PARCHMENT_BASE, 1
        );
        g.fillRoundedRect(-pW / 2, -pH / 2 + 3, pW, pH, 18);

        // Bottom highlight inside inset (reflected light)
        g.fillStyle(0xFFFFFF, 0.12);
        g.fillRoundedRect(-pW / 2 + 4, pH / 2 - 12, pW - 8, 8, { tl: 0, tr: 0, bl: 16, br: 16 });

        // 4. Parchment Fiber Texture
        this.drawParchmentTexture(g, 0, 3, pW, pH);

        // 5. Corner Nails (Premium 3-ring)
        const nailOffset = 16;
        this.drawNailAt(g, -width / 2 + nailOffset, -height / 2 + nailOffset);
        this.drawNailAt(g, width / 2 - nailOffset, -height / 2 + nailOffset);
        this.drawNailAt(g, -width / 2 + nailOffset, height / 2 - nailOffset);
        this.drawNailAt(g, width / 2 - nailOffset, height / 2 - nailOffset);

        // 6. Spring Animation
        container.setScale(0.8);
        container.setAlpha(0);
        scene.tweens.add({
            targets: container,
            scaleX: 1, scaleY: 1, alpha: 1,
            duration: 600,
            ease: 'Elastic.easeOut',
            delay: 100
        });

        return container;
    }

    /**
     * Phase 10: Premium Main Panel (Silo, Order Board Modal).
     */
    static createPanel(scene: Phaser.Scene, width: number, height: number, title?: string): Phaser.GameObjects.Container {
        const container = scene.add.container(0, 0);
        const g = scene.add.graphics();
        container.add(g);

        // 1. Wood Frame (Premium)
        this.drawAdvancedPanel(g, width, height, 22);

        // 2. Parchment Inset
        const margin = 20;
        const pW = width - margin * 2;
        const pH = height - margin * 2 - (title ? 35 : 0);
        const pY = (title ? 20 : 0);

        // Deep Inset Shadow (gradient: dark top → transparent)
        g.fillStyle(this.COLORS.WOOD_SHADOW, 0.55);
        g.fillRoundedRect(-pW / 2, pY - pH / 2, pW, pH, 18);
        // Top shadow band inside inset
        g.fillStyle(0x000000, 0.15);
        g.fillRoundedRect(-pW / 2 + 2, pY - pH / 2 + 2, pW - 4, pH / 5, { tl: 16, tr: 16, bl: 0, br: 0 });

        // Parchment Page
        g.fillStyle(this.COLORS.PARCHMENT_LIGHT, 1);
        g.fillRoundedRect(-pW / 2 + 3, pY - pH / 2 + 4, pW - 6, pH - 6, 16);

        // Bottom reflection inside inset
        g.fillStyle(0xFFFFFF, 0.1);
        g.fillRoundedRect(-pW / 2 + 6, pY + pH / 2 - 14, pW - 12, 8, { tl: 0, tr: 0, bl: 14, br: 14 });

        // Parchment Fiber Texture
        this.drawParchmentTexture(g, 0, pY, pW - 8, pH - 8);

        // 3. Title (Premium Typography)
        if (title) {
            const titleY = -height / 2 + 32;
            const text = scene.add.text(0, titleY, title, {
                fontFamily: 'Fredoka, sans-serif',
                fontSize: '32px',
                color: '#FFECB3',
                stroke: '#3E2723',
                strokeThickness: 8,
                fontStyle: 'bold',
            }).setOrigin(0.5);
            text.setShadow(2, 3, '#3E2723', 4, true, true);
            container.add(text);
        }

        // 4. Corner Nails
        const nailOff = 16;
        this.drawNailAt(g, -width / 2 + nailOff, -height / 2 + nailOff);
        this.drawNailAt(g, width / 2 - nailOff, -height / 2 + nailOff);
        this.drawNailAt(g, -width / 2 + nailOff, height / 2 - nailOff);
        this.drawNailAt(g, width / 2 - nailOff, height / 2 - nailOff);

        return container;
    }

    /**
     * Phase 10: Premium Crop Card with inner shadow and gradient.
     */
    static createCard(scene: Phaser.Scene, width: number, height: number, color: number): Phaser.GameObjects.Container {
        const container = scene.add.container(0, 0);
        const g = scene.add.graphics();
        container.add(g);

        const radius = 18;

        // 1. Drop Shadow (deeper)
        g.fillStyle(0x000000, 0.35);
        g.fillRoundedRect(-width / 2 + 3, -height / 2 + 6, width, height, radius);

        // 2. Cartoon Stroke
        g.lineStyle(3, UI_THEME.STROKE.COLOR_BROWN, 1);
        g.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);

        // 3. Base fill with vertical gradient
        const darkColor = Phaser.Display.Color.IntegerToColor(color).darken(20).color;
        g.fillGradientStyle(color, color, darkColor, darkColor, 1);
        g.fillRoundedRect(-width / 2, -height / 2, width, height, radius);

        // 4. Inner Shadow at top (carved recess feeling)
        g.fillStyle(0x000000, 0.12);
        g.fillRoundedRect(-width / 2 + 3, -height / 2 + 2, width - 6, height / 4, { tl: radius - 2, tr: radius - 2, bl: 0, br: 0 });

        // 5. Top Rim Light
        g.fillStyle(0xFFFFFF, 0.35);
        g.fillRoundedRect(-width / 2 + 4, -height / 2 + 2, width - 8, 4, { tl: radius - 2, tr: radius - 2, bl: 0, br: 0 });

        // 6. Bottom Glow (floating on shelf reflection)
        g.fillStyle(0xFFFFFF, 0.08);
        g.fillRoundedRect(-width / 2 + 6, height / 2 - 8, width - 12, 6, { tl: 0, tr: 0, bl: radius - 2, br: radius - 2 });

        return container;
    }

    /**
     * Phase 10: Premium Chunky Button.
     * Features: thick depth extrusion, rim light, cartoon stroke.
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
            const yOffset = isDown ? 5 : 0;
            const depth = isDown ? 0 : 10; // Phase 10: chunkier depth

            if (options.isSquircle) {
                this.drawSquircle(g, w, h, color, depth);
            } else {
                // Pill Shape (Premium)
                const r = h / 2;

                // Shadow Extrusion
                if (depth > 0) {
                    // Soft outer shadow
                    g.fillStyle(0x000000, 0.2);
                    g.fillRoundedRect(-w / 2 + 4, -h / 2 + depth + 6, w, h, r);
                    // Hard depth slab
                    g.fillStyle(Phaser.Display.Color.IntegerToColor(color).darken(35).color, 1);
                    g.fillRoundedRect(-w / 2, -h / 2 + depth, w, h, r);
                }

                // Main Body
                g.fillStyle(color, 1);
                g.fillRoundedRect(-w / 2, -h / 2 + yOffset, w, h, r);

                // Cartoon Stroke (thick)
                g.lineStyle(4, UI_THEME.STROKE.COLOR_BROWN, 1);
                g.strokeRoundedRect(-w / 2, -h / 2 + yOffset, w, h, r);

                // Top Rim Light (sunlit edge)
                g.fillStyle(0xFFFFFF, 0.45);
                g.fillRoundedRect(-w / 2 + 6, -h / 2 + yOffset + 2, w - 12, 4, { tl: r, tr: r, bl: 0, br: 0 });

                // Body Highlight (top half glow)
                g.fillStyle(0xFFFFFF, 0.2);
                g.fillRoundedRect(-w / 2 + 4, -h / 2 + yOffset + 4, w - 8, h / 2 - 6, { tl: r, tr: r, bl: 0, br: 0 });

                // Bottom bevel (dark underside)
                if (!isDown) {
                    g.fillStyle(0x000000, 0.15);
                    g.fillRoundedRect(-w / 2 + 6, h / 2 + yOffset - 6, w - 12, 4, { tl: 0, tr: 0, bl: r, br: r });
                }

                // Decorative nails (Phase 10: Pillar 3)
                this.drawNailAt(g, -w / 2 + 14, yOffset);
                this.drawNailAt(g, w / 2 - 14, yOffset);
            }
        };

        drawBtn(false);

        // Icon
        let tx = 0;
        if (options.icon) {
            tx = 10;
            const scale = options.iconScale ?? 0.7;
            const icon = scene.add.sprite(-w / 2 + 25, 0, options.icon).setScale(scale);
            container.add(icon);
        }

        // Text (Premium Typography — Pillar 4)
        const text = scene.add.text(tx, -2, label, {
            fontFamily: 'Fredoka, sans-serif',
            fontSize: options.fontSize || '22px',
            color: textColor,
            stroke: '#3E2723',
            strokeThickness: 5,
            fontStyle: 'bold',
        }).setOrigin(0.5);
        text.setShadow(2, 2, '#3E2723', 3, true, true);
        container.add(text);

        // Interactive
        container.setSize(w, h);
        container.setInteractive({ cursor: 'pointer' });

        container.on('pointerdown', () => {
            drawBtn(true);
            text.y = 3;
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
