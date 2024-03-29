// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import Analytics from "../../Analytics";
import DomBuilder from "../DomBuilder";
import Processor from "../../core/processing/Processor";
import Component from "./Component";

/**
 *
 * @author Patrik Harag
 * @version 2024-03-23
 */
export default class ComponentStatusIndicator extends Component {

    #additionalInfo;

    constructor(additionalInfo = null) {
        super();
        this.#additionalInfo = additionalInfo;
    }

    createNode(controller) {
        let currenStatus = '';

        const nodeStatusLabel = DomBuilder.span('');
        const nodeLabel = [
            DomBuilder.span('Performance: ', { class: 'visible-on-big-screen-only' }),
            nodeStatusLabel
        ];

        const node = DomBuilder.div({ class: 'btn-group' }, [
            DomBuilder.element('button', {
                type: 'button',
                class: 'btn btn-link dropdown-toggle',
                'data-bs-toggle': 'dropdown',
                'aria-expanded': 'false'
            }, nodeLabel),
            DomBuilder.element('form', { class: 'dropdown-menu p-2' }, this.#createStatusContent(controller))
        ]);
        node.addEventListener('show.bs.dropdown', function () {
            Analytics.triggerFeatureUsed(Analytics.FEATURE_STATUS_DISPLAYED);
        });

        let updateStatus = (node, status) => {
            if (status !== currenStatus) {
                nodeStatusLabel.textContent = (status.toUpperCase());
                nodeStatusLabel.classList.remove('status-' + currenStatus);
                nodeStatusLabel.classList.add('status-' + status);
                currenStatus = status;
            }
        }

        controller.addOnStopped(() => updateStatus(node, 'stopped'));
        controller.addOnStarted(() => updateStatus(node, 'started'));
        controller.addOnInitialized(sandGame => {
            sandGame.addOnRendered(() => {
                const ips = controller.getSandGame().getIterationsPerSecond();
                if (ips === 0) {
                    updateStatus(node, 'stopped');
                    return;
                }
                if (ips > 105) {
                    updateStatus(node, 'best');
                    return;
                }
                if (ips > 80) {
                    updateStatus(node, 'good');
                    return;
                }
                if (ips > 50) {
                    updateStatus(node, 'medium');
                    return;
                }
                if (ips > 40) {
                    updateStatus(node, 'low');
                    return;
                }
                updateStatus(node, 'poor');
            });
        });

        return node;
    }

    #createStatusContent(controller) {
        const labelCPS = DomBuilder.span();
        const labelFPS = DomBuilder.span();
        controller.addOnInitialized(sandGame => {
            sandGame.addOnRendered(() => {
                const fps = controller.getSandGame().getFramesPerSecond();
                const ips = controller.getSandGame().getIterationsPerSecond();
                labelFPS.textContent = ' = ' + fps;
                labelCPS.textContent = ' = ' + ips;
            });
        });

        const labelCanvasSize = DomBuilder.span();
        const updateCanvasSize = () => {
            const w = controller.getCurrentWidthPoints();
            const h = controller.getCurrentHeightPoints();
            labelCanvasSize.textContent = ` = ${w.toLocaleString()}\u00D7${h.toLocaleString()} = ${(w * h).toLocaleString()}`;
        }
        controller.addOnInitialized(() => {
            updateCanvasSize();
        });
        updateCanvasSize();

        return [
            DomBuilder.span('Sand Game JS ' + controller.getVersion(), { style: 'font-weight: bold;' }),
            DomBuilder.element('br'),

            DomBuilder.span('Simulated elements'),
            labelCanvasSize,
            DomBuilder.element('br'),

            DomBuilder.span('Simulation iterations /s'),
            labelCPS,
            DomBuilder.span(' (target: ' + Processor.OPT_CYCLES_PER_SECOND + ')', { style: 'color: lightgray;' }),
            DomBuilder.element('br'),

            DomBuilder.span('Rendered frames /s'),
            labelFPS,
            DomBuilder.span(' (target: ' + Processor.OPT_FRAMES_PER_SECOND + ')', { style: 'color: lightgray;' }),
            DomBuilder.element('br'),

            this.#additionalInfo
        ];
    }
}
