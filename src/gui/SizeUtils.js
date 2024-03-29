// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

/**
 *
 * @author Patrik Harag
 * @version 2024-03-24
 */
export default class SizeUtils {

    static #determineSize(root, maxWidthPx = 1400, maxHeightPx = 800) {
        let parentWidth;
        if (window.innerWidth <= 575) {
            parentWidth = window.innerWidth;  // no margins
        } else {
            parentWidth = root.clientWidth;  // including padding
        }

        let width = Math.min(maxWidthPx, parentWidth);
        let height = Math.min(maxHeightPx, Math.trunc(window.innerHeight * 0.70));
        if (width / height < 0.75) {
            height = Math.trunc(width / 0.75);
        }
        return {width, height};
    }

    static #determineMaxNumberOfPoints() {
        if (navigator.maxTouchPoints || 'ontouchstart' in document.documentElement) {
            // probably a smartphone
            return 75000;
        } else {
            // bigger screen => usually more powerful (or newer) computer
            if (window.screen.width >= 2560 && window.screen.height >= 1440) {
                return 200000;  // >= QHD
            } else if (window.screen.width >= 2048 && window.screen.height >= 1080) {
                return 175000;  // >= 2k
            } else if (window.screen.width >= 1920 && window.screen.height >= 1080) {
                return 150000;
            } else {
                return 125000;
            }
        }
    }

    static #determineOptimalScale(width, height, maxPoints) {
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

    static determineOptimalSizes(parentNode, canvasConfig = undefined) {
        const maxWidthPx = (canvasConfig !== undefined) ? canvasConfig.maxWidthPx : undefined;
        const maxHeightPx = (canvasConfig !== undefined) ? canvasConfig.maxHeightPx : undefined;

        const {width, height} = SizeUtils.#determineSize(parentNode, maxWidthPx, maxHeightPx);

        const scaleOverride = (canvasConfig !== undefined) ? canvasConfig.scale : undefined;
        const scale = (scaleOverride === undefined)
            ? SizeUtils.#determineOptimalScale(width, height, SizeUtils.#determineMaxNumberOfPoints())
            : scaleOverride;
        return { width, height, scale };
    }
}
