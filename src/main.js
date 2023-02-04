
import { SandGameComponent } from "./SandGameComponent.js";

export function initStandard(root, assetsContextPath) {
    let width = Math.min(1400, root.width());
    let height = Math.min(800, Math.trunc(window.innerHeight * 0.70));
    if (width / height < 0.5) {
        height = Math.trunc(width / 0.5);
    }

    let scale = 0.25;
    if (width * height < 300000) {
        scale = 0.5;
    }
    if (width * height < 50000) {
        scale = 1;
    }

    let init = {
        scale: scale,
        canvasWidthPx: width,
        canvasHeightPx: height,
        brushSize: 5,
        scene: 'landscape',
        assetsContextPath: assetsContextPath
    };
    let sandGameComponent = new SandGameComponent(root, init);
    sandGameComponent.enableBrushes();
    sandGameComponent.enableOptions();
    sandGameComponent.enableSizeOptions();
    sandGameComponent.enableScenes();
    sandGameComponent.start();
}

export function initMinimalistic(root, assetsContextPath) {
    let width = Math.min(1400, root.width());
    let height = 200;

    let scale = 0.25;
    if (width * height < 250000) {
        scale = 0.5;
    }

    let init = {
        scale: scale,
        canvasWidthPx: width,
        canvasHeightPx: height,
        brushSize: 5,
        scene: 'landscape'
    };

    let sandGameComponent = new SandGameComponent(root, init);
    sandGameComponent.enableBrushes();
    sandGameComponent.start();
}

export function initTest(root, assetsContextPath) {
    let width = Math.min(1400, root.width());
    let height = Math.min(800, Math.trunc(window.innerHeight * 0.70));
    if (width / height < 0.5) {
        height = Math.trunc(width / 0.5);
    }

    let scale = 0.25;
    if (width * height < 300000) {
        scale = 0.5;
    }
    if (width * height < 50000) {
        scale = 1;
    }

    let init = {
        scale: scale,
        canvasWidthPx: width,
        canvasHeightPx: height,
        brushSize: 5,
        scene: 'landscape',
        assetsContextPath: assetsContextPath
    };
    let sandGameComponent = new SandGameComponent(root, init);
    sandGameComponent.enableBrushes();
    sandGameComponent.enableOptions();
    sandGameComponent.enableSizeOptions();
    sandGameComponent.enableScenes();
    sandGameComponent.enableTestTools();
    sandGameComponent.enableTemplateEditor();
    sandGameComponent.start();
}
