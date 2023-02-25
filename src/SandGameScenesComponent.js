import {DomBuilder} from "./DomBuilder.js";
import {Scenes} from "./core/Scenes.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-02-24
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

    #initialScene;

    #selected = null;

    constructor(selectFunction, initialScene) {
        this.#selectFunction = selectFunction;
        this.#initialScene = initialScene;
    }

    createNode() {
        let content = DomBuilder.div({class: 'scenes'}, []);
        for (let id of SandGameScenesComponent.SCENES) {
            let scene = Scenes.SCENES[id];
            let node = this.#createSceneCard(scene);

            if (id === this.#initialScene) {
                this.#selected = node;
                node.addClass(SandGameScenesComponent.CLASS_SELECTED);
            }

            node.on('click', e => {
                if (this.#selected) {
                    this.#selected.removeClass(SandGameScenesComponent.CLASS_SELECTED);
                }
                node.addClass(SandGameScenesComponent.CLASS_SELECTED);
                this.#selected = node;
                this.#selectFunction(scene);
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

    unselect() {
        if (this.#selected) {
            this.#selected.removeClass(SandGameScenesComponent.CLASS_SELECTED);
        }
        this.#selected = null;
    }
}

