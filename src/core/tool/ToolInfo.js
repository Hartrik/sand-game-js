
/**
 *
 * @author Patrik Harag
 * @version 2024-02-06
 */
export class ToolInfo {

    #info

    /**
     *
     * @param info {{
     *     codeName: string|undefined,
     *     displayName: string|undefined,
     *     category: string|undefined,
     *     badgeStyle: CSSStyleDeclaration|undefined,
     * }}
     */
    constructor(info = undefined) {
        this.#info = info;
    }

    derive(info) {
        const derivedInfo = {};
        Object.assign(derivedInfo, this.#info);
        Object.assign(derivedInfo, info);
        return new ToolInfo(derivedInfo);
    }

    /**
     *
     * @return {string|undefined}
     */
    getCategory() {
        return this.#info.category;
    }

    /**
     *
     * @return {string|undefined}
     */
    getDisplayName() {
        return this.#info.displayName;
    }

    /**
     *
     * @return {string|undefined}
     */
    getCodeName() {
        return this.#info.codeName;
    }

    /**
     *
     * @return {CSSStyleDeclaration|undefined}
     */
    getBadgeStyle() {
        return this.#info.badgeStyle;
    }
}
