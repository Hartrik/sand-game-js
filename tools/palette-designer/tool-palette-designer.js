
const INIT_PALETTE = '137,86,89\n137,86,89\n137,86,89\n137,86,89\n137,86,89\n137,86,89\n125,70,72\n125,70,72\n147,93,96' +
        '\n147,93,96\n138,84,86\n138,84,86\n118,72,75\n118,72,75\n101,61,65\n151,104,106\n';

/**
 *
 * @author Patrik Harag
 * @version 2024-03-12
 */
function initPaletteDesigner(root) {
    const sandGameRoot = document.createElement('div');
    sandGameRoot.id = 'sand-game-root';

    const paletteDesignerRoot = document.createElement('div');
    paletteDesignerRoot.classList.add('palette-designer');
    paletteDesignerRoot.appendChild(sandGameRoot);

    // control panel

    const controlPanel = document.createElement('div');
    controlPanel.classList.add('control-panel');

    // -- palette

    const codeArea = document.createElement('textarea');
    codeArea.id = 'code-area';
    codeArea.classList.add('form-control', 'mb-3');
    codeArea.placeholder = 'Palette here...';
    codeArea.value = INIT_PALETTE;

    // -- description

    const codeAreaDescription = document.createElement('p');
    codeAreaDescription.textContent = 'Drag & drop supported – palette CSV or image';

    controlPanel.appendChild(codeArea);
    controlPanel.appendChild(codeAreaDescription);

    // -- checkbox

    const formCheck = document.createElement("div");
    formCheck.className = "form-check";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "form-check-input";
    checkbox.id = "palette-designer-check";

    const label = document.createElement("label");
    label.className = "form-check-label";
    label.htmlFor = "palette-designer-check";
    label.textContent = "Cyclic Brush";

    formCheck.appendChild(checkbox);
    formCheck.appendChild(label);

    controlPanel.appendChild(formCheck);

    paletteDesignerRoot.appendChild(controlPanel);

    // initialize

    root.appendChild(paletteDesignerRoot);

    _initSandGame(sandGameRoot, codeArea, checkbox);
}

function _initSandGame(sandGameRoot, codeArea, checkbox) {
    let sandGame = null;

    function update() {
        _evaluatePalette(sandGame, codeArea, checkbox);
    }

    const SandGameJS = window.SandGameJS;
    if (SandGameJS !== undefined) {

        const config = {
            version: 'dev',
            debug: false,
            scene: {
                init: (s) => {
                    sandGame = s;
                    update();
                }
            },
            autoStart: false,
            tools: [],
            primaryTool: SandGameJS.ToolDefs.NONE,
            secondaryTool: SandGameJS.ToolDefs.NONE,
            tertiaryTool: SandGameJS.ToolDefs.NONE,
            disableImport: true,
            disableExport: true,
            disableSizeChange: true,
            disableSceneSelection: true,
            disableStartStop: true,
            disableRestart: true
        };
        SandGameJS.init(sandGameRoot, config);

        // init on key typed...
        codeArea.addEventListener('keyup', (event) => {
            update();
        });

        // init drag and drop
        document.getElementById('main').ondrop = function(e) {
            e.preventDefault();

            let reader = new FileReader();
            let file = e.dataTransfer.files[0];

            if (file.type.startsWith('image/')) {
                reader.onload = function (e) {
                    _processImage(e.target.result, function (imageData) {
                        codeArea.value = _imageDataAsPalette(imageData);
                        update();
                    });
                };
                reader.readAsDataURL(file);
            } else {
                reader.onload = function(event) {
                    codeArea.value = event.target.result;
                    update();
                };
                reader.readAsText(file);
            }

            return false;
        };

        // init checkbox

        checkbox.addEventListener("change", function() {
            update();
        });

    } else {
        sandGameRoot.innerHTML = '<p style="color: red; font-weight: bold;">Failed to load the engine.</p>';
    }
}

function _processImage(url, callback) {
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

function _imageDataAsPalette(imageData) {
    let result = '';
    for (let y = 0; y < imageData.height; y++) {
        for (let x = 0; x < imageData.width; x++) {
            let index = (y * imageData.width + x) * 4;
            let r = imageData.data[index];
            let g = imageData.data[index + 1];
            let b = imageData.data[index + 2];
            result += `${r},${g},${b}\n`;
        }
    }
    return result;
}

function _evaluatePalette(sandGame, codeArea, checkbox) {
    if (sandGame === null) {
        return;
    }

    const code = codeArea.value;

    try {
        let brush = (checkbox.checked)
                ? SandGameJS.Brushes.colorPaletteCyclic(code, sandGame.getWidth() * 2, SandGameJS.BrushDefs.WALL)
                : SandGameJS.Brushes.colorPaletteRandom(code, SandGameJS.BrushDefs.WALL);
        sandGame.graphics().fill(brush);
    } catch (error) {
        console.error(error);
    }
}
