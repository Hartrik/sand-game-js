
import { SandGameComponent } from "./SandGameComponent.js";
import { Analytics } from "./Analytics.js";

export { Brushes } from "./core/Brushes.js";


function determineMaxNumberOfPoints() {
    const touchDevice = (navigator.maxTouchPoints || 'ontouchstart' in document.documentElement);
    if (touchDevice) {
        // probably a smartphone
        return 75000;
    } else {
        return 125000;
    }
}

function determineOptimalScale(width, height, maxPoints) {
    function countPointsWithScale(scale) {
        return Math.trunc(width * scale) * Math.trunc(height * scale);
    }

    if (countPointsWithScale(0.750) < maxPoints) {
        return 0.750;
    } else if (countPointsWithScale(0.5) < maxPoints) {
        return 0.5;
    } else if (countPointsWithScale(0.375) < maxPoints) {
        return 0.375;
    } else {
        return 0.25;
    }
}

export function initStandard(root, assetsContextPath) {
    let width = Math.min(1400, root.width());
    let height = Math.min(800, Math.trunc(window.innerHeight * 0.70));
    if (width / height < 0.5) {
        height = Math.trunc(width / 0.5);
    }
    let scale = determineOptimalScale(width, height, determineMaxNumberOfPoints());

    let init = {
        scale: scale,
        canvasWidthPx: width,
        canvasHeightPx: height,
        brushSize: 5,
        scene: (Math.random() > 0.1) ? 'landscape_1' : 'landscape_2',
        assetsContextPath: assetsContextPath
    };
    let sandGameComponent = new SandGameComponent(root, init);
    sandGameComponent.enableGlobalShortcuts();
    sandGameComponent.enableBrushes();
    sandGameComponent.enableOptions();
    sandGameComponent.enableScenes();
    sandGameComponent.enableSizeOptions();
    sandGameComponent.enableSavingAndLoading();
    sandGameComponent.start();

    Analytics.triggerFeatureUsed(Analytics.FEATURE_APP_INITIALIZED);

    return sandGameComponent;
}

export function initMinimalistic(root, assetsContextPath) {
    let width = Math.min(1400, root.width());
    let height = 200;
    let scale = determineOptimalScale(width, height, 75000);

    let init = {
        scale: scale,
        canvasWidthPx: width,
        canvasHeightPx: height,
        brushSize: 5,
        scene: 'landscape_1'
    };

    let sandGameComponent = new SandGameComponent(root, init);
    sandGameComponent.enableBrushes();
    sandGameComponent.start();

    Analytics.triggerFeatureUsed(Analytics.FEATURE_APP_INITIALIZED);

    return sandGameComponent;
}

export function initTest(root, assetsContextPath) {
    let width = Math.min(1400, root.width());
    let height = Math.min(800, Math.trunc(window.innerHeight * 0.70));
    if (width / height < 0.5) {
        height = Math.trunc(width / 0.5);
    }
    let scale = determineOptimalScale(width, height, determineMaxNumberOfPoints());

    let init = {
        scale: scale,
        canvasWidthPx: width,
        canvasHeightPx: height,
        brushSize: 5,
        scene: 'landscape_1',
        assetsContextPath: assetsContextPath
    };
    let sandGameComponent = new SandGameComponent(root, init);
    sandGameComponent.enableGlobalShortcuts();
    sandGameComponent.enableBrushes();
    sandGameComponent.enableOptions();
    sandGameComponent.enableScenes();
    sandGameComponent.enableSizeOptions();
    sandGameComponent.enableSavingAndLoading();
    sandGameComponent.enableTestTools();
    sandGameComponent.start();

    Analytics.triggerFeatureUsed(Analytics.FEATURE_APP_INITIALIZED);

    return sandGameComponent;
}
