//
// @author Patrik Harag
//

let TYPE_TRUNK = 1;
let TYPE_BRANCH_POS = 2;
let TYPE_LEAF = 3;

document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");
    const trunkSlider = document.getElementById("trunkSlider");
    const iterationSlider = document.getElementById("lengthSlider");
    const randomizeButton = document.getElementById("randomizeButton");

    let leafClustersRnd = [];
    for (let i = 0; i < 50; i++) {
        leafClustersRnd[i] = Math.trunc(Math.random() * LEAF_CLUSTER_TEMPLATES.length);
    }

    trunkSlider.addEventListener("input", function () {
        redraw();
    });

    iterationSlider.addEventListener("input", function () {
        redraw();
    });

    randomizeButton.addEventListener("click", function () {
        for (let i = 0; i < 50; i++) {
            leafClustersRnd[i] = Math.trunc(Math.random() * LEAF_CLUSTER_TEMPLATES.length);
        }
        redraw();
    });


    function setColor(c) {
        ctx.fillStyle = `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
    }

    function randomColor(colors) {
        let r = Math.random();
        setColor(colors[Math.trunc(colors.length * r)]);
    }

    function redraw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let offsetX = 50;
        let offsetY = 80
        let pixelSize = 4;

        let templateIndex = Math.trunc((trunkSlider.value / 1000) * (TRUNK_TEMPLATES.length - 1));
        let template = TRUNK_TEMPLATES[templateIndex];
        let maxI = Math.trunc((iterationSlider.value / 1000) * (template.entriesCount - 1));
        if (maxI === template.entriesCount - 1) {
            maxI = Number.MAX_SAFE_INTEGER;  // TODO
        }

        let totalI = 0;
        let parallelBranches = [{
            entries: template.entries,
            index: 0,
            x: 0,
            y: 0,
            texture: null
        }];
        let clusterI = 0;
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
                x += branch.x;
                y += branch.y;

                if (x === 0 && y === 0) {
                    ctx.fillStyle = '#FF0000';
                    totalI++;
                } else if (type === TYPE_BRANCH_POS) {
                    let leafClusterId = leafClustersRnd[clusterI++];
                    let leafCluster = LEAF_CLUSTER_TEMPLATES[leafClusterId];
                    let texture = leafClusterId % 2 === 0 ? LEAF_TEXTURE_1 : LEAF_TEXTURE_2;
                    parallelBranches.push({
                        entries: leafCluster.entries,
                        index: 0,
                        x: x,
                        y: y,
                        texture: texture
                    });
                    randomColor(texture);
                    totalI++;
                } else if (type === TYPE_LEAF) {
                    randomColor(branch.texture);
                } else if (type === TYPE_TRUNK) {
                    randomColor(TRUNK_TEXTURE);
                    totalI++;
                } else {
                    throw 'Unknown type';
                }
                ctx.fillRect(((-1 * x) + offsetX) * pixelSize, ((-1 * y) + offsetY) * pixelSize, pixelSize, pixelSize);

                let newParallelEntries = (entry.length > 3) ? entry[3] : undefined;
                if (newParallelEntries !== undefined) {
                    parallelBranches.push({
                        entries: newParallelEntries,
                        index: 0,
                        x: branch.x,
                        y: branch.y,
                        texture: branch.texture
                    });
                }

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

    redraw();
});
