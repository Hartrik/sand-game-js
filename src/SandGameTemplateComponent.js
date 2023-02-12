import {DomBuilder} from "./DomBuilder.js";
import {SandGameControls} from "./SandGameControls.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-02-12
 */
export class SandGameTemplateComponent {

    /** @type SandGameControls */
    #controls;

    /** @type BrushDeclaration[] */
    #brushDeclarations;


    /**
     * @param sandGameControls {SandGameControls}
     * @param brushDeclarations {BrushDeclaration[]}
     */
    constructor(sandGameControls, brushDeclarations) {
        this.#controls = sandGameControls;
        this.#brushDeclarations = brushDeclarations;
    }

    createNode() {
        let defaultBlueprint = '111\n...\n...\n...';

        let brushes = {};
        for (let d of this.#brushDeclarations) {
            brushes[d.code] = d.brush;
        }

        let formBuilder = new DomBuilder.BootstrapSimpleForm();

        // add editor
        let textArea = formBuilder.addTextArea('Template', 'blueprint', defaultBlueprint, 8);

        // build tooltip
        let info = DomBuilder.element('ul');
        for (let d of this.#brushDeclarations) {
            info.append(DomBuilder.element('li', null, d.name + ' = ' + d.code))
        }
        DomBuilder.Bootstrap.initTooltip(info, textArea);

        // add submit button
        formBuilder.addSubmitButton('Submit', data => {
            let sandGame = this.#controls.getSandGame();
            if (sandGame !== null) {
                this.#applyTemplate(sandGame, brushes, data['blueprint']);
            }
        })

        return DomBuilder.Bootstrap.cardCollapsable('Template editor', true, formBuilder.createNode());
    }

    #applyTemplate(sandGame, brushes, blueprint) {
        try {
            sandGame.template().withBrushes(brushes).withBlueprint(blueprint).paint();
        } catch (e) {
            console.log(e);

            let dialog = new DomBuilder.BootstrapDialog();
            dialog.setHeaderContent('Error');
            dialog.setBodyContent(DomBuilder.element('code', null, e));
            dialog.addCloseButton('Close');
            dialog.show(document.body);
        }
    }
}
