
/**
 * Tools for working with the element tail.
 *
 * The element head structure: <code>0x[flags][red][green][blue]</code> (32b)
 * <pre>
 *     |            2b  |            2b  | burnt lvl  2b  | blur type  2b  |
 *     | color red                                                     8b  |
 *     | color green                                                   8b  |
 *     | color blue                                                    8b  |
 * </pre>
 *
 * @author Patrik Harag
 * @version 2023-12-04
 */
export class ElementTail {

    static BLUR_TYPE_NONE = 0x0;
    /** This element acts as a background = blur can be applied over this element */
    static BLUR_TYPE_BACKGROUND = 0x1;
    static BLUR_TYPE_1 = 0x2;

    static HEAT_EFFECT_NONE = 0x0;
    static HEAT_EFFECT_1 = 0x1;
    static HEAT_EFFECT_2 = 0x2;
    static HEAT_EFFECT_3 = 0x3;

    static of(r, g, b, blurType=ElementTail.BLUR_TYPE_NONE, heatEffect=0, burntLevel=0) {
        let value = 0;
        value = (value | (heatEffect & 0x03)) << 2;
        value = (value | (burntLevel & 0x03)) << 2;
        value = (value | (blurType & 0x03)) << 8;
        value = (value | (r & 0xFF)) << 8;
        value = (value | (g & 0xFF)) << 8;
        value = value | (b & 0xFF);
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

    static getBlurType(elementTail) {
        return (elementTail >> 24) & 0x00000003;
    }

    static getBurntLevel(elementTail) {
        return (elementTail >> 26) & 0x00000003;
    }

    static getHeatEffect(elementTail) {
        return (elementTail >> 28) & 0x00000003;
    }

    static setColor(elementTail, r, g, b) {
        elementTail = (elementTail & ~(0x00FF0000)) | (r << 16);
        elementTail = (elementTail & ~(0x0000FF00)) | (g << 8);
        elementTail = (elementTail & ~(0x000000FF)) | (b);
        return elementTail;
    }

    static setBurntLevel(elementTail, burntLevel) {
        return (elementTail & 0xF3FFFFFF) | (burntLevel << 26);
    }
}