// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import DomBuilder from "../DomBuilder";
import Component from "./Component";
import Analytics from "../../Analytics";
import SceneImplSnapshot from "../../core/scene/SceneImplSnapshot";

// TODO: support external restart

/**
 *
 * @author Patrik Harag
 * @version 2024-01-04
 */
export default class ComponentViewSceneSelection extends Component {

    static CLASS_SELECTED = 'selected-scene';
    static CLASS_VISITED = 'visited-scene';


    /** @type Controller */
    #controller;

    #ignoreOnBeforeNewSceneLoaded = false;

    #scenes;
    #initialSceneId;

    #selected = null;
    #selectedSceneId = null;

    #closedScenes = new Map();

    /**
     * @param controller {Controller}
     * @param scenes
     * @param initialSceneId
     */
    constructor(controller, scenes, initialSceneId) {
        super();
        this.#controller = controller;
        this.#scenes = scenes;
        this.#initialSceneId = initialSceneId;

        this.#controller.addOnBeforeNewSceneLoaded(() => {
            if (!this.#ignoreOnBeforeNewSceneLoaded) {
                this.#store();
                this.#unselect();
            }
        });
    }

    createNode(controller) {
        let content = DomBuilder.div({ class: 'scenes' }, []);

        for (const [id, scene] of Object.entries(this.#scenes)) {
            let label = DomBuilder.element('span', { class: 'scene-title' }, scene.name);
            let node = DomBuilder.button(label, { class: 'btn btn-outline-secondary scene' }, () => {
                this.#onSelect(id, node, scene);
            });

            // mark initial scene
            if (id === this.#initialSceneId) {
                this.#selected = node;
                this.#selectedSceneId = id;
                node.classList.add(ComponentViewSceneSelection.CLASS_SELECTED);
                node.classList.add(ComponentViewSceneSelection.CLASS_VISITED);
            }

            content.append(node);
        }

        return content;
    }

    #onSelect(id, node, scene) {
        if (this.#selected) {
            if (this.#selectedSceneId === id) {
                // already opened - rebuild scene
                this.#rebuildConfirm(() => {
                    this.#select(node, id, scene);
                    Analytics.triggerFeatureUsed(Analytics.FEATURE_RESTART_SCENE);
                });
            } else {
                // store snapshot of the old scene and open...
                this.#store();
                this.#select(node, id, scene);
                Analytics.triggerFeatureUsed(Analytics.FEATURE_SWITCH_SCENE);
            }
        } else {
            // open
            this.#select(node, id, scene);
            Analytics.triggerFeatureUsed(Analytics.FEATURE_SWITCH_SCENE);
        }
    }

    #rebuildConfirm(onConfirm) {
        let dialog = DomBuilder.bootstrapDialogBuilder();
        dialog.setHeaderContent('Restart scene');
        dialog.setBodyContent([
            DomBuilder.par(null, "Do you want to restart the scene?")
        ]);
        dialog.addSubmitButton('Confirm', onConfirm);
        dialog.addCloseButton('Close');
        dialog.show(this.#controller.getDialogAnchor());
    }

    #select(node, id, scene) {
        this.#unselect();

        this.#selected = node;
        this.#selectedSceneId = id;
        node.classList.add(ComponentViewSceneSelection.CLASS_SELECTED);
        node.classList.add(ComponentViewSceneSelection.CLASS_VISITED);

        // restore or build scene
        let snapshot = this.#closedScenes.get(id);
        if (snapshot) {
            this.#closedScenes.delete(id);

            this.#ignoreOnBeforeNewSceneLoaded = true;
            this.#controller.openScene(new SceneImplSnapshot(snapshot));
            this.#ignoreOnBeforeNewSceneLoaded = false;
        } else {
            this.#ignoreOnBeforeNewSceneLoaded = true;
            this.#controller.openScene(scene);
            this.#ignoreOnBeforeNewSceneLoaded = false;
        }
    }

    #unselect() {
        if (this.#selected) {
            this.#selected.classList.remove(ComponentViewSceneSelection.CLASS_SELECTED);
        }
        this.#selected = null;
        this.#selectedSceneId = null;
    }

    #store() {
        if (this.#selected) {
            this.#closedScenes.set(this.#selectedSceneId, this.#controller.createSnapshot());
        }
    }
}
