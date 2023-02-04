import {DomBuilder} from "./DomBuilder";
import {SandGameScenes} from "./SandGameScenes";

/**
 *
 * @author Patrik Harag
 * @version 2022-10-02
 */
export class SandGameScenesComponent {

    /** @type function(SandGameScene) */
    #selectFunction;

    #initialScene;

    #selected = null;

    constructor(selectFunction, initialScene) {
        this.#selectFunction = selectFunction;
        this.#initialScene = initialScene;
    }

    createNode() {
        let content = DomBuilder.div({class: 'scenes'}, []);
        for (let id in SandGameScenes.SCENES) {
            let scene = SandGameScenes.SCENES[id];
            let node = this.#createSceneCard(scene);

            if (id === this.#initialScene) {
                this.#selected = node;
                node.addClass('selected-scene');
            }

            node.on('click', e => {
                if (this.#selected) {
                    this.#selected.removeClass('selected-scene');
                }
                node.addClass('selected-scene');
                this.#selected = node;
                this.#selectFunction(scene);
            })
            content.append(node);
        }

        return content;
    }

    /**
     *
     * @param scene {SandGameScene}
     */
    #createSceneCard(scene) {
        let bodyContent = [
            DomBuilder.element('h5', {class: 'card-title'}, scene.name)
        ];
        bodyContent.push(DomBuilder.par({class: 'card-text'}, scene.description ? scene.description : '\u00A0'));
        return DomBuilder.Bootstrap.card(null, bodyContent);
    }
}

