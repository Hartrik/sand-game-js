//
// @author Patrik Harag
//

function processImage(url, callback) {
    const image = new Image();
    image.src = url;

    image.onload = function () {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = image.width;
        tempCanvas.height = image.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(image, 0, 0);

        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        callback(imageData);
    }
}

function loadImage(file, callback) {
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            processImage(e.target.result, callback);
        };
        reader.readAsDataURL(file);
    }
}

let TYPE_TRUNK = 1;
let TYPE_TRUNK_BRANCH = 2;

function parseTemplate(imageData) {
    let entries = [];

    let [xr, xg, xb] = [0, 0, 0];  // split
    let [br, bg, bb] = [34, 177, 76];  // branch

    let color = (x, y) => {
        let index = (y * imageData.width + x) * 4;
        let r = imageData.data[index];
        let g = imageData.data[index + 1];
        let b = imageData.data[index + 2];
        return [r, g, b];
    }

    let findRoot = (t) => {
        const [tr, tg, tb] = t;
        for (let x = 0; x < imageData.width; x++) {
            let y = imageData.height - 1;
            let [r, g, b] = color(x, y);

            if (r === tr && g === tg && b === tb) {
                return [x, y];
            }
        }
        return [undefined, undefined];
    };

    const [offsetX, offsetY] = findRoot([237, 28, 36]); // find root red
    let entriesCount = 0;

    let walk = (buffer, t, sx, sy, visited) => {
        let root = false;
        if (sx === undefined) {
            root = true;

            [sx, sy] = findRoot(t);
            if (sx === undefined) {
                return;  // this color is not used
            }

            // prevent cycles...
            visited = new Set();
            let i = (sy * imageData.width + sx);
            visited.add(i);

            buffer.push([offsetX - sx, offsetY - sy, TYPE_TRUNK]);
            entriesCount++;
        }

        const [tr, tg, tb] = t;
        for (let [dx, dy] of [[-1, 0], [1, 0], [0, -1], [-1, -1], [1, -1]]) {
            let tx = sx + dx;
            let ty = sy + dy;

            // prevent cycles...
            let i = (ty * imageData.width + tx);
            if (visited.has(i)) {
                continue;
            } else {
                visited.add(i);
            }

            let [r, g, b] = color(tx, ty);

            if (r === tr && g === tg && b === tb) {
                buffer.push([offsetX - tx, offsetY - ty, TYPE_TRUNK]);
                walk(buffer, t, tx, ty, visited);
                entriesCount++;
            } else if (r === xr && g === xg && b === xb) {
                // buffer split
                let newBuffer = [];
                buffer.push([offsetX - tx, offsetY - ty, TYPE_TRUNK, newBuffer]);
                walk(newBuffer, t, tx, ty, visited);
                entriesCount++;
            } else if (r === br && g === bg && b === bb) {
                // branch
                buffer.push([offsetX - tx, offsetY - ty, TYPE_TRUNK_BRANCH]);
                entriesCount++;
            }
        }

        // walk detached paths
        if (root) {
            for (let ty = imageData.height - 1; ty >= 0; ty--) {
                for (let tx = 0; tx < imageData.width; tx++) {
                    // prevent cycles...
                    let i = (ty * imageData.width + tx);
                    if (visited.has(i)) {
                        continue;
                    } else {
                        visited.add(i);
                    }

                    let [r, g, b] = color(tx, ty);

                    if (r === tr && g === tg && b === tb) {
                        buffer.push([offsetX - tx, offsetY - ty, TYPE_TRUNK]);
                        walk(buffer, t, tx, ty, visited);
                        entriesCount++;
                    }
                }
            }
        }
    };

    walk(entries, [237, 28, 36]);  // walk red
    walk(entries, [255, 127, 39]);  // walk orange
    walk(entries, [0, 162, 232]);  // walk blue
    walk(entries, [163, 73, 164]);  // walk purple

    // build result
    return {
        entries: entries,
        entriesCount: entriesCount,
    };
}

document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");
    const imageInput = document.getElementById("imageInput");
    const slider = document.getElementById("lengthSlider");

    let template = null;

    imageInput.addEventListener("change", function (event) {
        loadImage(event.target.files[0], (imageData) => {
            template = parseTemplate(imageData);
            console.log(JSON.stringify(template));
            redraw();
        });
    });

    slider.addEventListener("input", function () {
        redraw();
    });

    function redraw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (template === null) {
            return;
        }

        let offsetX = 50;
        let offsetY = 80
        let pixelSize = 4;
        let maxI = Math.trunc((slider.value / 1000) * template.entriesCount);

        let stack = [];
        for (let child of template.entries) {
            stack.push(child);
        }

        let totalI = 0;
        while (stack.length > 0 && totalI < maxI) {
            totalI++;
            let entry = stack.shift(); //stack.pop();
            let [x, y, type] = entry;

            if (x === 0 && y === 0) {
                ctx.fillStyle = '#FF0000';
            } else if (type === TYPE_TRUNK_BRANCH) {
                ctx.fillStyle = '#42dc1a';
            } else {
                ctx.fillStyle = '#000000';
            }
            ctx.fillRect(((-1 * x) + offsetX) * pixelSize, ((-1 * y) + offsetY) * pixelSize, pixelSize, pixelSize);

            let splitEntries = (entry.length > 3) ? entry[3] : undefined;
            if (splitEntries !== undefined) {
                let reversed = [...splitEntries];
                reversed.reverse();
                for (let child of reversed) {
                    stack.unshift(child);
                }
            }
        }
    }
});
