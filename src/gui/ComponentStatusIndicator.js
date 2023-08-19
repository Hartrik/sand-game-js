import { Analytics } from "../Analytics";
import { DomBuilder } from "./DomBuilder";
import { Processor } from "../core/Processor";
import { Component } from "./Component";

/**
 *
 * @author Patrik Harag
 * @version 2023-08-19
 */
export class ComponentStatusIndicator extends Component {

    createNode(sandGameControls) {
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
            DomBuilder.element('form', { class: 'dropdown-menu p-2' }, this.#createStatusContent(sandGameControls))
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

        sandGameControls.addOnStopped(() => updateStatus(node, 'stopped'));
        sandGameControls.addOnStarted(() => updateStatus(node, 'started'));
        sandGameControls.addOnInitialized(sandGame => {
            sandGame.addOnRendered(() => {
                const ips = sandGameControls.getSandGame().getIterationsPerSecond();
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

    #createStatusContent(sandGameControls) {
        const labelCPS = DomBuilder.span();
        const labelFPS = DomBuilder.span();
        sandGameControls.addOnInitialized(sandGame => {
            sandGame.addOnRendered(() => {
                const fps = sandGameControls.getSandGame().getFramesPerSecond();
                const ips = sandGameControls.getSandGame().getIterationsPerSecond();
                labelFPS.text('= ' + fps);
                labelCPS.text('= ' + ips);
            });
        });

        const labelCanvasSize = DomBuilder.span();
        const updateCanvasSize = () => {
            const w = sandGameControls.getCurrentWidthPoints();
            const h = sandGameControls.getCurrentHeightPoints();
            labelCanvasSize.text(`= ${w.toLocaleString()}\u00D7${h.toLocaleString()} = ${(w * h).toLocaleString()}`);
        }
        sandGameControls.addOnInitialized(() => {
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
