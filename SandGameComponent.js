import { DomBuilder } from "./DomBuilder.js";
import { SandGame, Brushes } from "./SandGame.js";

/**
 * @requires jQuery
 *
 * @author Patrik Harag
 * @version 2022-09-25
 */
export class SandGameComponent {

    #init = {
        scale: 0.5,
        canvasWidthPx: 700,
        canvasHeightPx: 400,
        brushSize: 5
    };

    #brushDeclarations = [
        { name: 'Sand',   cssName: 'sand',   code: '1', brush: Brushes.SAND },
        { name: 'Soil',   cssName: 'soil',   code: '2', brush: Brushes.SOIL },
        { name: 'Gravel', cssName: 'gravel', code: '3', brush: Brushes.STONE },
        { name: 'Wall',   cssName: 'wall',   code: 's', brush: Brushes.WALL },
        { name: 'Water',  cssName: 'water',  code: 'w', brush: Brushes.WATER },
        { name: 'Erase',  cssName: 'air',    code: '.', brush: Brushes.AIR }
    ];

    #currentWidthPoints;
    #currentHeightPoints;
    #currentScale;

    #fallThroughEnabled = false;

    #node = null;
    #nodeHolderTopToolbar;
    #nodeHolderCanvas;
    #nodeHolderBottomToolbar;
    #nodeHolderAdditionalTools;

    #nodeCanvas;
    #nodeLabelCounter;
    #nodeLabelSize;
    #nodeLinkStart;
    #nodeLinkStop;

    /** @type SandGame */
    #sandGame = null;

    #brush = Brushes.SAND;

    constructor(rootNode, init) {
        if (init) {
            this.#init = init;
        }

        this.#currentWidthPoints = Math.trunc(this.#init.canvasWidthPx * this.#init.scale);
        this.#currentHeightPoints = Math.trunc(this.#init.canvasHeightPx * this.#init.scale);
        this.#currentScale = this.#init.scale;

        // create component node
        this.#node = DomBuilder.div({ class: 'sand-game-component' }, [
            this.#nodeHolderTopToolbar = DomBuilder.div(),
            this.#nodeHolderCanvas = DomBuilder.div(),
            this.#nodeHolderBottomToolbar = DomBuilder.div(),
            this.#nodeHolderAdditionalTools = DomBuilder.div(),
        ]);
        rootNode.append(this.#node);

        // prepare options
        this.#nodeLabelCounter = DomBuilder.Bootstrap.initTooltip(
            DomBuilder.element('ul', null, [
                DomBuilder.element('li', null, 'FPS = rendered Frames Per Second'),
                DomBuilder.element('li', null, 'CPS = simulation Cycles Per Second')
            ]),
            DomBuilder.span('', { class: 'sand-game-counter' }));
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
    }

    initialize() {
        this.#nodeCanvas = this.#createCanvas();
        this.#nodeHolderCanvas.append(this.#nodeCanvas);

        // scale up
        this.#nodeCanvas.width(this.#currentWidthPoints / this.#currentScale);
        this.#nodeCanvas.height(this.#currentHeightPoints / this.#currentScale);

        // set size
        this.#nodeLabelSize.text(`${this.#currentWidthPoints} x ${this.#currentHeightPoints}, scale=${this.#currentScale}`);

        // init game
        let domCanvasNode = this.#nodeCanvas[0];
        let context = domCanvasNode.getContext('2d');
        // TODO: domCanvasNode.style.imageRendering = "pixelated";

        let defaultElement = Brushes.AIR.apply(0, 0);
        this.#sandGame = new SandGame(context, this.#currentWidthPoints, this.#currentHeightPoints, defaultElement);
        this.#sandGame.setFallThroughEnabled(this.#fallThroughEnabled);
        this.#sandGame.addOnRendered(() => {
            this.#nodeLabelCounter.text(this.#sandGame.getFramesPerSecond() + ' FPS, '
                    + this.#sandGame.getCyclesPerSecond() + ' CPS');
        });

        // mouse handling
        this.#nodeCanvas.bind('contextmenu', e => false);
        this.#initMouseHandling(domCanvasNode, this.#sandGame);

        // start rendering
        this.#sandGame.startRendering();

        this.#nodeLinkStart.show();  // processing can be started now
    }

    #createCanvas() {
        return DomBuilder.element('canvas', {
            class: 'sand-game-canvas',
            width: this.#currentWidthPoints + 'px',
            height: this.#currentHeightPoints + 'px'
        });
    }

    #initMouseHandling(domNode, sandGame) {
        let getActualMousePosition = (e) => {
            const rect = domNode.getBoundingClientRect();
            const x = Math.max(0, Math.trunc((e.clientX - rect.left) * this.#currentScale));
            const y = Math.max(0, Math.trunc((e.clientY - rect.top) * this.#currentScale));
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

    #changeCanvasSize(width, height, scale) {
        if (typeof width !== 'number' || !(width > 0 && width < 2048)) {
            throw 'Incorrect width';
        }
        if (typeof height !== 'number' || !(height > 0 && height < 2048)) {
            throw 'Incorrect height';
        }
        if (typeof scale !== 'number' || !(scale > 0 && scale <= 1)) {
            throw 'Incorrect scale';
        }

        let oldSandGame = this.#sandGame;
        if (this.#sandGame !== null) {
            this.#sandGame.stopProcessing();
            this.#sandGame.stopRendering();
            this.#nodeLinkStop.hide();
            this.#nodeLinkStart.hide();
        }
        this.#nodeHolderCanvas.empty();

        this.#currentWidthPoints = width;
        this.#currentHeightPoints = height;
        this.#currentScale = scale;

        this.initialize();
        if (oldSandGame !== null) {
            oldSandGame.copyElementsTo(this.#sandGame);
        }

        this.start();
    }

    enableBrushes() {
        let toolbar = DomBuilder.div({ class: 'sand-game-brushes' });
        for (let d of this.#brushDeclarations) {
            toolbar.append(this.#createBrushButton(d.name, d.cssName, d.brush));
        }
        this.#nodeHolderTopToolbar.append(toolbar);
    }

    #createBrushButton(name, cssName, brush) {
        return DomBuilder.link(name, {
            class: 'badge badge-secondary ' + cssName
        }, () => this.#brush = brush)
    }

    enableModes() {
        let toolbar = DomBuilder.div({ class: 'sand-game-modes' });

        let fallThroughLabel = window.innerWidth > 400 ? 'Fall-through' : '\u2B73'
        toolbar.append(DomBuilder.link(fallThroughLabel, { class: 'badge badge-danger' }, () => {
            this.#fallThroughEnabled = !this.#fallThroughEnabled;
            this.#sandGame.setFallThroughEnabled(this.#fallThroughEnabled);
        }));
        this.#nodeHolderTopToolbar.append(toolbar);
    }

    enableOptions() {
        let changeCanvasSize = DomBuilder.link('[\u2B0C]', { class: 'change-canvas-size-button' }, e => {
            let formBuilder = new DomBuilder.BootstrapSimpleForm();
            formBuilder.addInput('Width', 'width', this.#currentWidthPoints);
            formBuilder.addInput('Height', 'height', this.#currentHeightPoints);
            formBuilder.addInput('Scale', 'scale', this.#currentScale);

            let dialog = new DomBuilder.BootstrapDialog();
            dialog.setHeaderContent('Change canvas size');
            dialog.setBodyContent(formBuilder.createNode());
            dialog.addSubmitButton('Submit', () => {
                let data = formBuilder.getData();
                let w = Number.parseInt(data['width']);
                let h = Number.parseInt(data['height']);
                let s = Number.parseFloat(data['scale']);
                this.#changeCanvasSize(w, h, s);
            });
            dialog.addCloseButton('Close');
            dialog.show(this.#node);
        });

        let options = DomBuilder.div({ class: 'sand-game-options' }, [
            DomBuilder.div({ class: 'sand-game-canvas-size-options' }, [
                this.#nodeLabelSize,
                changeCanvasSize
            ]),
            DomBuilder.div({ class: 'sand-game-performance-options' }, [
                this.#nodeLabelCounter,
                this.#nodeLinkStart,
                this.#nodeLinkStop
            ])
        ]);

        this.#nodeHolderBottomToolbar.append(options);
    }

    enableTemplateEditor() {
        let defaultBlueprint = '111\n...\n...\n...';

        let brushes = {};
        for (let d of this.#brushDeclarations) {
            brushes[d.code] = d.brush;
        }

        let formBuilder = new DomBuilder.BootstrapSimpleForm();

        // add editor
        let textArea = formBuilder.addTextArea('Template', 'blueprint', defaultBlueprint, 8);

        // build tooltip
        let info = DomBuilder.element('ul');
        for (let d of this.#brushDeclarations) {
            info.append(DomBuilder.element('li', null, d.name + ' = ' + d.code))
        }
        DomBuilder.Bootstrap.initTooltip(info, textArea);

        // add submit button
        formBuilder.addSubmitButton('Submit', data => {
            try {
                this.#sandGame.template().withBrushes(brushes).withBlueprint(data['blueprint']).paint();
            } catch (e) {
                console.log(e);

                let dialog = new DomBuilder.BootstrapDialog();
                dialog.setHeaderContent('Error');
                dialog.setBodyContent(DomBuilder.element('code', null, e));
                dialog.addCloseButton('Close');
                dialog.show(this.#node);
            }
        })

        this.#nodeHolderAdditionalTools.append(DomBuilder.Bootstrap.cardCollapsed('Template editor', formBuilder.createNode()));
    }

    drawExample() {
        if (this.#sandGame === null) {
            throw 'Illegal state: Sand Game is not initialized';
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
            throw 'Illegal state: Sand Game is not initialized';
        }

        this.#sandGame.startProcessing();
        this.#nodeLinkStop.show();
        this.#nodeLinkStart.hide();
    }
}
