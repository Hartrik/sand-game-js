import {DomBuilder} from "./DomBuilder.js";
import {SnapshotIO} from "./SnapshotIO.js";
import {Snapshot} from "./core/Snapshot.js";
import FileSaver from 'file-saver';

/**
 *
 * @author Patrik Harag
 * @version 2023-03-12
 */
export class SandGameIOComponent {

    /** @type function():Snapshot */
    #onSaveFunction;

    /** @type function(Snapshot) */
    #onLoadFunction;

    constructor(onSaveFunction, onLoadFunction) {
        this.#onSaveFunction = onSaveFunction;
        this.#onLoadFunction = onLoadFunction;
    }

    createNode() {
        let content = DomBuilder.div({ class: 'load-and-save-tools' }, []);

        content.append(DomBuilder.button('Save', { class: 'btn btn-light' }, e => {
            let snapshot = this.#onSaveFunction();
            this.#download(snapshot);
        }));
        content.append(DomBuilder.button('Load', { class: 'btn btn-light' }, e => {
            this.#select();
        }));

        return content;
    }

    #download(snapshot) {
        let bytes = SnapshotIO.createSave(snapshot);
        FileSaver.saveAs(new Blob([bytes]), SnapshotIO.createFilename());
    }

    #select() {
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
        let snapshot = null;
        try {
            snapshot = SnapshotIO.parseSave(content);
        } catch (e) {
            alert('Error loading snapshot: ' + e);
        }
        if (snapshot) {
            this.#onLoadFunction(snapshot);
        }
    }
}
