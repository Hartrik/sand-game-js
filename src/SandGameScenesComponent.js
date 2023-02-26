import {DomBuilder} from "./DomBuilder.js";
import {Scenes} from "./core/Scenes.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-02-26
 */
export class SandGameScenesComponent {

    static CLASS_SELECTED = 'selected-scene';

    static SCENES = [
        'empty',
        'landscape',
        'landscape_2',
        'fallthrough',
        'platform'
    ];


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

    constructor(selectFunction, snapshotFunction, reopenFunction, initialScene) {
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
            DomBuilder.element('h5', {class: 'card-title'}, scene.name)
        ];
        bodyContent.push(DomBuilder.par({class: 'card-text'}, scene.description ? scene.description : '\u00A0'));
        return DomBuilder.Bootstrap.card(null, bodyContent);
    }

    #onSelect(id, node, scene) {
        if (this.#selected) {
            // unselect
            this.#selected.removeClass(SandGameScenesComponent.CLASS_SELECTED);

            if (this.#selectedSceneId === id) {
                // already opened - rebuild scene
            } else {
                // store snapshot of the old scene
                this.#closedScenes.set(this.#selectedSceneId, this.#snapshotFunction());
            }
        }

        node.addClass(SandGameScenesComponent.CLASS_SELECTED);
        this.#selected = node;
        this.#selectedSceneId = id;

        // restore or build scene
        let snapshot = this.#closedScenes.get(id);
        if (snapshot) {
            this.#closedScenes.delete(id);
            this.#reopenFunction(snapshot);
        } else {
            this.#selectFunction(scene);
        }
    }

    unselect() {
        if (this.#selected) {
            this.#selected.removeClass(SandGameScenesComponent.CLASS_SELECTED);
        }
        this.#selected = null;
        this.#selectedSceneId = null;
    }
}

