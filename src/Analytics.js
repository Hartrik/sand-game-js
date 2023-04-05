/**
 *
 * @version 2023-04-05
 * @author Patrik Harag
 */
export class Analytics {

    static EVENT_NAME = 'app_sand_game_js';
    static FEATURE_APP_INITIALIZED = 'initialized';

    // options bar
    static FEATURE_PAUSE = 'pause';
    static FEATURE_STATUS_DISPLAYED = 'status_displayed';
    static FEATURE_OPTIONS_DISPLAYED = 'options_displayed';
    static FEATURE_RENDERER_PIXELATED = 'renderer_pixelated';
    static FEATURE_RENDERER_SHOW_CHUNKS = 'renderer_show_chunks';
    static FEATURE_RENDERER_SHOW_HEATMAP = 'renderer_show_heatmap';
    static FEATURE_CANVAS_SIZE_CHANGE = 'canvas_size_change';

    static #USED_FEATURES = new Set();

    static triggerFeatureUsed(feature) {
        if (!Analytics.#USED_FEATURES.has(feature)) {
            // report only the first usage
            Analytics.#USED_FEATURES.add(feature);
            Analytics.#report({
                'app_sand_game_js_feature': feature
            });
        }
    }

    static #report(properties) {
        if (typeof gtag === 'function') {
            gtag('event', Analytics.EVENT_NAME, properties);
        }
        // console.log('event: ' + Analytics.EVENT_NAME + ' = ' + JSON.stringify(properties));
    }
}
