import {DeterministicRandom} from "../DeterministicRandom";
import {InsertSceneTool} from "./InsertSceneTool";
import {Tool} from "../Tool";

/**
 *
 * @author Patrik Harag
 * @version 2023-12-25
 */
export class InsertRandomSceneTool extends Tool {

    /** @type Scene[] */
    #scenes;

    #currentTool;

    /** @type function */
    #onInsertHandler;

    constructor(info, scenes, onInsertHandler) {
        super(info);
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
        this.#currentTool = new InsertSceneTool(this.getInfo(), scene, this.#onInsertHandler);
    }

    applyPoint(x, y, graphics, aldModifier) {
        this.#currentTool.applyPoint(x, y, graphics, aldModifier);
        this.#initRandomTool();
    }

    createCursor() {
        return this.#currentTool.createCursor();
    }
}