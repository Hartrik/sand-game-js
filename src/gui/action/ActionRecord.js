// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import Action from "./Action";
import FileSaver from 'file-saver';
import { zipSync } from "fflate";

/**
 *
 * @author Patrik Harag
 * @version 2024-02-02
 */
export default class ActionRecord extends Action {

    #controllerHandlersRegistered = false;
    #sandGameHandlersRegistered = false;

    #zipData = null;

    performAction(controller) {
        if (!this.#controllerHandlersRegistered) {
            controller.addOnBeforeClosed(() => {
                if (this.#zipData !== null) {
                    this.#stopRecording();
                }
            });
            controller.addOnInitialized(sandGame => {
                this.#sandGameHandlersRegistered = false;
            })
            this.#controllerHandlersRegistered = true;
        }

        if (this.#zipData === null) {
            // start recording
            this.#zipData = {};

            if (!this.#sandGameHandlersRegistered) {
                let processed = false;
                let lastIteration = 0;
                let frameInProgress = false;
                controller.getSandGame().addOnProcessed((iteration) => {
                    processed = true;
                    lastIteration = iteration;
                });
                controller.getSandGame().addOnRendered(() => {
                    if (this.#zipData !== null && processed && !frameInProgress) {
                        frameInProgress = true;
                        this.#addFrame(controller, lastIteration, () => frameInProgress = false);
                        processed = false;
                    }
                });
                this.#sandGameHandlersRegistered = true;
            }
        } else {
            this.#stopRecording();
        }
    }

    #addFrame(controller, iteration, completed) {
        const canvas = controller.getCanvas();
        if (canvas !== null) {
            canvas.toBlob((blob) => {
                blob.arrayBuffer().then(arrayBuffer => {
                    const array = new Uint8Array(arrayBuffer);
                    if (this.#zipData !== null) {
                        this.#zipData[`iteration_${String(iteration).padStart(6, '0')}.png`] = array;
                    }
                }).finally(() => {
                    completed();
                })
            });
        }
    }

    #stopRecording() {
        this.#download(this.#zipData, 'frames.zip');
        this.#zipData = null;
    }

    #download(zipData, filename) {
        const bytes = zipSync(zipData, { level: 0 });
        FileSaver.saveAs(new Blob([bytes]), filename);
    }
}
