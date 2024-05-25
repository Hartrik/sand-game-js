// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import Action from "./Action";

/**
 *
 * @author Patrik Harag
 * @version 2024-05-25
 */
export default class ActionShowActiveChunks extends Action {

    static #MARKER_GROUP = 'chunk';

    #registered = false;
    #enabled = false;

    performAction(controller) {
        this.#enabled = !this.#enabled;  // toggle

        if (!this.#registered) {
            if (controller.getSandGame() !== null) {
                const sandGame = controller.getSandGame();
                sandGame.addOnRendered((changedChunks) => {
                    this.#onRendered(controller, changedChunks);
                });
            }
            controller.addOnInitialized(sandGame => {
                sandGame.addOnRendered((changedChunks) => {
                    this.#onRendered(controller, changedChunks);
                });
            });
            this.#registered = true;
        }
    }

    #onRendered(controller, changedChunks) {
        if (this.#enabled) {
            this.#highlightChunks(controller, changedChunks);
        } else {
            this.#highlightChunks(controller, null);
        }
    }

    #highlightChunks(controller, changedChunks) {
        this.#initIfNeeded(controller);
        this.#update(controller, changedChunks);
    }

    #update(controller, changedChunks) {
        const sandGame = controller.getSandGame();
        const chunkSize = sandGame.getChunkSize();
        const horChunkCount = Math.ceil(sandGame.getWidth() / chunkSize);
        const verChunkCount = Math.ceil(sandGame.getHeight() / chunkSize);

        const markers = sandGame.overlay().getMarkers(ActionShowActiveChunks.#MARKER_GROUP);
        let highlighted = 0;

        if (changedChunks === null) {
            for (let cy = 0; cy < verChunkCount; cy++) {
                for (let cx = 0; cx < horChunkCount; cx++) {
                    const chunkIndex = cy * horChunkCount + cx;
                    const marker = markers[chunkIndex];
                    marker.setVisible(false);
                }
            }
        } else {
            for (let cy = 0; cy < verChunkCount; cy++) {
                for (let cx = 0; cx < horChunkCount; cx++) {
                    const chunkIndex = cy * horChunkCount + cx;
                    const marker = markers[chunkIndex];
                    if (changedChunks[chunkIndex]) {
                        highlighted++;
                        marker.setVisible(true);
                    } else {
                        marker.setVisible(false);
                    }
                }
            }
        }
    }

    #initIfNeeded(controller) {
        const sandGame = controller.getSandGame();
        const markers = sandGame.overlay().getMarkers(ActionShowActiveChunks.#MARKER_GROUP);

        if (markers.length === 0) {
            const chunkSize = sandGame.getChunkSize();
            const horChunkCount = Math.ceil(sandGame.getWidth() / chunkSize);
            const verChunkCount = Math.ceil(sandGame.getHeight() / chunkSize);

            // chunks
            for (let cy = 0; cy < verChunkCount; cy++) {
                for (let cx = 0; cx < horChunkCount; cx++) {
                    sandGame.overlay().createRectangleWH(cx * chunkSize, cy * chunkSize, chunkSize, chunkSize, {
                        visible: false,
                        group: ActionShowActiveChunks.#MARKER_GROUP,
                        style: {
                            outline: 'rgb(0, 255, 0) 1px solid',
                        }
                    });
                }
            }

            // label
            sandGame.overlay().createRectangleWH(0, 0, 100, 20, {
                visible: true,
                group: ActionShowActiveChunks.#MARKER_GROUP,
                style: {
                    color: 'rgb(18,121,18)'
                },
                label: 'Chunks: ' + (horChunkCount * verChunkCount)
            });
        }
    }
}
