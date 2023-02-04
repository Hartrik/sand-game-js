import {DomBuilder} from "./DomBuilder.js";
import {SnapshotIO} from "./SnapshotIO.js";
import {Snapshot} from "./core/Snapshot.js";
import FileSaver from 'file-saver';

/**
 *
 * @author Patrik Harag
 * @version 2023-02-04
 */
export class SandGameSaveComponent {

    /** @type function():Snapshot */
    #onSaveFunction;

    /** @type function(Snapshot) */
    #onLoadFunction;

    constructor(onSaveFunction, onLoadFunction) {
        this.#onSaveFunction = onSaveFunction;
        this.#onLoadFunction = onLoadFunction;
    }

    createNode() {
        let content = DomBuilder.div({ class: 'load-and-save' }, []);

        content.append(DomBuilder.link('Save', { class: 'btn btn-light' }, e => {
            let snapshot = this.#onSaveFunction();
            this.#download(snapshot);
        }));
        content.append(DomBuilder.link('Load', { class: 'btn btn-light' }, e => {
            this.#select();
        }));

        return content;
    }

    #download(snapshot) {
        let bytes = SnapshotIO.createSave(snapshot);
        FileSaver.saveAs(new Blob([bytes]), SnapshotIO.DEFAULT_FILENAME);
    }

    #select() {
        let input = document.createElement('input');
        input.type = 'file';
        input.onchange = e => {
            let file = e.target.files[0];
            let reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = readerEvent => {
                let content = readerEvent.target.result;
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
        input.click();
    }
}
