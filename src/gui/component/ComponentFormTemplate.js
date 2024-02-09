import {BrushDefs} from "../../def/BrushDefs";
import {DomBuilder} from "../DomBuilder";
import {ToolDefs} from "../../def/ToolDefs";
import {Component} from "./Component";

/**
 * Creates template form and remembers last values.
 *
 * @author Patrik Harag
 * @version 2024-02-09
 */
export class ComponentFormTemplate extends Component {

    #thresholdValue = 50;
    #maxWidth = 300;
    #maxHeight = 200;
    #materialValue = 'sand';
    #materialBrush = BrushDefs.SAND;

    createNode() {
        return DomBuilder.element('form', null, [
            DomBuilder.element('fieldset', {class: 'mb-3 row'}, [
                DomBuilder.element('legend', {class: 'col-form-label col-sm-3 float-sm-left pt-0'}, 'Material'),
                DomBuilder.div({class: 'col-sm-9', style: 'column-count: 2;'}, [
                    this.#creatMaterialFormGroup(BrushDefs.SAND, ToolDefs.SAND.getInfo()),
                    this.#creatMaterialFormGroup(BrushDefs.SOIL, ToolDefs.SOIL.getInfo()),
                    this.#creatMaterialFormGroup(BrushDefs.THERMITE, ToolDefs.THERMITE.getInfo()),
                    this.#creatMaterialFormGroup(BrushDefs.WALL, ToolDefs.WALL.getInfo()),
                    this.#creatMaterialFormGroup(BrushDefs.METAL, ToolDefs.METAL.getInfo()),
                    this.#creatMaterialFormGroup(BrushDefs.TREE_WOOD, ToolDefs.WOOD.getInfo()),
                ])
            ]),
            DomBuilder.element('fieldset', {class: 'mb-3 row'}, [
                DomBuilder.element('legend', {class: 'col-form-label col-sm-3 float-sm-left pt-0'}, 'Background threshold'),
                DomBuilder.div({class: 'col-sm-9'}, [
                    this.#createThresholdSliderFormGroup(),
                ])
            ]),
            DomBuilder.element('fieldset', {class: 'mb-3 row'}, [
                DomBuilder.element('legend', {class: 'col-form-label col-sm-3 float-sm-left pt-0'}, 'Max size'),
                DomBuilder.div({class: 'col-sm-9'}, [
                    this.#createMaxWidthFormGroup(),
                    this.#createMaxHeightFormGroup(),
                ])
            ])
        ]);
    }

    #createThresholdSliderFormGroup() {
        const id = 'image-template_threshold-slider';

        const label = DomBuilder.element('label', {'for': id}, 'Value: ' + this.#thresholdValue);

        const slider = DomBuilder.element('input', {
            id: id,
            class: 'form-range',
            type: 'range',
            min: 0, max: 255, value: this.#thresholdValue
        });
        slider.addEventListener('input', (e) => {
            this.#thresholdValue = e.target.value;
            label.textContent = 'Value: ' + this.#thresholdValue;
        });

        return DomBuilder.div({class: 'mb-3'}, [
            slider,
            DomBuilder.element('small', null, label)
        ]);
    }

    #createMaxWidthFormGroup() {
        const id = 'image-template_max-width';

        const label = DomBuilder.element('label', {'for': id}, 'Width: ' + this.#maxWidth);

        const slider = DomBuilder.element('input', {
            id: id,
            class: 'form-range',
            type: 'range',
            min: 25, max: 800, value: this.#maxWidth
        });
        slider.addEventListener('input', (e) => {
            this.#maxWidth = e.target.value;
            label.textContent = 'Width: ' + this.#maxWidth;
        });

        return DomBuilder.div({class: 'mb-3'}, [
            slider,
            DomBuilder.element('small', null, label)
        ]);
    }

    #createMaxHeightFormGroup() {
        const id = 'image-template_max-height';

        const label = DomBuilder.element('label', {'for': id}, 'Height: ' + this.#maxHeight);

        const slider = DomBuilder.element('input', {
            id: id,
            class: 'form-range',
            type: 'range',
            min: 25, max: 800, value: this.#maxHeight
        });
        slider.addEventListener('input', (e) => {
            this.#maxHeight = e.target.value;
            label.textContent = 'Height: ' + this.#maxHeight;
        });

        return DomBuilder.div({class: 'mb-3'}, [
            slider,
            DomBuilder.element('small', null, label)
        ]);
    }

    #creatMaterialFormGroup(brush, toolInfo) {
        const value = toolInfo.getCodeName();

        const checked = (this.#materialValue === value);
        const id = 'image-template_checkbox-material-' + value;

        const input = DomBuilder.element('input', {
            class: 'form-check-input',
            type: 'radio',
            name: 'template-material',
            id: id,
            value: value,
            checked: (checked) ? checked : null
        });
        input.addEventListener('click', () => {
            this.#materialBrush = brush;
            this.#materialValue = value;
        });

        const labelAttributes = {
            class: 'form-check-label btn btn-secondary btn-sand-game-tool ' + value,
            'for': id,
            style: toolInfo.getBadgeStyle()
        };
        return DomBuilder.div({class: 'form-check'}, [
            input,
            DomBuilder.element('label', labelAttributes, toolInfo.getDisplayName())
        ]);
    }

    getThresholdValue() {
        return this.#thresholdValue;
    }

    getMaterialBrush() {
        return this.#materialBrush;
    }

    getMaxWidth() {
        return this.#maxWidth;
    }

    getMaxHeight() {
        return this.#maxHeight;
    }
}