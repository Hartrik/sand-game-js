
/**
 * @typedef {Object} BrushDeclaration
 * @property {string} name
 * @property {string} cssName
 * @property {string} code
 * @property {Brush} brush
 */

/**
 * @interface
 *
 * @author Patrik Harag
 * @version 2023-02-26
 */
export class SandGameControls {

    /**
     *
     * @returns {SandGame|null}
     */
    getSandGame() {
        throw 'Not implemented';
    }

    // simulation state

    /**
     *
     * @param handler {function}
     * @returns void
     */
    addOnInitialized(handler) {
        throw 'Not implemented';
    }

    /**
     *
     * @param handler {function}
     * @returns void
     */
    addOnStopped(handler) {
        throw 'Not implemented';
    }

    /**
     *
     * @param handler {function}
     * @returns void
     */
    addOnStarted(handler) {
        throw 'Not implemented';
    }

    start() {
        throw 'Not implemented';
    }

    switchStartStop() {
        throw 'Not implemented';
    }

    // canvas size

    /**
     *
     * @returns {number}
     */
    getCurrentWidthPoints() {
        throw 'Not implemented';
    }

    /**
     *
     * @returns {number}
     */
    getCurrentHeightPoints() {
        throw 'Not implemented';
    }

    /**
     *
     * @returns {number}
     */
    getCurrentScale() {
        throw 'Not implemented';
    }

    /**
     *
     * @param width
     * @param height
     * @param scale
     * @returns void
     */
    changeCanvasSize(width, height, scale) {
        throw 'Not implemented';
    }

    // options

    /**
     * @returns {boolean}
     */
    isShowActiveChunks() {
        throw 'Not implemented';
    }

    /**
     *
     * @param show {boolean}
     * @returns void
     */
    setShowActiveChunks(show) {
        throw 'Not implemented';
    }

    /**
     * @returns {boolean}
     */
    isShowHeatmap() {
        throw 'Not implemented';
    }

    /**
     *
     * @param show {boolean}
     * @returns void
     */
    setShowHeatmap(show) {
        throw 'Not implemented';
    }

    /**
     *
     * @param style {string}
     * @returns void
     */
    setCanvasImageRenderingStyle(style) {
        throw 'Not implemented';
    }

    /**
     *
     * @returns {string}
     */
    getCanvasImageRenderingStyle() {
        throw 'Not implemented';
    }

    // performance

    /**
     *
     * @param handler {function(cps: number, fps: number)}
     * @returns void
     */
    addOnPerformanceUpdate(handler) {
        throw 'Not implemented';
    }

    // tools

    /**
     *
     * @param brush {Brush}
     * @returns void
     */
    setBrush(brush) {
        throw 'Not implemented';
    }

    /**
     * @returns {Brush}
     */
    getBrush() {
        throw 'Not implemented';
    }

    /**
     * @returns {number}
     */
    getBrushSize() {
        throw 'Not implemented';
    }

    // ui

    getDialogAnchor() {
        throw 'Not implemented';
    }
}
