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
let TYPE_BRANCH = 2;
let TYPE_LEAF = 3;
let TYPE_ROOT = 4;

function color(x, y, imageData) {
    let index = (y * imageData.width + x) * 4;
    let r = imageData.data[index];
    let g = imageData.data[index + 1];
    let b = imageData.data[index + 2];
    return [r, g, b];
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function parseTemplate(imageData, cx, cy) {
    let entries = [];
    let entriesCount = 0;



    let walk = (buffer, sx, sy, t) => {
        let thisBuffer = [];

        let [tr, tg, tb] = t;

        let visited = new Set();
        visited.add(sy * imageData.width + sx);

        let queue = [[sx, sy]];

        while (queue.length > 0) {
            let [x, y] = queue.shift();

            thisBuffer.push([cx - x, cy - y, TYPE_LEAF]);

            entriesCount++;

            let directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            shuffleArray(directions);
            for (let [dx, dy] of directions) {
                let tx = x + dx;
                let ty = y + dy;

                let [r, g, b] = color(tx, ty, imageData);
                if (r === tr && g === tg && b === tb) {

                    // prevent cycles...
                    let i = (ty * imageData.width + tx);
                    if (visited.has(i)) {
                        continue;
                    } else {
                        visited.add(i);
                    }

                    queue.push([tx, ty]);
                }
            }
        }

        let shift = thisBuffer.shift();
        shift.push(thisBuffer);
        buffer.push(shift);
    };

    let functions = [
        () => walk(entries, cx - 1, cy, [34, 177, 76]),  // walk green left
        () => walk(entries, cx + 1, cy, [34, 177, 76]),  // walk green right
        () => walk(entries, cx, cy - 1, [0, 0, 0]),  // walk black above
        () => walk(entries, cx, cy + 1, [0, 0, 0]),  // walk black below
    ];
    shuffleArray(functions);
    functions.forEach(f => f());

    // build result
    return {
        entries: entries,
        entriesCount: entriesCount,
    };
}

function parseTemplates(imageData) {
    let results = [];
    for (let y = 0; y < imageData.height; y++) {
        for (let x = 0; x < imageData.width; x++) {
            let [r, g, b] = color(x, y, imageData);
            if (r === 237 && g === 28 && b === 36) {
                let template = parseTemplate(imageData, x, y);
                results.push(template);
            }
        }
    }
    return results;
}

document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");
    const imageInput = document.getElementById("imageInput");
    const slider = document.getElementById("lengthSlider");

    let templates = null;

    imageInput.addEventListener("change", function (event) {
        loadImage(event.target.files[0], (imageData) => {
            templates = parseTemplates(imageData);
            console.log(templates);
            console.log(JSON.stringify(templates));
            redraw();
        });
    });

    slider.addEventListener("input", function () {
        redraw();
    });

    function drawTemplate(template, offsetX, offsetY, pixelSize) {
        let maxI = Math.trunc((slider.value / 1000) * template.entriesCount);

        ctx.fillStyle = '#FF0000';
        ctx.fillRect(offsetX * pixelSize, offsetY * pixelSize, pixelSize, pixelSize);

        let totalI = 0;
        let parallelBranches = [{
            entries: template.entries,
            index: 0
        }];
        while (parallelBranches.length > 0 && totalI < maxI) {
            const length = parallelBranches.length;
            let toDelete = [];
            for (let i = 0; i < length; i++) {
                const branch = parallelBranches[i];

                if (branch.index >= branch.entries.length) {
                    // end of branch
                    toDelete.push(i);
                    continue;
                }

                let entry = branch.entries[branch.index++];
                let [x, y, type] = entry;

                ctx.fillStyle = '#000000';
                ctx.fillRect(((-1 * x) + offsetX) * pixelSize, ((-1 * y) + offsetY) * pixelSize, pixelSize, pixelSize);

                let newParallelEntries = (entry.length > 3) ? entry[3] : undefined;
                if (newParallelEntries !== undefined) {
                    parallelBranches.push({
                        entries: newParallelEntries,
                        index: 0
                    });
                }

                totalI++;
            }

            if (toDelete.length > 0) {
                for (let i = toDelete.length - 1; i >= 0; i--) {
                    let j = toDelete[i];
                    parallelBranches.splice(j, 1);
                }
                toDelete = [];
            }
        }
    }

    function redraw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (templates === null) {
            return;
        }

        let offsetX = 25;
        let offsetY = 25
        let pixelSize = 4;

        for (let i = 0; i < templates.length; i++) {
            let template = templates[i];
            let x = i % 3;
            let y = Math.trunc(i / 3);
            drawTemplate(template, offsetX * (x + 1), offsetY * (y + 1), pixelSize);
        }
    }
});
