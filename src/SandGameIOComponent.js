import {DomBuilder} from "./DomBuilder.js";
import {Assets} from "./Assets.js";
import {Brushes} from "./core/Brushes.js";
import {ElementArea} from "./core/ElementArea.js";
import {ResourceIO} from "./core/ResourceIO.js";
import {Analytics} from "./Analytics.js";
import FileSaver from 'file-saver';

/**
 *
 * @author Patrik Harag
 * @version 2023-05-19
 */
export class SandGameIOComponent {

    /** @type SandGameControls */
    #controls;

    /** @type TemplateForm */
    #templateForm;

    constructor(controls) {
        this.#controls = controls;
        this.#templateForm = new TemplateForm();
    }

    createNode() {
        let content = DomBuilder.div({ class: 'load-and-save-tools' }, []);

        content.append(DomBuilder.button('Save', { class: 'btn btn-light' }, e => {
            this.#download();
        }));
        content.append(DomBuilder.button('Load', { class: 'btn btn-light' }, e => {
            this.#load();
        }));

        return content;
    }

    #download() {
        const snapshot = this.#controls.createSnapshot();
        const bytes = ResourceIO.createResourceFromSnapshot(snapshot);
        FileSaver.saveAs(new Blob([bytes]), this.#createFilename());
        Analytics.triggerFeatureUsed(Analytics.FEATURE_IO_EXPORT);
    }

