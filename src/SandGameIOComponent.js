import {DomBuilder} from "./DomBuilder.js";
import {ResourceIO} from "./core/ResourceIO.js";
import {Analytics} from "./Analytics.js";
import FileSaver from 'file-saver';

/**
 *
 * @author Patrik Harag
 * @version 2023-04-29
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
            this.#loadFromArrayBuffer(content);
        }
        reader.readAsArrayBuffer(file);
    }

    /**
     *
     * @param content {ArrayBuffer}
     */
    #loadFromArrayBuffer(content) {
        let scene = null;
        try {
            scene = ResourceIO.parseResource(content);
        } catch (e) {
            let dialog = new DomBuilder.BootstrapDialog();
            dialog.setHeaderContent('Error');
            dialog.setBodyContent([
                DomBuilder.par(null, "Error while loading resource:"),
                DomBuilder.element('code', null, '' + e)
            ]);
            dialog.addCloseButton('Close');
            dialog.show(this.#controls.getDialogAnchor());
        }
        if (scene) {
            let dialog = new DomBuilder.BootstrapDialog();
            dialog.setHeaderContent('Import scene');
            dialog.setBodyContent([
                DomBuilder.par(null, "The imported scene can be opened or pasted into the current scene.")
            ]);
            dialog.addSubmitButton('Open', () => this.#controls.openScene(scene));
            dialog.addSubmitButton('Paste', () => this.#controls.pasteScene(scene));
            dialog.addCloseButton('Close');
            dialog.show(this.#controls.getDialogAnchor());

            Analytics.triggerFeatureUsed(Analytics.FEATURE_IO_IMPORT);
        }
    }
}
