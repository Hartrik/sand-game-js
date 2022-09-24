import { DomBuilder } from "./DomBuilder.js";
import { SandGame, Brushes } from "./SandGame.js";

/**
 * @requires jQuery
 *
 * @author Patrik Harag
 * @version 2022-09-24
 */
export class SandGameComponent {

    #init = {
        scale: 0.5,
        canvasWidthPx: 700,
        canvasHeightPx: 400,
        brushSize: 5
    };

    #widthPoints;
    #heightPoints;

    #node = null;

    #nodeCanvas;
    #nodeLabelCounter;
    #nodeLabelSize;
    #nodeLinkStart;
    #nodeLinkStop;

    /** @type SandGame */
    #sandGame = null;

    #brush = Brushes.SAND;

    constructor(init) {
        if (init) {
            this.#init = init;
        }
        this.#widthPoints = Math.trunc(this.#init.canvasWidthPx * this.#init.scale);
        this.#heightPoints = Math.trunc(this.#init.canvasHeightPx * this.#init.scale);
    }

    createNode() {
        // prepare canvas
        this.#nodeCanvas = DomBuilder.element('canvas', {
            class: 'sand-game-canvas',
            width: this.#widthPoints + 'px',
            height: this.#heightPoints + 'px'
        });
        this.#nodeCanvas.bind('contextmenu', e => false);

        // prepare options
        this.#nodeLabelCounter = DomBuilder.span('', { class: 'sand-game-counter' });
        this.#nodeLabelSize = DomBuilder.span('',{ class: 'sand-game-size' });
        this.#nodeLinkStart = DomBuilder.link('[start]', { class: 'start-button' }, e => {
            this.#sandGame.startProcessing();
            this.#nodeLinkStop.show();
            this.#nodeLinkStart.hide();
        });
        this.#nodeLinkStart.hide();
        this.#nodeLinkStop = DomBuilder.link('[stop]', { class: 'stop-button' }, e => {
            this.#sandGame.stopProcessing();
            this.#nodeLinkStop.hide();
            this.#nodeLinkStart.show();
        });
        this.#nodeLinkStop.hide();

        // create component node
        this.#node = DomBuilder.div({ class: 'sand-game-component' }, [
            DomBuilder.div({ class: 'sand-game-toolbar' }, [
                this.#createBrushButton('Sand', 'sand', Brushes.SAND),
                this.#createBrushButton('Soil', 'soil', Brushes.SOIL),
                this.#createBrushButton('Gravel', 'gravel', Brushes.STONE),
                this.#createBrushButton('Wall', 'wall', Brushes.WALL),
                this.#createBrushButton('Water', 'water', Brushes.WATER),
                this.#createBrushButton('Erase', 'air', Brushes.AIR)
            ]),
            this.#nodeCanvas
        ]);
        return this.#node;
    }

    #createBrushButton(name, cssName, brush) {
        return DomBuilder.link(name, {
            href: '#',
            class: 'badge badge-secondary ' + cssName
        }, () => this.#brush = brush)
    }

    initialize() {
        if (this.#node === null) {
            throw 'Illegal state: Node is not created yet';
        }

        // scale up
        this.#nodeCanvas.width(this.#init.canvasWidthPx);
        this.#nodeCanvas.height(this.#init.canvasHeightPx);

        // set size
        this.#nodeLabelSize.text(`${this.#widthPoints} x ${this.#heightPoints}, scale=${this.#init.scale}`);

        // init game
        let context = this.#nodeCanvas[0].getContext('2d');
        let defaultElement = Brushes.AIR.apply(0, 0);
        this.#sandGame = new SandGame(context, this.#widthPoints, this.#heightPoints, defaultElement);
        this.#sandGame.addOnRendered(() => {
            this.#nodeLabelCounter.text(this.#sandGame.getFramesPerSecond() + ' frames/s, '
                    + this.#sandGame.getCyclesPerSecond() + ' cycles/s');
        });

        // mouse handling
        this.#initMouseHandling(this.#sandGame);

        // start rendering
        this.#sandGame.startRendering();

        this.#nodeLinkStart.show();  // processing can be started now
    }

    #initMouseHandling(sandGame) {
        const domNode = this.#nodeCanvas[0];

        let getActualMousePosition = (e) => {
            const rect = domNode.getBoundingClientRect();
            const x = Math.max(0, Math.trunc((e.clientX - rect.left) * this.#init.scale));
            const y = Math.max(0, Math.trunc((e.clientY - rect.top) * this.#init.scale));
            return [x, y];
        }

        let lastX, lastY;
        let brush = null;  // drawing is not active if null
        let ctrlPressed = false;
        let shiftPressed = false;

        domNode.addEventListener('mousedown', (e) => {
            const [x, y] = getActualMousePosition(e);
            lastX = x;
            lastY = y;

            if (e.buttons === 4) {
                // middle button
                e.preventDefault();
                sandGame.graphics().floodFill(x, y, this.#brush);
                brush = null;
                return;
            }

            brush = (e.buttons === 1) ? this.#brush : Brushes.AIR;
            ctrlPressed = e.ctrlKey;
            shiftPressed = e.shiftKey;
            if (!ctrlPressed && !shiftPressed) {
                sandGame.graphics().drawLine(x, y, x, y, this.#init.brushSize, brush);
            }
        });
        domNode.addEventListener('mousemove', (e) => {
            if (brush === null) {
                return;
            }
            if (!ctrlPressed && !shiftPressed) {
                const [x, y] = getActualMousePosition(e);
                sandGame.graphics().drawLine(lastX, lastY, x, y, this.#init.brushSize, brush);
                lastX = x;
                lastY = y;
            }
        });
        domNode.addEventListener('mouseup', (e) => {
            if (brush === null) {
                return;
            }
            if (ctrlPressed) {
                const [x, y] = getActualMousePosition(e);
                let minX = Math.min(lastX, x);
                let minY = Math.min(lastY, y);
                let maxX = Math.max(lastX, x);
                let maxY = Math.max(lastY, y);
                sandGame.graphics().drawRectangle(minX, minY, maxX, maxY, brush);
            } else if (shiftPressed) {
                const [x, y] = getActualMousePosition(e);
                sandGame.graphics().drawLine(lastX, lastY, x, y, this.#init.brushSize, brush);
            }
            brush = null;
        });
        domNode.addEventListener('mouseout', (e) => {
            brush = null;
        });

        // touch support

        let getActualTouchPosition = (e) => {
            let touch = e.touches[0];
            return getActualMousePosition(touch);
        }
        domNode.addEventListener('touchstart', (e) => {
            const [x, y] = getActualTouchPosition(e);
            lastX = x;
            lastY = y;
            brush = this.#brush;
            sandGame.graphics().drawLine(x, y, x, y, this.#init.brushSize, brush);

            e.preventDefault();
        });
        domNode.addEventListener('touchmove', (e) => {
            if (brush === null) {
                return;
            }
            const [x, y] = getActualTouchPosition(e);
            sandGame.graphics().drawLine(lastX, lastY, x, y, this.#init.brushSize, brush);
            lastX = x;
            lastY = y;

            e.preventDefault();
        });
        domNode.addEventListener('touchend', (e) => {
            brush = null;

            e.preventDefault();
        });
    }

    enableOptions() {
        if (this.#node === null) {
            throw 'Illegal state: Node is not created yet';
        }

        let options = DomBuilder.div({ class: 'sand-game-options' }, [
            this.#nodeLabelSize,
            this.#nodeLabelCounter,
            this.#nodeLinkStart,
            this.#nodeLinkStop
        ]);

        this.#node.append(options);
    }

    enableTemplateEditor() {
        if (this.#node === null) {
            throw 'Illegal state: Node is not created yet';
        }

        let brushes = {
            '.': Brushes.AIR,
            'w': Brushes.WATER,
            '1': Brushes.SAND,
            '2': Brushes.SOIL,
            '3': Brushes.STONE
        };
        let info = '. = air, w = water, 1 = sand, 2 = soil, 3 = stone';
        let blueprint = '111\n...\n...\n...';

        let textArea = DomBuilder.element('textarea', { class: 'form-control', rows: 8 }, blueprint);
        DomBuilder.Bootstrap.initTooltip(info, textArea);

        let form = DomBuilder.element('form', { action: 'javascript:void(0);' }, [
            DomBuilder.div({ class: 'form-group' }, [
                DomBuilder.element('label', null, 'Template'),
                textArea
            ]),
            DomBuilder.link('Apply', { class: 'btn btn-primary' }, e => {
                try {
                    this.#sandGame.template().withBrushes(brushes).withBlueprint(textArea.val()).paint();
                } catch (e) {
                    console.log(e);
                    alert(e);
                }
            })
        ]);

        this.#node.append(DomBuilder.Bootstrap.cardCollapsed('Template editor', form));
    }

    drawExample() {
        if (this.#sandGame === null) {
            throw 'Illegal state: Sand Game is not initialized yet';
        }

        this.#sandGame.template()
                .withMaxHeight(120)
                .withBlueprint([
                    '     ww   ',
                    '          ',
                    '          ',
                    '   11     ',
                    ' 2 11111 2',
                    ' 222    22',
                    '222    222',
                    '3333333333',
                    '          ',
                ])
                .withBrushes({
                    w: Brushes.withIntensity(Brushes.WATER, 0.95),
                    1: Brushes.SAND,
                    2: Brushes.SOIL,
                    3: Brushes.STONE
                })
                .paint();
    }

    start() {
        if (this.#sandGame === null) {
            throw 'Illegal state: Sand Game is not initialized yet';
        }

        this.#sandGame.startProcessing();
        this.#nodeLinkStop.show();
        this.#nodeLinkStart.hide();
    }
}
