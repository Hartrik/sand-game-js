import {DomBuilder} from "./DomBuilder.js";
import {SandGameControls} from "./SandGameControls.js";
import {Processor} from "../core/Processor.js";
import {Analytics} from "../Analytics.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-08-19
 */
export class SandGameOptionsComponent {

    /** @type SandGameControls */
    #controls;
    /** @type SandGameControllerIO */
    #ioController;

    /**
     *
     * @param sandGameControls {SandGameControls}
     * @param ioController {SandGameControllerIO}
     */
    constructor(sandGameControls, ioController) {
        this.#ioController = ioController;
        this.#controls = sandGameControls;
    }

    createNode() {
        return DomBuilder.div({class: 'sand-game-options'}, [
            this.#createImportButton(),
            this.#createExportButton(),
            this.#createStartStopButton(),
            this.#createStatusButton()
        ]);
    }

    #createImportButton() {
        return DomBuilder.button('Import', { class: 'btn btn-light' }, e => {
            this.#ioController.doImport();
        });
    }

    #createExportButton() {
        return DomBuilder.button('Export', { class: 'btn btn-light' }, e => {
            this.#ioController.doExport();
        });
    }

    #createStartStopButton() {
        const node = DomBuilder.button('', { class: 'btn btn-light' }, e => {
            this.#controls.switchStartStop();
            Analytics.triggerFeatureUsed(Analytics.FEATURE_PAUSE);
        });

        function updateStartStopButton(node, running) {
            node.text(running ? 'Pause' : 'Start');
        }

        this.#controls.addOnStarted(() => updateStartStopButton(node, true));
        this.#controls.addOnStopped(() => updateStartStopButton(node, false));

        return node;
    }

    #createStatusButton() {
        let currenStatus = '';

        const nodeStatusLabel = DomBuilder.span('');
        const nodeLabel = [
            DomBuilder.span('Performance: ', { class: 'status-label' }),
            nodeStatusLabel
        ];

        const node = DomBuilder.div({ class: 'btn-group' }, [
            DomBuilder.element('button', {
                type: 'button',
                class: 'btn btn-link dropdown-toggle',
                'data-toggle': 'dropdown',
                'aria-haspopup': 'true',
                'aria-expanded': 'false'
            }, nodeLabel),
            DomBuilder.element('form', { class: 'dropdown-menu p-2' }, this.#createStatusContent())
        ]);
        node.on('show.bs.dropdown', function () {
            Analytics.triggerFeatureUsed(Analytics.FEATURE_STATUS_DISPLAYED);
        });

        let updateStatus = (node, status) => {
            if (status !== currenStatus) {
                nodeStatusLabel.text(status.toUpperCase());
                nodeStatusLabel.removeClass('status-' + currenStatus);
                nodeStatusLabel.addClass('status-' + status);
                currenStatus = status;
            }
        }

        this.#controls.addOnStopped(() => updateStatus(node, 'stopped'));
        this.#controls.addOnStarted(() => updateStatus(node, 'started'));
        this.#controls.addOnPerformanceUpdate((cps, fps) => {
            if (cps === 0) {
                updateStatus(node, 'stopped');
                return;
            }
            if (cps > 105) {
                updateStatus(node, 'best');
                return;
            }
            if (cps > 80) {
                updateStatus(node, 'good');
                return;
            }
            if (cps > 50) {
                updateStatus(node, 'medium');
                return;
            }
            if (cps > 40) {
                updateStatus(node, 'low');
                return;
            }
            updateStatus(node, 'poor');
        });

        return node;
    }

    #createStatusContent() {
        const labelCPS = DomBuilder.span();
        const labelFPS = DomBuilder.span();
        this.#controls.addOnPerformanceUpdate((cps, fps) => {
            labelFPS.text('= ' + fps);
            labelCPS.text('= ' + cps);
        });

        const labelCanvasSize = DomBuilder.span();
        const updateCanvasSize = () => {
            const w = this.#controls.getCurrentWidthPoints();
            const h = this.#controls.getCurrentHeightPoints();
            labelCanvasSize.text(`= ${w.toLocaleString()}\u00D7${h.toLocaleString()} = ${(w * h).toLocaleString()}`);
        }
        this.#controls.addOnInitialized(() => {
            updateCanvasSize();
        });
        updateCanvasSize();

        return [
            DomBuilder.span('Simulated elements'),
            DomBuilder.element('br'),
            labelCanvasSize,
            DomBuilder.element('br'),

            DomBuilder.span('Simulation iterations /s'),
            DomBuilder.element('br'),
            labelCPS,
            DomBuilder.span(' (target: ' + Processor.OPT_CYCLES_PER_SECOND + ')', { style: 'color: lightgray;' }),
            DomBuilder.element('br'),

            DomBuilder.span('Rendered frames /s'),
            DomBuilder.element('br'),
            labelFPS,
            DomBuilder.span(' (target: ' + Processor.OPT_FRAMES_PER_SECOND + ')', { style: 'color: lightgray;' }),
            DomBuilder.element('br'),

            DomBuilder.element('br'),

            DomBuilder.span('Tip: adjust scale if needed'),
        ];
    }
}
