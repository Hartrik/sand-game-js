import {DomBuilder} from "./DomBuilder.js";
import {Scenes} from "./core/Scenes.js";
import {Analytics} from "./Analytics.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-04-11
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

    /** @type function(Scene) */
    #selectFunction;

    /** @type function():Snapshot */
    #snapshotFunction;

    /** @type function(Snapshot) */
    #reopenFunction;

    #initialScene;

    #selected = null;
    #selectedSceneId = null;

    #closedScenes = new Map();

    /**
     * @param sandGameControls {SandGameControls}
     * @param selectFunction
     * @param snapshotFunction
     * @param reopenFunction
     * @param initialScene
     */
    constructor(sandGameControls, selectFunction, snapshotFunction, reopenFunction, initialScene) {
        this.#controls = sandGameControls;
        this.#selectFunction = selectFunction;
        this.#snapshotFunction = snapshotFunction;
        this.#reopenFunction = reopenFunction;
        this.#initialScene = initialScene;
    }

    createNode() {
        let content = DomBuilder.div({class: 'scenes'}, []);
        for (let id of SandGameScenesComponent.SCENES) {
            let scene = Scenes.SCENES[id];
            let node = this.#createSceneCard(scene);

            // mark initial scene
            if (id === this.#initialScene) {
                this.#selected = node;
                this.#selectedSceneId = id;
                node.addClass(SandGameScenesComponent.CLASS_SELECTED);
                node.addClass(SandGameScenesComponent.CLASS_VISITED);
            }

            node.on('click', e => {
                this.#onSelect(id, node, scene);
            })
            content.append(node);
        }

        return content;
    }

    /**
     *
     * @param scene {Scene}
     */
    #createSceneCard(scene) {
        let bodyContent = [
            DomBuilder.element('span', {class: 'card-title'}, scene.name)
        ];
        bodyContent.push(DomBuilder.par({class: 'card-text'}, scene.description ? scene.description : '\u00A0'));
        return DomBuilder.Bootstrap.card(null, bodyContent);
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
            this.#reopenFunction(snapshot);
        } else {
            this.#selectFunction(scene);
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
            this.#closedScenes.set(this.#selectedSceneId, this.#snapshotFunction());
        }
    }

    onBeforeOtherSceneLoad() {
        this.#store();
        this.#unselect();
    }
}

