import {DomBuilder} from "./DomBuilder.js";
import {BrushDefs} from "../def/BrushDefs.js";
import {ElementArea} from "../core/ElementArea.js";
import {Resources} from "../core/Resources.js";
import {ResourceUtils} from "../core/ResourceUtils";
import {Analytics} from "../Analytics.js";
import {Scene} from "../core/Scene";
import {Tool} from "../core/Tool";
import {Tools} from "../core/Tools";

// TODO: refactor

/**
 *
 * @author Patrik Harag
 * @version 2023-12-22
 */
export class ServiceIO {

    /** @type Controller */
    #controller;

    /** @type TemplateForm */
    #templateForm;

    constructor(controller) {
        this.#controller = controller;
        this.#templateForm = new TemplateForm();
    }

    initFileDragAndDrop(domNode) {
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

            this.loadFromFiles(e.dataTransfer.files);
        });
    }

    loadFromFiles(files) {
        if (!files) {
            return;
        }
        let file = files[0];

        let reader = new FileReader();
        reader.onload = (readerEvent) => {
            let content = readerEvent.target.result;
            this.loadFromArrayBuffer(content, file.name);
        }
        reader.readAsArrayBuffer(file);
    }

    /**
     *
     * @param content {ArrayBuffer}
     * @param filename {string}
     */
    loadFromArrayBuffer(content, filename) {
        try {
            let imageTypeOrNull = ResourceUtils.getImageTypeOrNull(filename);
            if (imageTypeOrNull !== null) {
                this.#loadImageTemplate(content, imageTypeOrNull);
            } else if (filename.endsWith(".json")) {
                Resources.parseJsonResource(content)
                        .then(resource => this.#importResource(resource))
                        .catch(e => this.#handleError(e));
            } else {
                Resources.parseZipResource(content)
                        .then(resource => this.#importResource(resource))
                        .catch(e => this.#handleError(e));
            }
        } catch (e) {
            this.#handleError(e);
        }
    }

    #loadImageTemplate(content, imageType) {
        const handleImageTemplate = (brush, threshold, maxWidth, maxHeight) => {
            const objectUrl = ResourceUtils.asObjectUrl(content, imageType);
            const defaultElement = ElementArea.TRANSPARENT_ELEMENT;
            ResourceUtils.loadImageData(objectUrl, maxWidth, maxHeight)
                .then(imageData => {
                    try {
                        const scene = ResourceUtils.createSceneFromImageTemplate(imageData, brush, defaultElement, threshold);
                        this.#importImageTemplate(scene);
                    } catch (e) {
                        this.#handleError(e);
                    }
                })
                .catch(e => this.#handleError(e));
        };

        let dialog = DomBuilder.bootstrapDialogBuilder();
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
        dialog.show(this.#controller.getDialogAnchor());
    }

    #importImageTemplate(scene) {
        this.#controller.pasteScene(scene);
        Analytics.triggerFeatureUsed(Analytics.FEATURE_IO_IMAGE_TEMPLATE);
    }

    #importResource(resource) {
        if (resource instanceof Scene) {
            this.#importScene(resource);

        } else if (resource instanceof Tool) {
            const tool = resource;
            const toolManager = this.#controller.getToolManager();
            if (tool.getCategory() === 'template') {
                const revert = toolManager.createRevertAction();
                toolManager.setPrimaryTool(tool);
                toolManager.setSecondaryTool(Tools.actionTool(null, null, null, revert));
            } else {
                toolManager.setPrimaryTool(tool);
            }

        } else {
            this.#handleError('Unknown resource type');
        }
    }

    #importScene(scene) {
        try {
            let dialog = DomBuilder.bootstrapDialogBuilder();
            dialog.setHeaderContent('Import scene');
            dialog.setBodyContent([
                DomBuilder.par(null, "The imported scene can be opened or placed on the current scene.")
            ]);
            dialog.addSubmitButton('Open', () => {
                Analytics.triggerFeatureUsed(Analytics.FEATURE_IO_IMPORT);
                return this.#controller.openScene(scene);
            });
            dialog.addSubmitButton('Place', () => {
                Analytics.triggerFeatureUsed(Analytics.FEATURE_IO_IMPORT);
                return this.#controller.pasteScene(scene);
            });
            dialog.addCloseButton('Close');
            dialog.show(this.#controller.getDialogAnchor());
        } catch (ex) {
            this.#handleError(ex);
        }
    }

    #handleError(e) {
        let dialog = DomBuilder.bootstrapDialogBuilder();
        dialog.setHeaderContent('Error');
        dialog.setBodyContent([
            DomBuilder.par(null, "Error while loading resource:"),
            DomBuilder.element('code', null, '' + e)
        ]);
        dialog.addCloseButton('Close');
        dialog.show(this.#controller.getDialogAnchor());
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
    #materialBrush = BrushDefs.SAND;

    create() {
        return DomBuilder.element('form', null, [
            DomBuilder.element('fieldset', { class: 'mb-3 row' }, [
                DomBuilder.element('legend', { class: 'col-form-label col-sm-3 float-sm-left pt-0' }, 'Material'),
                DomBuilder.div({ class: 'col-sm-9' }, [
                    this.#creatMaterialFormGroup('sand', BrushDefs.SAND, 'Sand'),
                    this.#creatMaterialFormGroup('soil', BrushDefs.SOIL, 'Soil'),
                    this.#creatMaterialFormGroup('wall', BrushDefs.WALL, 'Solid'),
                    this.#creatMaterialFormGroup('wood', BrushDefs.TREE_WOOD, 'Wood')
                ])
            ]),
            DomBuilder.element('fieldset', { class: 'mb-3 row' }, [
                DomBuilder.element('legend', { class: 'col-form-label col-sm-3 float-sm-left pt-0' }, 'Background threshold'),
                DomBuilder.div({ class: 'col-sm-9' }, [
                    this.#createThresholdSliderFormGroup(),
                ])
            ]),
            DomBuilder.element('fieldset', { class: 'mb-3 row' }, [
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
            class: 'form-range',
            type: 'range',
            min: 0, max: 255, value: this.#thresholdValue
        });
        slider.addEventListener('input', (e) => {
            this.#thresholdValue = e.target.value;
            label.textContent = 'Value: ' + this.#thresholdValue;
        });

        return DomBuilder.div({ class: 'mb-3' }, [
            slider,
            DomBuilder.element('small', null, label)
        ]);
    }

    #createMaxWidthFormGroup() {
        const id = 'image-template_max-width';

        const label = DomBuilder.element('label', { 'for': id }, 'Width: ' + this.#maxWidth);

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

        return DomBuilder.div({ class: 'mb-3' }, [
            slider,
            DomBuilder.element('small', null, label)
        ]);
    }

    #createMaxHeightFormGroup() {
        const id = 'image-template_max-height';

        const label = DomBuilder.element('label', { 'for': id }, 'Height: ' + this.#maxHeight);

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

        return DomBuilder.div({ class: 'mb-3' }, [
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
        input.addEventListener('click', () => {
            this.#materialBrush = brush;
            this.#materialValue = value;
        });

        return DomBuilder.div({ class: 'form-check' }, [
            input,
            DomBuilder.element('label', { class: 'form-check-label btn btn-secondary btn-sand-game-tool ' + value, 'for': id }, label)
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
