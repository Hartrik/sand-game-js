
const sandGameRoot = document.getElementById('sand-game-root');

var sandGame;
var Brushes;
var BrushDefs;

const initScript = `
let brush = Brushes.color(64, 64, 64, BrushDefs.WALL);
brush = Brushes.colorNoise({ seed: 0, factor: 160, threshold: 0.5, force: 0.1 }, brush);
brush = Brushes.colorNoise({ seed: 1, factor: 80, threshold: 0.5, force: 0.2 }, brush);
brush = Brushes.colorNoise({ seed: 2, factor: 40, threshold: 0.5, force: 0.2 }, brush);
brush = Brushes.colorNoise({ seed: 2, factor: 20, threshold: 0.5, force: 0.1 }, brush);
brush = Brushes.colorNoise({ seed: 4, factor: 2, threshold: 0.5, force: 0.1 }, brush);

sandGame.graphics().fill(brush);
`.trim();

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('code-area').value = initScript;

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
        // Display the result
        document.getElementById('result').innerText = result;
    } catch (error) {
        // Display any errors that occurred during evaluation
        document.getElementById('result').innerText = "Error: " + error.message;
    }
}
