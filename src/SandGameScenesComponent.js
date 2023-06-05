import {DomBuilder} from "./DomBuilder.js";
import {Scenes} from "./Scenes.js";
import {Analytics} from "./Analytics.js";
import {SceneImplSnapshot} from "./core/SceneImplSnapshot.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-06-05
 */
export class SandGameScenesComponent {

    static CLASS_SELECTED = 'selected-scene';
    static CLASS_VISITED = 'visited-scene';

    static SCENES = [
        'empty',
        'landscape_1',
        'landscape_2',
        'fallthrough',
        'platform'
    ];


    /** @type SandGameControls */
    #controls;

    #ignoreOnBeforeNewSceneLoaded = false;

    #initialScene;

    #selected = null;
    #selectedSceneId = null;

    #closedScenes = new Map();

    /**
     * @param sandGameControls {SandGameControls}
     * @param initialScene
     */
    constructor(sandGameControls, initialScene) {
        this.#controls = sandGameControls;
        this.#initialScene = initialScene;

        this.#controls.addOnBeforeNewSceneLoaded(() => {
            if (!this.#ignoreOnBeforeNewSceneLoaded) {
                this.#store();
                this.#unselect();
            }
        });
    }

    createNode() {
        let content = DomBuilder.div({ class: 'scenes' }, []);
        for (let id of SandGameScenesComponent.SCENES) {
            let scene = Scenes.SCENES[id];

            let label = DomBuilder.element('span', { class: 'scene-title' }, scene.name);
            // scene.description ? scene.description : '\u00A0'
            let node = DomBuilder.button(label, { class: 'btn btn-outline-secondary scene' }, () => {
                this.#onSelect(id, node, scene);
            });

            // mark initial scene
            if (id === this.#initialScene) {
                this.#selected = node;
                this.#selectedSceneId = id;
                node.addClass(SandGameScenesComponent.CLASS_SELECTED);
                node.addClass(SandGameScenesComponent.CLASS_VISITED);
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
        let dialog = new DomBuilder.BootstrapDialog();
        dialog.setHeaderContent('Restart scene');
        dialog.setBodyContent([
            DomBuilder.par(null, "Do you want to restart the scene?")
        ]);
        dialog.addSubmitButton('Confirm', onConfirm);
        dialog.addCloseButton('Close');
        dialog.show(this.#controls.getDialogAnchor());
    }

    #select(node, id, scene) {
        this.#unselect();

        this.#selected = node;
        this.#selectedSceneId = id;
        node.addClass(SandGameScenesComponent.CLASS_SELECTED);
        node.addClass(SandGameScenesComponent.CLASS_VISITED);

        // restore or build scene
        let snapshot = this.#closedScenes.get(id);
        if (snapshot) {
            this.#closedScenes.delete(id);

            this.#ignoreOnBeforeNewSceneLoaded = true;
            this.#controls.openScene(new SceneImplSnapshot(snapshot));
            this.#ignoreOnBeforeNewSceneLoaded = false;
        } else {
            this.#ignoreOnBeforeNewSceneLoaded = true;
            this.#controls.openScene(scene);
            this.#ignoreOnBeforeNewSceneLoaded = false;
        }
    }

    #unselect() {
        if (this.#selected) {
            this.#selected.removeClass(SandGameScenesComponent.CLASS_SELECTED);
        }
        this.#selected = null;
        this.#selectedSceneId = null;
    }

    #store() {
        if (this.#selected) {
            this.#closedScenes.set(this.#selectedSceneId, this.#controls.createSnapshot());
        }
    }
}
