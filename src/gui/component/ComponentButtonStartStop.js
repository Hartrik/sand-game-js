import { Action } from "../action/Action";
import { ComponentButton } from "./ComponentButton";
import { Analytics } from "../../Analytics";
import { DomBuilder } from "../DomBuilder";

import _ASSET_SVG_PAUSE from "./assets/icon-pause.svg";
import _ASSET_SVG_PLAY from "./assets/icon-play.svg";

/**
 *
 * @author Patrik Harag
 * @version 2023-12-22
 */
export class ComponentButtonStartStop extends ComponentButton {

    constructor(cssClass) {
        super('', cssClass, Action.create(controller => {
            controller.switchStartStop();
            Analytics.triggerFeatureUsed(Analytics.FEATURE_PAUSE);
        }));
    }

    createNode(controller) {
        const btn = super.createNode(controller);

        controller.addOnStarted(() => {
            DomBuilder.setContent(btn, [DomBuilder.create(_ASSET_SVG_PAUSE), 'Pause']);
        });
        controller.addOnStopped(() => {
            DomBuilder.setContent(btn, [DomBuilder.create(_ASSET_SVG_PLAY), 'Start']);
        });

        return btn;
    }
}
