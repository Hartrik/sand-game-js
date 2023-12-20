import {DeterministicRandom} from "../DeterministicRandom";
import {InsertSceneTool} from "./InsertSceneTool";
import {Tool} from "../Tool";

/**
 *
 * @author Patrik Harag
 * @version 2023-11-20
 */
export class InsertRandomSceneTool extends Tool {

    /** @type Scene[] */
    #scenes;

    #currentTool;

    /** @type function */
    #onInsertHandler;

    constructor(category, codeName, displayName, scenes, onInsertHandler) {
        super(category, codeName, displayName);
        this.#scenes = scenes;
        this.#onInsertHandler = onInsertHandler;
        this.#initRandomTool();
    }

    #initRandomTool() {
        if (this.#scenes.length === undefined || this.#scenes.length === 0) {
            throw 'Scenes not set';
        }

        const i = DeterministicRandom.DEFAULT.nextInt(this.#scenes.length);
        const scene = this.#scenes[i];
        this.#currentTool = new InsertSceneTool(this.getCategory(), this.getCodeName(), this.getDisplayName(),
            scene, this.#onInsertHandler);
    }

    applyPoint(x, y, graphics, aldModifier) {
        this.#currentTool.applyPoint(x, y, graphics, aldModifier);
        this.#initRandomTool();
    }

    createCursor() {
        return this.#currentTool.createCursor();
    }
}