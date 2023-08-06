
/**
 * Tools for working with the element tail.
 *
 * The element head structure:
 * <pre>
 *     | color blue                                                    8b  |
 *     | color green                                                   8b  |
 *     | color red                                                     8b  |
 *     | blur type  2b  | burnt lvl  2b  |            2b  |            2b  |
 * </pre>
 *
 * @author Patrik Harag
 * @version 2023-08-06
 */
export class ElementTail {

    static BLUR_TYPE_NONE = 0x0;
    /** This element acts as a background = blur can be applied over this element */
    static BLUR_TYPE_BACKGROUND = 0x1;
    static BLUR_TYPE_1 = 0x2;

    static of(r, g, b, blurType=ElementTail.BLUR_TYPE_NONE) {
        let value = 0;
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