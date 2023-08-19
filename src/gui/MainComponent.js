import { DomBuilder } from "./DomBuilder";
import { Tools } from "../def/Tools";
import { Component } from "./Component";
import { ComponentViewTools } from "./ComponentViewTools";
import { ComponentViewOptions } from "./ComponentViewOptions";
import { ComponentViewTestTools } from "./ComponentViewTestTools";
import { ComponentViewCanvas } from "./ComponentViewCanvas";
import { ComponentViewSceneSelection } from "./ComponentViewSceneSelection";
import { ComponentButtonAdjustScale } from "./ComponentButtonAdjustScale";

/**
 *
 * @author Patrik Harag
 * @version 2023-08-19
 */
export class MainComponent extends Component {

    #init;
    #enableTestTools = false;

    constructor(init) {
        super();
        this.#init = init;
    }

    enableTestTools() {
        this.#enableTestTools = true;
    }

    createNode(controller) {
        let componentNode = DomBuilder.div({ class: 'sand-game-component' });

        controller.registerDialogAnchor(componentNode);

        componentNode.append(new ComponentViewTools(Tools.DEFAULT_TOOLS, true).createNode(controller));
        componentNode.append(new ComponentViewCanvas().createNode(controller));
        componentNode.append(new ComponentViewOptions().createNode(controller));
        componentNode.append(DomBuilder.div({ class: 'sand-game-views' }, [
            DomBuilder.div(null, [
                new ComponentButtonAdjustScale().createNode(controller),
                DomBuilder.span('Scenes', { class: 'scenes-label' }),
                new ComponentViewSceneSelection(controller, this.#init.scene).createNode(controller),
            ]),
            this.#enableTestTools ? new ComponentViewTestTools().createNode(controller) : null,
        ]));

        return componentNode;
    }
}