    #createFilename() {
        let date = new Date().toISOString().slice(0, 10);
        return `sand-game-js_${date}.sgjs`;
    }

    #load() {
        let input = document.createElement('input');
        input.type = 'file';
        input.onchange = e => {
            this.#loadFromFiles(e.target.files);
        }
        input.click();
    }

    initFileDragAndDrop(node) {
        const domNode = node[0];

        ['dragenter', 'dragover'].forEach(eventName => {
            domNode.addEventListener(eventName, e => {
                e.preventDefault()
                e.stopPropagation()
                domNode.classList.add('drag-and-drop-highlight');
            });
        });

        domNode.addEventListener('dragleave', e => {
            e.preventDefault()
            e.stopPropagation()
            domNode.classList.remove('drag-and-drop-highlight');
        });

        domNode.addEventListener('drop', e => {
            e.preventDefault()
            e.stopPropagation()
            domNode.classList.remove('drag-and-drop-highlight');

            this.#loadFromFiles(e.dataTransfer.files);
        });
    }

    #loadFromFiles(files) {
        if (!files) {
            return;
        }
        let file = files[0];

        let reader = new FileReader();
        reader.onload = (readerEvent) => {
            let content = readerEvent.target.result;
            this.#loadFromArrayBuffer(content, file.name);
        }
        reader.readAsArrayBuffer(file);
    }

    /**
     *
     * @param content {ArrayBuffer}
     * @param filename {string}
     */
    #loadFromArrayBuffer(content, filename) {
        try {
            let imageTypeOrNull = Assets.getImageTypeOrNull(filename);
            if (imageTypeOrNull !== null) {
                this.#loadImageTemplate(content, imageTypeOrNull);
            } else {
                ResourceIO.parseResource(content)
                        .then(scene => this.#importScene(scene))
                        .catch(e => this.#handleError(e));
            }
        } catch (e) {
            this.#handleError(e);
        }
    }

    #loadImageTemplate(content, image) {
        const handleImageTemplate = (brush, threshold, maxWidth, maxHeight) => {
            ResourceIO.fromImage(content, image, brush, ElementArea.TRANSPARENT_ELEMENT, threshold, maxWidth, maxHeight)
                .then(scene => this.#importImageTemplate(scene))
                .catch(e => this.#handleError(e));
        };

        let dialog = new DomBuilder.BootstrapDialog();
        dialog.setHeaderContent('Image template');
        dialog.setBodyContent(this.#templateForm.create());
        dialog.addSubmitButton('Place', () => {
            let materialBrush = this.#templateForm.getMaterialBrush();
            let thresholdValue = this.#templateForm.getThresholdValue();
            let maxWidth = this.#templateForm.getMaxWidth();
            let maxHeight = this.#templateForm.getMaxHeight();
            handleImageTemplate(materialBrush, thresholdValue, maxWidth, maxHeight);
        });
        dialog.addCloseButton('Close');
        dialog.show(this.#controls.getDialogAnchor());
    }

    #importImageTemplate(scene) {
        this.#controls.pasteScene(scene);
        Analytics.triggerFeatureUsed(Analytics.FEATURE_IO_IMAGE_TEMPLATE);
    }

    #importScene(scene) {
        try {
            let dialog = new DomBuilder.BootstrapDialog();
            dialog.setHeaderContent('Import scene');
            dialog.setBodyContent([
                DomBuilder.par(null, "The imported scene can be opened or placed on the current scene.")
            ]);
            dialog.addSubmitButton('Open', () => {
                Analytics.triggerFeatureUsed(Analytics.FEATURE_IO_IMPORT);
                return this.#controls.openScene(scene);
            });
            dialog.addSubmitButton('Place', () => {
                Analytics.triggerFeatureUsed(Analytics.FEATURE_IO_IMPORT);
                return this.#controls.pasteScene(scene);
            });
            dialog.addCloseButton('Close');
            dialog.show(this.#controls.getDialogAnchor());
        } catch (ex) {
            this.#handleError(ex);
        }
    }

    #handleError(e) {
        let dialog = new DomBuilder.BootstrapDialog();
        dialog.setHeaderContent('Error');
        dialog.setBodyContent([
            DomBuilder.par(null, "Error while loading resource:"),
            DomBuilder.element('code', null, e)
        ]);
        dialog.addCloseButton('Close');
        dialog.show(this.#controls.getDialogAnchor());
    }
}

/**
 * Creates template form and remembers last values.
 *
 * @author Patrik Harag
 * @version 2023-05-19
 */
class TemplateForm {

    #thresholdValue = 50;
    #maxWidth = 300;
    #maxHeight = 200;
    #materialValue = 'sand';
    #materialBrush = Brushes.SAND;

    create() {
        return DomBuilder.element('form', { class: 'image-template' }, [
            DomBuilder.element('fieldset', { class: 'form-group row' }, [
                DomBuilder.element('legend', { class: 'col-form-label col-sm-3 float-sm-left pt-0' }, 'Material'),
                DomBuilder.div({ class: 'col-sm-9' }, [
                    this.#creatMaterialFormGroup('sand', Brushes.SAND, 'Sand'),
                    this.#creatMaterialFormGroup('soil', Brushes.SOIL, 'Soil'),
                    this.#creatMaterialFormGroup('solid', Brushes.WALL, 'Solid'),
                    this.#creatMaterialFormGroup('wood', Brushes.TREE_WOOD, 'Wood')
                ])
            ]),
            DomBuilder.element('fieldset', { class: 'form-group row' }, [
                DomBuilder.element('legend', { class: 'col-form-label col-sm-3 float-sm-left pt-0' }, 'Background threshold'),
                DomBuilder.div({ class: 'col-sm-9' }, [
                    this.#createThresholdSliderFormGroup(),
                ])
            ]),
            DomBuilder.element('fieldset', { class: 'form-group row' }, [
                DomBuilder.element('legend', { class: 'col-form-label col-sm-3 float-sm-left pt-0' }, 'Max size'),
                DomBuilder.div({ class: 'col-sm-9' }, [
                    this.#createMaxWidthFormGroup(),
                    this.#createMaxHeightFormGroup(),
                ])
            ])
        ]);
    }

    #createThresholdSliderFormGroup() {
        const id = 'image-template_threshold-slider';

        const label = DomBuilder.element('label', { 'for': id }, 'Value: ' + this.#thresholdValue);

        const slider = DomBuilder.element('input', {
            id: id,
            class: 'form-control-range',
            type: 'range',
            min: 0, max: 255, value: this.#thresholdValue
        });
        slider.on('change', (e) => {
            this.#thresholdValue = e.target.value;
            label.text('Value: ' + this.#thresholdValue);
        });

        return DomBuilder.div({ class: 'form-group' }, [
            slider,
            DomBuilder.element('small', null, label)
        ]);
    }

    #createMaxWidthFormGroup() {
        const id = 'image-template_max-width';

        const label = DomBuilder.element('label', { 'for': id }, 'Width: ' + this.#maxWidth);

        const slider = DomBuilder.element('input', {
            id: id,
            class: 'form-control-range',
            type: 'range',
            min: 25, max: 800, value: this.#maxWidth
        });
        slider.on('change', (e) => {
            this.#maxWidth = e.target.value;
            label.text('Width: ' + this.#maxWidth);
        });

        return DomBuilder.div({ class: 'form-group' }, [
            slider,
            DomBuilder.element('small', null, label)
        ]);
    }

    #createMaxHeightFormGroup() {
        const id = 'image-template_max-height';

        const label = DomBuilder.element('label', { 'for': id }, 'Height: ' + this.#maxHeight);

        const slider = DomBuilder.element('input', {
            id: id,
            class: 'form-control-range',
            type: 'range',
            min: 25, max: 800, value: this.#maxHeight
        });
        slider.on('change', (e) => {
            this.#maxHeight = e.target.value;
            label.text('Height: ' + this.#maxHeight);
        });

        return DomBuilder.div({ class: 'form-group' }, [
            slider,
            DomBuilder.element('small', null, label)
        ]);
    }

    #creatMaterialFormGroup(value, brush, label) {
        const checked = (this.#materialValue === value);
        const id = 'image-template_checkbox-material-' + value;

        const input = DomBuilder.element('input', {
            class: 'form-check-input',
            type: 'radio',
            name: 'template-material',
            id: id,
            value: value,
            checked: checked
        });
        input.on('click', () => {
            this.#materialBrush = brush;
            this.#materialValue = value;
        });

        return DomBuilder.div({ class: 'form-check' }, [
            input,
            DomBuilder.element('label', { class: 'form-check-label', 'for': id }, label)
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
