// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import ComponentButton from "./ComponentButton";
import DomBuilder from "../DomBuilder";
import ActionRestart from "../action/ActionRestart";

import _ASSET_SVG_RESTART from "./assets/icon-reset.svg";

/**
 *
 * @author Patrik Harag
 * @version 2024-01-17
 */
export default class ComponentButtonRestart extends ComponentButton {

    constructor(cssClass) {
        super('', cssClass, new ActionRestart());
    }

    createNode(controller) {
        const btn = super.createNode(controller);
        DomBuilder.setContent(btn, [DomBuilder.create(_ASSET_SVG_RESTART), 'Restart']);
        return btn;
    }
}
