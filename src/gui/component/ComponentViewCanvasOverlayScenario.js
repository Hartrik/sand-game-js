// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import Component from "./Component";
import DomBuilder from "../DomBuilder";

import _ASSET_ICON_SQUARE from './assets/icon-square.svg'
import _ASSET_ICON_SQUARE_CHECK from './assets/icon-square-check.svg'
import _ASSET_ICON_SQUARE_DOTTED from './assets/icon-square-dotted.svg'

/**
 *
 * @author Patrik Harag
 * @version 2024-01-19
 */
export default class ComponentViewCanvasOverlayScenario extends Component {

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
        let visible = false;
        const addNode = (node) => {
            this.#nodeOverlay.append(node);
            if (!visible) {
                visible = true;
                this.#nodeOverlay.style.display = null;
            }
        };

        // handles splashes
        for (const splash of overlay.getSplashes()) {
            addNode(this.#createSplashNode(splash));
        }
        overlay.addOnSplashAdded((splash) => {
            addNode(this.#createSplashNode(splash));
        });

        // handle objectives
        let objectiveParent = null;
        let visibleNodes = 0;
        const addObjective = (objective) => {
            const node = this.#createObjectiveNode(objective);
            if (objectiveParent === null) {
                if (objective.isVisible()) {
                    visibleNodes++;
                }
                objectiveParent = this.#createObjectivesListNode();
                objectiveParent.style.display = (visibleNodes > 0) ? null : 'none';
                addNode(objectiveParent);
            }
            objectiveParent.append(node);
            objective.addOnVisibleChanged(visible => {
                visibleNodes += (visible) ? 1 : -1;
                objectiveParent.style.display = (visibleNodes > 0) ? null : 'none';
            });
        };
        for (const objective of overlay.getObjectives()) {
            addObjective(objective);
        }
        overlay.addOnObjectiveAdded((objective) => {
            addObjective(objective);
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
                display: splash.isVisible() ? null : 'none'
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
            DomBuilder.div(footerAttributes, config.buttons.filter(button => button !== null).map(button => {
                let buttonNode;
                if (typeof button.action === 'string') {
                    buttonNode = DomBuilder.element('a', {
                        href: button.action,
                        class: button.class
                    }, button.title);
                } else if (typeof button.action === 'function') {
                    buttonNode = DomBuilder.button(button.title, {
                        class: button.class,
                    }, () => button.action(splash));
                } else {
                    throw 'Button action type not supported: ' + (typeof button.action);
                }

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
             splashNode.style.display = visible ? null : 'none';
        });

        return splashNode;
    }

    #createObjectivesListNode() {
        return DomBuilder.div({ class: 'sand-game-objectives-list' }, null);
    }

    /**
     *
     * @param objective {Objective}
     * @returns {HTMLElement}
     */
    #createObjectiveNode(objective) {
        const iconNode = DomBuilder.span(null, { class: 'sand-game-objective-icon' });
        if (objective.isVisible()) {
            DomBuilder.setContent(iconNode, this.#createObjectiveIcon(objective));
        }

        const attributes = {
            style: {
                display: objective.isVisible() ? null : 'none'
            }
        }
        const objectiveNode = DomBuilder.div(attributes, [
            iconNode,
            objective.getConfig().name
        ]);

        objective.addOnVisibleChanged((visible) => {
            objectiveNode.style.display = visible ? null : 'none';
            if (visible) {
                DomBuilder.setContent(iconNode, this.#createObjectiveIcon(objective));
            }
        });

        objective.addOnActiveChanged((active) => {
            if (objective.isVisible()) {
                DomBuilder.setContent(iconNode, this.#createObjectiveIcon(objective));
            }
        });

        objective.addOnCompleted(() => {
            if (objective.isVisible()) {
                DomBuilder.setContent(iconNode, this.#createObjectiveIcon(objective));
            }
        });

        return objectiveNode;
    }

    #createObjectiveIcon(objective) {
        if (objective.isCompleted()) {
            return DomBuilder.create(_ASSET_ICON_SQUARE_CHECK);
        }
        if (objective.isActive()) {
            return DomBuilder.create(_ASSET_ICON_SQUARE);
        }
        return DomBuilder.create(_ASSET_ICON_SQUARE_DOTTED);
    }

    createNode(controller) {
        return this.#nodeOverlay;
    }
}