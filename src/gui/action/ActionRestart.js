// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import Action from "./Action";
import DomBuilder from "../DomBuilder";
import Analytics from "../../Analytics";

/**
 *
 * @author Patrik Harag
 * @version 2024-01-17
 */
export default class ActionRestart extends Action {

    performAction(controller) {
        let dialog = DomBuilder.bootstrapDialogBuilder();
        dialog.setHeaderContent('Restart');
        dialog.setBodyContent([
            DomBuilder.par(null, "Are you sure?")
        ]);
        dialog.addSubmitButton('Restart', () => {
            const scene = controller.getInitialScene();
            controller.openScene(scene);
            Analytics.triggerFeatureUsed(Analytics.FEATURE_RESTART_SCENE);
        });
        dialog.addCloseButton('Close');
        dialog.show(controller.getDialogAnchor());
    }
}
