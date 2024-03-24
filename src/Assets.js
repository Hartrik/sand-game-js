// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

/**
 *
 * @author Patrik Harag
 * @version 2023-12-09
 */
export default class Assets {

    /**
     *
     * @param base64
     * @param maxWidth {number|undefined}
     * @param maxHeight {number|undefined}
     * @returns {Promise<ImageData>}
     */
    static asImageData(base64, maxWidth=undefined, maxHeight=undefined) {
        function countSize(imageWidth, imageHeight) {
            let w = imageWidth;
            let h = imageHeight;

            if (maxWidth !== undefined && w > maxWidth) {
                const wScale = w / maxWidth;
                w = maxWidth;
                h = h / wScale;
            }
            if (maxHeight !== undefined && h > maxHeight) {
                const hScale = h / maxHeight;
                h = maxHeight;
                w = w / hScale;
            }

            return [Math.trunc(w), Math.trunc(h)];
        }

        return new Promise((resolve, reject) => {
            try {
                // http://stackoverflow.com/questions/3528299/get-pixel-color-of-base64-png-using-javascript
                let image = new Image();
                image.onload = () => {
                    let canvas = document.createElement('canvas');
                    let [w, h] = countSize(image.width, image.height);
                    canvas.width = w;
                    canvas.height = h;

                    let context = canvas.getContext('2d');
                    context.drawImage(image, 0, 0, canvas.width, canvas.height);

                    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                    resolve(imageData);
                };
                image.onerror = () => {
                    reject('Cannot load image');
                };
                image.src = base64;
            } catch (e) {
                reject(e);
            }
        });
    }
}