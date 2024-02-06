
const sandGameRoot = document.getElementById('sand-game-root');

var sandGame;
var Brushes;
var BrushDefs;

const initScript = `
Brushes.join([
    Brushes.color(155, 155, 155, BrushDefs.WALL),
    Brushes.colorNoise([
        { seed: 40, factor: 40, threshold: 0.4, force: 0.75 },
        { seed: 40, factor: 20, threshold: 0.5, force: 0.4 },
        { seed: 40, factor: 10, threshold: 0.4, force: 0.2 },
        { seed: 40, factor: 5, threshold: 0.4, force: 0.1 },
    ], 135, 135, 135),
    Brushes.colorNoise([
        { seed: 41, factor: 10, threshold: 0.4, force: 0.4 },
        { seed: 41, factor: 6, threshold: 0.3, force: 0.3 },
        { seed: 41, factor: 4, threshold: 0.5, force: 0.3 },
    ], 130, 130, 130)
]);
`.trim();

document.addEventListener('DOMContentLoaded', () => {
    const codeArea = document.getElementById('code-area');
    codeArea.value = initScript;

    // init drag and drop
    document.getElementById('main').ondrop = function(e) {
        e.preventDefault();

        let reader = new FileReader();
        let file = e.dataTransfer.files[0];
        reader.onload = function(event) {
            codeArea.value = event.target.result;
            evaluateCode();
        };
        reader.readAsText(file);

        return false;
    };

    const SandGameJS = window.SandGameJS;

    if (SandGameJS !== undefined) {

        const config = {
            version: 'dev',
            debug: false,
            scene: {
                init: (s) => {
                    sandGame = s;
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

        const controller = SandGameJS.init(sandGameRoot, config);

        Brushes = SandGameJS.Brushes;
        BrushDefs = SandGameJS.BrushDefs;

        evaluateCode();

    } else {
        sandGameRoot.innerHTML = '<p style="color: red; font-weight: bold;">Failed to load the game.</p>';
    }

});

function evaluateCode() {
    const code = document.getElementById('code-area').value;

    try {
        const result = eval(code);

        if (typeof result === "object") {
            sandGame.graphics().fill(result);
        }

        // Display the result
        document.getElementById('result').innerText = result;
    } catch (error) {
        // Display any errors that occurred during evaluation
        document.getElementById('result').innerText = "Error: " + error.message;
    }
}
