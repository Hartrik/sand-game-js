// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import Component from "./Component";
import DomBuilder from "../DomBuilder";
import ActionDialogChangeElementSize from "../action/ActionDialogChangeElementSize";

import _ASSET_SVG_ADJUST_SCALE from "./assets/icon-adjust-scale.svg";

/**
 *
 * @author Patrik Harag
 * @version 2023-08-19
 */
export default class ComponentButtonAdjustScale extends Component {

    createNode(controller) {
        return DomBuilder.button(DomBuilder.create(_ASSET_SVG_ADJUST_SCALE), {
            class: 'btn btn-outline-secondary adjust-scale',
            'aria-label': 'Adjust scale'
        }, () => {
            new ActionDialogChangeElementSize().performAction(controller);
        });
    }
}
