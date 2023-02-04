
/**
 *
 * @author Patrik Harag
 * @version 2023-01-28
 */
export class ElementTail {
    static MODIFIER_BACKGROUND = 0x01000000;
    static MODIFIER_BLUR_ENABLED = 0x02000000;

    static of(r, g, b, renderingModifiers) {
        let value = 0;
        value = (value | r) << 8;
        value = (value | g) << 8;
        value = value | b;
        value = value | renderingModifiers
        return value;
    }

    static getColorRed(elementTail) {
        return (elementTail >> 16) & 0x000000FF;
    }

    static getColorGreen(elementTail) {
        return (elementTail >> 8) & 0x000000FF;
    }

    static getColorBlue(elementTail) {
        return elementTail & 0x000000FF;
    }

    static isRenderingModifierBackground(elementTail) {
        return (elementTail & ElementTail.MODIFIER_BACKGROUND) !== 0;
    }

    static isRenderingModifierBlurEnabled(elementTail) {
        return (elementTail & ElementTail.MODIFIER_BLUR_ENABLED) !== 0;
    }

    static setColor(elementTail, r, g, b) {
        elementTail = (elementTail & ~(0x00FF0000)) | (r << 16);
        elementTail = (elementTail & ~(0x0000FF00)) | (g << 8);
        elementTail = (elementTail & ~(0x000000FF)) | (b);
        return elementTail;
    }
}