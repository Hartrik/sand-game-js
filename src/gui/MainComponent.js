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

    createNode(sandGameControls) {
        let componentNode = DomBuilder.div({ class: 'sand-game-component' });

        sandGameControls.registerDialogAnchor(componentNode);

        componentNode.append(new ComponentViewTools(Tools.DEFAULT_TOOLS, true).createNode(sandGameControls));
        componentNode.append(new ComponentViewCanvas().createNode(sandGameControls));
        componentNode.append(new ComponentViewOptions().createNode(sandGameControls));
        componentNode.append(DomBuilder.div({ class: 'sand-game-views' }, [
            DomBuilder.div(null, [
                new ComponentButtonAdjustScale().createNode(sandGameControls),
                DomBuilder.span('Scenes', { class: 'scenes-label' }),
                new ComponentViewSceneSelection(sandGameControls, this.#init.scene).createNode(sandGameControls),
            ]),
            new ComponentViewTestTools().createNode(sandGameControls)
        ]));

        return componentNode;
    }
}
