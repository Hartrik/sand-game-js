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
 * @version 2023-05-17
 */
export class SandGameIOComponent {

    /** @type SandGameControls */
    #controls;

    constructor(controls) {
        this.#controls = controls;
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
        // TODO: store last values
        let brushFormCheckLastValue = 'sand';
        let selectedMaterialBrush = Brushes.SAND;

        let creatBrushFormCheck = (id, value, brush, label) => {
            let checked = (brushFormCheckLastValue === value);
            return DomBuilder.div({ class: 'form-check' }, [
                DomBuilder.element('input', {
                    class: 'form-check-input',
                    type: 'radio',
                    name: 'template-material',
                    id: id,
                    value: value,
                    checked: checked
                }).on('click', () => selectedMaterialBrush = brush),
                DomBuilder.element('label', { class: 'form-check-label', 'for': id }, label)
            ]);
        };

        let threshold = 50;

        let form = DomBuilder.element('form', null, [
            DomBuilder.element('fieldset', { class: 'form-group row' }, [
                DomBuilder.element('legend', { class: 'col-form-label col-sm-3 float-sm-left pt-0' }, 'Material'),
                DomBuilder.div({ class: 'col-sm-9' }, [
                    creatBrushFormCheck('image-template_checkbox-material-sand', 'sand', Brushes.SAND, 'Sand'),
                    creatBrushFormCheck('image-template_checkbox-material-soil', 'soil', Brushes.SOIL, 'Soil'),
                    creatBrushFormCheck('image-template_checkbox-material-solid', 'solid', Brushes.WALL, 'Solid'),
                    creatBrushFormCheck('image-template_checkbox-material-wood', 'wood', Brushes.TREE_WOOD, 'Wood')
                ])
            ]),
            DomBuilder.element('fieldset', { class: 'form-group row' }, [
                DomBuilder.element('legend', { class: 'col-form-label col-sm-3 float-sm-left pt-0' }, 'Background threshold'),
                DomBuilder.div({ class: 'col-sm-9' }, [
                    DomBuilder.element('input', {
                        class: 'form-control-range',
                        type: 'range',
                        min: 0, max: 255, value: threshold
                    }).on('change', (e) => {
                        threshold = e.target.value;
                    }),
                ])
            ])
        ]);

        const handleImageTemplate = (brush, threshold) => {
            ResourceIO.fromImage(content, image, brush, ElementArea.TRANSPARENT_ELEMENT, threshold)
                .then(scene => this.#importImageTemplate(scene))
                .catch(e => this.#handleError(e));
        };

        let dialog = new DomBuilder.BootstrapDialog();
        dialog.setHeaderContent('Image template');
        dialog.setBodyContent(form);
        dialog.addSubmitButton('Place', () => handleImageTemplate(selectedMaterialBrush, threshold));
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
        let msg = (typeof e === 'object') ? JSON.stringify(e) : '' + e;
        let dialog = new DomBuilder.BootstrapDialog();
        dialog.setHeaderContent('Error');
        dialog.setBodyContent([
            DomBuilder.par(null, "Error while loading resource:"),
            DomBuilder.element('code', null, msg)
        ]);
        dialog.addCloseButton('Close');
        dialog.show(this.#controls.getDialogAnchor());
    }
}
