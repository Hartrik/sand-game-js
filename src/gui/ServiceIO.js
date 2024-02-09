import {DomBuilder} from "./DomBuilder.js";
import {ElementArea} from "../core/ElementArea.js";
import {Resources} from "../io/Resources.js";
import {ResourceUtils} from "../io/ResourceUtils";
import {Analytics} from "../Analytics.js";
import {Scene} from "../core/scene/Scene";
import {Tool} from "../core/tool/Tool";
import {Tools} from "../core/tool/Tools";
import {InsertElementAreaTool} from "../core/tool/InsertElementAreaTool";
import {InsertRandomSceneTool} from "../core/tool/InsertRandomSceneTool";
import {ComponentFormTemplate} from "./component/ComponentFormTemplate";

// TODO: refactor

/**
 *
 * @author Patrik Harag
 * @version 2024-02-06
 */
export class ServiceIO {

    /** @type Controller */
    #controller;

    /** @type ComponentFormTemplate */
    #templateForm;

    constructor(controller) {
        this.#controller = controller;
        this.#templateForm = new ComponentFormTemplate();
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
        dialog.setBodyContent(this.#templateForm.createNode());
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
            if (tool instanceof InsertElementAreaTool || tool instanceof InsertRandomSceneTool) {
                const revert = toolManager.createRevertAction();
                toolManager.setPrimaryTool(tool);
                toolManager.setSecondaryTool(Tools.actionTool(revert));
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