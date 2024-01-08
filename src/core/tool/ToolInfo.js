
/**
 *
 * @author Patrik Harag
 * @version 2023-12-25
 */
export class ToolInfo {

    /** @type string|null */
    #category;

    /** @type string|null */
    #codeName;

    /** @type string|null */
    #displayName;

    constructor(category = null, codeName = null, displayName = null) {
        this.#category = category;
        this.#codeName = codeName;
        this.#displayName = displayName;
    }

    /**
     *
     * @return {string}
     */
    getCategory() {
        return this.#category;
    }

    /**
     *
     * @return {string}
     */
    getDisplayName() {
        return this.#displayName;
    }

    /**
     *
     * @return {string}
     */
    getCodeName() {
        return this.#codeName;
    }
}
