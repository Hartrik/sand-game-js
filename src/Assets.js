import _IMG_ELEMENT_SIZE_1 from '../assets/element-size-1.png'
import _IMG_ELEMENT_SIZE_2 from '../assets/element-size-2.png'
import _IMG_ELEMENT_SIZE_3 from '../assets/element-size-3.png'
import _IMG_ELEMENT_SIZE_4 from '../assets/element-size-4.png'
import _TEXTURE_ROCK from '../assets/texture-rock.png'
import _GRADIENT_RAINBOW from '../assets/gradient-rainbow.png'

/**
 *
 * @author Patrik Harag
 * @version 2023-04-10
 */
export class Assets {

    static IMG_ELEMENT_SIZE_1 = _IMG_ELEMENT_SIZE_1;
    static IMG_ELEMENT_SIZE_2 = _IMG_ELEMENT_SIZE_2;
    static IMG_ELEMENT_SIZE_3 = _IMG_ELEMENT_SIZE_3;
    static IMG_ELEMENT_SIZE_4 = _IMG_ELEMENT_SIZE_4;
    static TEXTURE_ROCK = _TEXTURE_ROCK;
    static GRADIENT_RAINBOW = _GRADIENT_RAINBOW;


    /**
     *
     * @param base64
     * @returns {Promise<ImageData>}
     */
    static asImageData(base64) {
        let promise = new Promise((resolve, reject) => {
            try {
                // http://stackoverflow.com/questions/3528299/get-pixel-color-of-base64-png-using-javascript
                let image = new Image();
                image.onload = () => {
                    let canvas = document.createElement('canvas');
                    canvas.width = image.width;
                    canvas.height = image.height;

                    let context = canvas.getContext('2d');
                    context.drawImage(image, 0, 0);

                    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                    resolve(imageData);
                };
                image.src = base64;
            } catch (e) {
                reject(e);
            }
        });
        return promise;
    }
}