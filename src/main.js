/**
 *
 * @author Patrik Harag
 * @version 2023-08-20
 */

import { Analytics } from "./Analytics";
import { Controller } from "./gui/Controller";
import { MainComponent } from "./gui/MainComponent";
import { Brushes } from "./core/Brushes";
import $ from "jquery";

export const brushes = {};
for (let brush of Brushes.LIST) {
    brushes[brush.codeName] = brush.brush;
}

function determineSize(root) {
    let parentWidth;
    if (window.innerWidth <= 575) {
        parentWidth = window.innerWidth;  // no margins
    } else {
        parentWidth = root.width();
    }

    let width = Math.min(1400, parentWidth);
    let height = Math.min(800, Math.trunc(window.innerHeight * 0.70));
    if (width / height < 0.75) {
        height = Math.trunc(width / 0.75);
    }
    return {width, height};
}

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

export function initStandard(root) {
    root = $(root);

    const {width, height} = determineSize(root);
    const scale = determineOptimalScale(width, height, determineMaxNumberOfPoints());

    const init = {
        scale: scale,
        canvasWidthPx: width,
        canvasHeightPx: height,
        scene: (Math.random() > 0.1) ? 'landscape_1' : 'landscape_2'
    };

    const controller = new Controller(init);
    const mainComponent = new MainComponent(init);
    const node = mainComponent.createNode(controller);
    root.empty();
    root.append(node);

    controller.setup();
    controller.getIOManager().initFileDragAndDrop(node);
    controller.enableGlobalShortcuts();
    controller.start();

    Analytics.triggerFeatureUsed(Analytics.FEATURE_APP_INITIALIZED);

    return controller;
}

export function initTest(root) {
    root = $(root);

    const {width, height} = determineSize(root);
    const scale = determineOptimalScale(width, height, determineMaxNumberOfPoints());

    const init = {
        scale: scale,
        canvasWidthPx: width,
        canvasHeightPx: height,
        scene: 'landscape_1'
    };

    const controller = new Controller(init);
    const mainComponent = new MainComponent(init);
    mainComponent.enableTestTools();
    const node = mainComponent.createNode(controller);
    root.empty();
    root.append(node);

    controller.setup();
    controller.getIOManager().initFileDragAndDrop(node);
    controller.enableGlobalShortcuts();
    controller.start();

    Analytics.triggerFeatureUsed(Analytics.FEATURE_APP_INITIALIZED);

    return controller;
}