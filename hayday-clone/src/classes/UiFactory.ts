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

    // ===========================
    //  PHASE 11: TACTILE COMPONENTS
    // ===========================

    /**
     * Phase 11: Premium Silo Panel with beveled plank frame,
     * aged parchment with creases & coffee stains, and item dividers.
     */
    static createSiloPanel(
        scene: Phaser.Scene,
        width: number,
        height: number,
        title?: string
    ): Phaser.GameObjects.Container {
        const container = scene.add.container(0, 0);
        const g = scene.add.graphics();
        container.add(g);

        const radius = 22;

        // === THICK BEVELED WOODEN FRAME ===

        // 1. Heavy Drop Shadow (floating)
        g.fillStyle(0x000000, 0.25);
        g.fillRoundedRect(-width / 2 + 8, -height / 2 + 20, width, height, radius + 4);
        // Hard shadow
        g.fillStyle(0x000000, 0.5);
        g.fillRoundedRect(-width / 2 + 4, -height / 2 + 14, width, height, radius + 2);

        // 2. Cartoon Stroke
        g.lineStyle(6, UI_THEME.STROKE.COLOR_BROWN, 1);
        g.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);

        // 3. Dark Wood Base
        g.fillStyle(this.COLORS.WOOD_DARK, 1);
        g.fillRoundedRect(-width / 2, -height / 2, width, height, radius);

        // 4. Gradient Volume
        g.fillGradientStyle(
            this.COLORS.WOOD_LIGHT, this.COLORS.WOOD_LIGHT,
            this.COLORS.WOOD_DARK, this.COLORS.WOOD_DARK, 1
        );
        g.fillRoundedRect(-width / 2 + 2, -height / 2 + 2, width - 4, height - 4, radius - 1);

        // 5. Staggered Horizontal Plank Seams (4 planks)
        const plankCount = 4;
        const plankH = (height - 8) / plankCount;
        for (let i = 1; i < plankCount; i++) {
            const seamY = -height / 2 + 4 + i * plankH;
            // Seam shadow (top)
            g.lineStyle(1.5, this.COLORS.WOOD_SHADOW, 0.3);
            g.beginPath();
            g.moveTo(-width / 2 + 10, seamY);
            g.lineTo(width / 2 - 10, seamY);
            g.strokePath();
            // Seam highlight (bottom)
            g.lineStyle(1, this.COLORS.RIM_LIGHT, 0.2);
            g.beginPath();
            g.moveTo(-width / 2 + 10, seamY + 1.5);
            g.lineTo(width / 2 - 10, seamY + 1.5);
            g.strokePath();
        }

        // 6. Wood Grain on each plank
        this.drawWoodGrain(g, width - 12, height - 12);

        // 7. Left/Top Rim Light (golden edge — sunlight)
        g.fillStyle(this.COLORS.RIM_LIGHT, 0.55);
        g.fillRoundedRect(
            -width / 2 + 2, -height / 2 + 2,
            width - 4, 6,
            { tl: radius - 2, tr: radius - 2, bl: 0, br: 0 }
        );
        // Left edge highlight
        g.fillStyle(this.COLORS.RIM_LIGHT, 0.3);
        g.fillRoundedRect(
            -width / 2 + 2, -height / 2 + 6,
            5, height - 12,
            { tl: 0, tr: 0, bl: radius - 2, br: 0 }
        );

        // 8. Right/Bottom Dark Bevel
        g.fillStyle(this.COLORS.RIM_BOTTOM, 0.5);
        g.fillRoundedRect(
            -width / 2 + 6, height / 2 - 8,
            width - 12, 6,
            { tl: 0, tr: 0, bl: radius - 2, br: radius - 2 }
        );
        g.fillStyle(this.COLORS.RIM_BOTTOM, 0.25);
        g.fillRoundedRect(
            width / 2 - 7, -height / 2 + 6,
            5, height - 12,
            { tl: 0, tr: radius - 2, bl: 0, br: 0 }
        );

        // === AGED PARCHMENT INSET ===
        const margin = 16;
        const pW = width - margin * 2;
        const pH = height - margin * 2 - (title ? 38 : 0);
        const pY = title ? 22 : 0;

        // Carved recess shadow
        g.fillStyle(0x3E2723, 0.65);
        g.fillRoundedRect(-pW / 2, pY - pH / 2, pW, pH, 16);
        // Top inset shadow band
        g.fillStyle(0x000000, 0.25);
        g.fillRoundedRect(-pW / 2 + 2, pY - pH / 2 + 2, pW - 4, pH / 5, { tl: 14, tr: 14, bl: 0, br: 0 });

        // Parchment base (warm gradient)
        g.fillGradientStyle(
            this.COLORS.PARCHMENT_LIGHT, this.COLORS.PARCHMENT_LIGHT,
            this.COLORS.PARCHMENT_BASE, this.COLORS.PARCHMENT_BASE, 1
        );
        g.fillRoundedRect(-pW / 2 + 3, pY - pH / 2 + 4, pW - 6, pH - 6, 14);

        // Coffee stains (faint brown spots)
        g.fillStyle(0xD7CCC8, 0.12);
        g.fillEllipse(
            Phaser.Math.Between(-pW / 4, pW / 4),
            pY + Phaser.Math.Between(-pH / 4, pH / 6),
            Phaser.Math.Between(12, 22),
            Phaser.Math.Between(10, 18)
        );
        g.fillStyle(0xBCAAA4, 0.08);
        g.fillEllipse(
            Phaser.Math.Between(-pW / 3, pW / 3),
            pY + Phaser.Math.Between(-pH / 6, pH / 4),
            Phaser.Math.Between(8, 14),
            Phaser.Math.Between(6, 10)
        );

        // Crease marks (diagonal thin lines)
        g.lineStyle(1, this.COLORS.PARCHMENT_SHADOW, 0.06);
        const creaseCount = 3;
        for (let c = 0; c < creaseCount; c++) {
            const cx1 = Phaser.Math.Between(-pW / 2 + 10, pW / 2 - 10);
            const cy1 = pY + Phaser.Math.Between(-pH / 2 + 10, pH / 2 - 10);
            g.beginPath();
            g.moveTo(cx1, cy1);
            g.lineTo(cx1 + Phaser.Math.Between(-20, 20), cy1 + Phaser.Math.Between(10, 30));
            g.strokePath();
        }

        // Fiber texture
        this.drawParchmentTexture(g, 0, pY, pW - 10, pH - 10);

        // Bottom reflection
        g.fillStyle(0xFFFFFF, 0.08);
        g.fillRoundedRect(-pW / 2 + 6, pY + pH / 2 - 14, pW - 12, 8, { tl: 0, tr: 0, bl: 12, br: 12 });

        // === TITLE ===
        if (title) {
            const titleY = -height / 2 + 30;
            const text = scene.add.text(0, titleY, title, {
                fontFamily: 'Fredoka, sans-serif',
                fontSize: '28px',
                color: '#FFECB3',
                stroke: '#3E2723',
                strokeThickness: 8,
                fontStyle: 'bold',
            }).setOrigin(0.5);
            text.setShadow(2, 3, '#3E2723', 4, true, true);
            container.add(text);
        }

        // === CORNER NAILS ===
        const nailOff = 14;
        this.drawNailAt(g, -width / 2 + nailOff, -height / 2 + nailOff);
        this.drawNailAt(g, width / 2 - nailOff, -height / 2 + nailOff);
        this.drawNailAt(g, -width / 2 + nailOff, height / 2 - nailOff);
        this.drawNailAt(g, width / 2 - nailOff, height / 2 - nailOff);

        // Inner Rim (subtle)
        g.lineStyle(1, 0xFFFFFF, 0.1);
        g.strokeRoundedRect(-width / 2 + 5, -height / 2 + 5, width - 10, height - 10, radius - 4);

        return container;
    }

    /**
     * Phase 11: Draws a divider line for silo rows.
     * Renders shadow + highlight for embossed look.
     */
    static drawSiloDivider(
        g: Phaser.GameObjects.Graphics,
        x: number, y: number,
        width: number
    ) {
        // Shadow line
        g.lineStyle(1.5, 0x3E2723, 0.15);
        g.beginPath();
        g.moveTo(x - width / 2, y);
        g.lineTo(x + width / 2, y);
        g.strokePath();
        // Highlight line (below)
        g.lineStyle(1, 0xFFFFFF, 0.12);
        g.beginPath();
        g.moveTo(x - width / 2, y + 1.5);
        g.lineTo(x + width / 2, y + 1.5);
        g.strokePath();
    }

    /**
     * Phase 11: Contact shadow under an icon.
     * Small dark ellipse that grounds the icon on the surface.
     */
    static drawContactShadow(
        g: Phaser.GameObjects.Graphics,
        x: number, y: number,
        width: number = 18,
        height: number = 6
    ) {
        g.fillStyle(0x000000, 0.18);
        g.fillEllipse(x + 1, y + 2, width, height);
    }

    /**
     * Phase 11: Recessed carved pocket for crop slots.
     * Features: dark inset, metallic ring, parchment interior.
     */
    static createCropSlot(
        scene: Phaser.Scene,
        width: number,
        height: number,
        isLocked: boolean = false
    ): Phaser.GameObjects.Container {
        const container = scene.add.container(0, 0);
        const g = scene.add.graphics();
        container.add(g);

        const radius = 16;

        // === CARVED POCKET ===

        // 1. Outer Shadow (pocket carved into wood)
        g.fillStyle(0x000000, 0.4);
        g.fillRoundedRect(-width / 2 + 2, -height / 2 + 3, width, height, radius);

        // 2. Dark hole interior
        g.fillStyle(0x3E2723, 1);
        g.fillRoundedRect(-width / 2, -height / 2, width, height, radius);

        // 3. Inset shadow (top-left darker)
        g.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000);
        g.fillStyle(0x000000, 0.35);
        g.fillRoundedRect(-width / 2 + 1, -height / 2 + 1, width - 2, height / 3, { tl: radius - 1, tr: radius - 1, bl: 0, br: 0 });

        // 4. Parchment Interior (cream fill)
        const inset = 4;
        const innerW = width - inset * 2;
        const innerH = height - inset * 2;
        g.fillGradientStyle(
            this.COLORS.PARCHMENT_LIGHT, this.COLORS.PARCHMENT_LIGHT,
            this.COLORS.PARCHMENT_BASE, this.COLORS.PARCHMENT_BASE, 1
        );
        g.fillRoundedRect(-innerW / 2, -innerH / 2 + 2, innerW, innerH, radius - 3);

        // Micro fiber texture
        g.fillStyle(this.COLORS.PARCHMENT_SHADOW, 0.05);
        for (let i = 0; i < 8; i++) {
            g.fillCircle(
                Phaser.Math.Between(-innerW / 2 + 4, innerW / 2 - 4),
                Phaser.Math.Between(-innerH / 2 + 6, innerH / 2 - 4),
                Phaser.Math.Between(1, 2)
            );
        }

        // 5. Bottom-right reflected light
        g.fillStyle(0xFFFFFF, 0.1);
        g.fillRoundedRect(-innerW / 2 + 4, innerH / 2 - 8, innerW - 8, 5, { tl: 0, tr: 0, bl: radius - 4, br: radius - 4 });

        // === METALLIC RING ===

        // Ring shadow (outer)
        g.lineStyle(4, 0x000000, 0.15);
        g.strokeRoundedRect(-width / 2 - 1, -height / 2 - 1, width + 2, height + 2, radius + 1);

        // Dark base ring
        g.lineStyle(3, 0x616161, 1);
        g.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);

        // Silver highlight (bright inner edge)
        g.lineStyle(1.5, 0xBDBDBD, 0.8);
        g.strokeRoundedRect(-width / 2 + 1, -height / 2 + 1, width - 2, height - 2, radius - 1);

        // Specular dots on ring (top-left)
        g.fillStyle(0xFFFFFF, 0.65);
        g.fillCircle(-width / 2 + 8, -height / 2 + 6, 2);
        g.fillStyle(0xFFFFFF, 0.4);
        g.fillCircle(-width / 2 + 14, -height / 2 + 4, 1.2);

        // === DARKENED OVERLAY FOR LOCKED ===
        if (isLocked) {
            g.fillStyle(0x000000, 0.45);
            g.fillRoundedRect(-innerW / 2, -innerH / 2 + 2, innerW, innerH, radius - 3);
        }

        return container;
    }

    /**
     * Phase 11: Rusty padlock with shackle and chain links.
     * Draws over a locked crop slot.
     */
    static drawPadlock(
        g: Phaser.GameObjects.Graphics,
        x: number, y: number
    ) {
        // === IRON SHACKLE (U-shape arc) ===
        const shackleW = 14;
        const shackleH = 10;
        // Shadow
        g.fillStyle(0x000000, 0.3);
        g.fillRect(x - shackleW / 2 + 1, y - 16, 3, shackleH + 2);
        g.fillRect(x + shackleW / 2 - 3, y - 16, 3, shackleH + 2);
        // Shackle bars
        g.fillStyle(0x616161, 1);
        g.fillRect(x - shackleW / 2, y - 18, 3, shackleH);
        g.fillRect(x + shackleW / 2 - 2, y - 18, 3, shackleH);
        // Shackle top (arc approximation — wide rect with rounded top)
        g.fillStyle(0x757575, 1);
        g.fillRoundedRect(x - shackleW / 2, y - 20, shackleW + 1, 6, { tl: 6, tr: 6, bl: 0, br: 0 });
        // Shackle highlight
        g.fillStyle(0xBDBDBD, 0.5);
        g.fillRect(x - shackleW / 2, y - 20, 2, 4);

        // === PADLOCK BODY ===
        const lockW = 18;
        const lockH = 14;
        const lockR = 4;

        // Shadow
        g.fillStyle(0x000000, 0.35);
        g.fillRoundedRect(x - lockW / 2 + 1, y - 8 + 2, lockW, lockH, lockR);

        // Rust-brown gradient body
        g.fillStyle(0x795548, 1);
        g.fillRoundedRect(x - lockW / 2, y - 8, lockW, lockH, lockR);
        // Lighter top half
        g.fillStyle(0x8D6E63, 1);
        g.fillRoundedRect(x - lockW / 2 + 1, y - 8, lockW - 2, lockH / 2, { tl: lockR - 1, tr: lockR - 1, bl: 0, br: 0 });

        // Keyhole
        g.fillStyle(0x3E2723, 1);
        g.fillCircle(x, y - 3, 2.5);
        g.fillRect(x - 1, y - 2, 2, 4);

        // Surface scratches (rust detail)
        g.lineStyle(0.5, 0x4E342E, 0.2);
        g.beginPath();
        g.moveTo(x - 6, y - 6); g.lineTo(x - 2, y - 4);
        g.moveTo(x + 3, y - 5); g.lineTo(x + 7, y - 2);
        g.moveTo(x - 4, y + 1); g.lineTo(x + 2, y + 3);
        g.strokePath();

        // Specular highlight
        g.fillStyle(0xFFFFFF, 0.35);
        g.fillCircle(x - 5, y - 6, 1.5);

        // Cartoon stroke around body
        g.lineStyle(1.5, 0x3E2723, 0.8);
        g.strokeRoundedRect(x - lockW / 2, y - 8, lockW, lockH, lockR);
    }

    /**
     * Phase 11: Chain links draping across a slot.
     * Draws 3-4 oval chain links in a diagonal line.
     */
    static drawChainLinks(
        g: Phaser.GameObjects.Graphics,
        startX: number, startY: number,
        endX: number, endY: number,
        linkCount: number = 4
    ) {
        const dx = (endX - startX) / linkCount;
        const dy = (endY - startY) / linkCount;

        for (let i = 0; i < linkCount; i++) {
            const lx = startX + dx * i + dx / 2;
            const ly = startY + dy * i + dy / 2;
            const isVertical = i % 2 === 0;

            const linkW = isVertical ? 5 : 8;
            const linkH = isVertical ? 8 : 5;

            // Link shadow
            g.fillStyle(0x000000, 0.25);
            g.fillEllipse(lx + 1, ly + 1.5, linkW + 1, linkH + 1);

            // Dark iron fill
            g.fillStyle(0x616161, 1);
            g.fillEllipse(lx, ly, linkW, linkH);

            // Inner hole
            g.fillStyle(0x000000, 0.3);
            g.fillEllipse(lx, ly, linkW - 3, linkH - 3);

            // Highlight strip
            g.fillStyle(0xBDBDBD, 0.4);
            g.fillEllipse(lx - 1, ly - 1, linkW / 2, linkH / 3);
        }
    }

    /**
     * Phase 11: Golden selection glow ring (replaces flat green stroke).
     */
    static drawGoldenSelectionRing(
        g: Phaser.GameObjects.Graphics,
        width: number,
        height: number,
        radius: number = 18
    ) {
        // Outer glow
        g.lineStyle(5, 0xFFD54F, 0.3);
        g.strokeRoundedRect(-width / 2 - 4, -height / 2 - 4, width + 8, height + 8, radius + 4);
        // Main ring
        g.lineStyle(3, 0xFFD54F, 0.9);
        g.strokeRoundedRect(-width / 2 - 2, -height / 2 - 2, width + 4, height + 4, radius + 2);
        // Inner bright edge
        g.lineStyle(1, 0xFFECB3, 0.6);
        g.strokeRoundedRect(-width / 2 - 1, -height / 2 - 1, width + 2, height + 2, radius + 1);
    }
}
