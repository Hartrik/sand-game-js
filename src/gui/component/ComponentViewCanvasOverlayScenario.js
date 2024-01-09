import {Component} from "./Component";
import {DomBuilder} from "../DomBuilder";

/**
 *
 * @author Patrik Harag
 * @version 2024-01-09
 */
export class ComponentViewCanvasOverlayScenario extends Component {

    /** @type Controller */
    #controller;

    #nodeOverlay;

    #w;
    #h;
    #scale;

    constructor(w, h, scale, controller) {
        super();
        this.#w = w;
        this.#h = h;
        this.#scale = scale;
        const wPx = w / scale;
        const hPx = h / scale;
        this.#nodeOverlay = DomBuilder.div({
            style: {
                display: 'none',  // hidden by default
                position: 'absolute',
                left: '0',
                top: '0',
                width: `${wPx}px`,
                height: `${hPx}px`,
                pointerEvents: 'none'
            },
            class: 'sand-game-canvas-overlay',
            width: w + 'px',
            height: h + 'px',
        });
        this.#controller = controller;
    }

    /**
     *
     * @param overlay {SandGameScenario}
     */
    register(overlay) {

        // handles splashes
        const splashes = overlay.getSplashes();
        if (splashes.length > 0) {
            for (const splash of splashes) {
                this.#nodeOverlay.append(this.#createSplashNode(splash));
            }
            this.#nodeOverlay.style.display = 'initial';
        }

        // future splashes
        overlay.addOnSplashAdded((splash) => {
            this.#nodeOverlay.append(this.#createSplashNode(splash));
            this.#nodeOverlay.style.display = 'initial';
        });
    }

    /**
     *
     * @param splash {Splash}
     * @returns {HTMLElement}
     */
    #createSplashNode(splash) {
        let config = splash.getConfig();

        let splashAttributes = {
            class: 'sand-game-splash',
            style: {
                display: splash.isVisible() ? null : 'none',
                pointerEvents: 'initial'
            }
        };
        Object.assign(splashAttributes.style, config.style);

        let contentAttributes = {
            class: 'sand-game-splash-content'
        };

        let footerAttributes = {
            class: 'sand-game-splash-footer'
        };

        let splashNode = DomBuilder.div(splashAttributes, [
            DomBuilder.div(contentAttributes, config.content),
            DomBuilder.div(footerAttributes, config.buttons.map(button => {
                let buttonNode = DomBuilder.button(button.title, {
                    class: button.class,
                }, () => button.action(splash));
                if (button.focus) {
                    setTimeout(() => {
                        buttonNode.focus({
                            preventScroll: true
                        });
                    }, 0);
                }
                return buttonNode;
            }))
        ]);

        splash.addOnVisibleChanged((visible) => {
             splashNode.style.display = visible ? 'initial' : 'none';
        });

        return splashNode;
    }

    createNode(controller) {
        return this.#nodeOverlay;
    }
}