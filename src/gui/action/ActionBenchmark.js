// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import Action from "./Action";
import DomBuilder from "../DomBuilder";
import FileSaver from 'file-saver';

// Warning: dev tools only

const Scenes = window.SandGameJS.Scenes;

/**
 *
 * @author Patrik Harag
 * @version 2024-05-25
 */
export default class ActionBenchmark extends Action {

    performAction(controller) {
        let benchmarkProvider = new BenchmarkProvider(controller, results => {
            let dialog = DomBuilder.bootstrapDialogBuilder();
            dialog.setHeaderContent('Benchmark results');
            dialog.setBodyContent([
                DomBuilder.par(null, 'IPS AVG: ' + results.ipsAvg.toFixed(2)),
                DomBuilder.par(null, 'IPS MIN: ' + results.ipsMin)
            ]);
            dialog.addCloseButton('Close');
            dialog.addButton(
                DomBuilder.button('Download results', { type: 'button', class: 'btn btn-primary' }, e => {
                    const data = JSON.stringify(results, null, '  ');
                    const blob = new Blob([data], { type: 'application/json;charset=utf-8' });
                    const date = this.#formatDate(new Date());
                    FileSaver.saveAs(blob, `${date}.benchmark.json`);
                })
            );
            dialog.show(controller.getDialogAnchor());
        });
        benchmarkProvider.start();
    }

    #formatDate(date) {
        let dd = String(date.getDate()).padStart(2, '0');
        let MM = String(date.getMonth() + 1).padStart(2, '0');  // January is 0!
        let yyyy = date.getFullYear();

        let hh = String(date.getHours()).padStart(2, '0');
        let mm = String(date.getMinutes()).padStart(2, '0');

        return `${yyyy}-${MM}-${dd}_${hh}-${mm}`;
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2023-04-29
 */
class BenchmarkProvider {

    static WAITING_GAP = 300;

    /** @type Controller */
    #controller;

    /** @type function */
    #onFinish;

    /**
     *
     * @param controller {Controller}
     * @param onFinish {function({ipsAvg,ipsMin,benchmarks:{name,ipsAvg,ipsMin}[]})}
     */
    constructor(controller, onFinish) {
        this.#controller = controller;
        this.#onFinish = onFinish;
    }

    start() {
        let scene = Scenes.custom('Benchmark', (s) => this.#benchmarkScene(s));
        this.#controller.openScene(scene);
        this.#controller.start();
    }

    #benchmarkScene(sandGame) {
        const benchmarkResults = [];
        const benchmarkQueue = [...BenchmarkProvider.BENCHMARKS];
        let i = 0;
        let waiting = BenchmarkProvider.WAITING_GAP;
        let ipsSum = 0;
        let ipsMin = Number.MAX_SAFE_INTEGER;
        sandGame.addOnProcessed(() => {
            if (waiting > 0) {
                waiting--;
                return;
            }
            if (benchmarkQueue.length === 0) {
                return;
            }

            const benchmark = benchmarkQueue[0];
            if (i === 0) {
                console.log('Running benchmark: ' + benchmark.name);
            }
            benchmark.nextIteration(sandGame, i);
            i++;
            const ips = sandGame.getIterationsPerSecond();
            ipsSum = ipsSum + ips;
            ipsMin = Math.min(ipsMin, ips);

            if (benchmark.iterations === i) {
                const ipsAvg = ipsSum / benchmark.iterations;
                benchmarkResults.push({
                    name: benchmark.name,
                    ipsAvg: ipsAvg,
                    ipsMin: ipsMin
                });

                benchmarkQueue.shift();
                i = 0;
                ipsSum = 0;
                ipsMin = Number.MAX_SAFE_INTEGER;
                waiting = BenchmarkProvider.WAITING_GAP;

                sandGame.graphics().fill(sandGame.getBrushCollection().byCodeName('air'));

                if (benchmarkQueue.length === 0) {
                    this.#onFinish(this.#finalizeResults(sandGame, benchmarkResults));
                }
            }
        });
    }

    #finalizeResults(sandGame, benchmarkResults) {
        const ipsSum = benchmarkResults.map(r => r.ipsAvg).reduce((a, b) => a + b, 0);
        const ipsAvg = ipsSum / benchmarkResults.length;
        const ipsMin = benchmarkResults.map(r => r.ipsMin).reduce((a, b) => Math.min(a, b), Number.MAX_SAFE_INTEGER);
        return {
            version: 1,
            date: new Date().toString(),
            ipsAvg: ipsAvg,
            ipsMin: ipsMin,
            benchmarks: benchmarkResults,
            scene: {
                width: sandGame.getWidth(),
                height: sandGame.getHeight()
            }
        }
    }


    static #createBenchmark(name, iterations, nextIteration) {
        if (iterations <= 0) {
            throw 'Number of iterations must be a positive number';
        }
        return {
            name: name,
            iterations: iterations,
            nextIteration: nextIteration
        };
    }

    static BENCHMARKS = [
        BenchmarkProvider.#createBenchmark('sand-fall-q', 500, function (sandGame, j) {
            const sand = sandGame.getBrushCollection().byCodeName('sand');
            sandGame.graphics().drawRectangle(0, 0, -1, 1, sand, true);
        }),
        BenchmarkProvider.#createBenchmark('sand-fall-s', 2000, function (sandGame, j) {
            if (j % 10 === 0) {
                const sand = sandGame.getBrushCollection().byCodeName('sand');
                sandGame.graphics().drawRectangle(0, 0, -1, 1, sand, true);
            }
        }),
        BenchmarkProvider.#createBenchmark('sand-fill', 1000, function (sandGame, j) {
            if (j === 0) {
                const sand = sandGame.getBrushCollection().byCodeName('sand');
                sandGame.graphics().drawRectangle(0, 0, -1, -1, sand, true);
            }
        }),
        BenchmarkProvider.#createBenchmark('soil-fall-q', 500, function (sandGame, j) {
            const soil = sandGame.getBrushCollection().byCodeName('soil');
            sandGame.graphics().drawRectangle(0, 0, -1, 1, soil, true);
        }),
        BenchmarkProvider.#createBenchmark('soil-fall-s', 2000, function (sandGame, j) {
            if (j % 10 === 0) {
                const soil = sandGame.getBrushCollection().byCodeName('soil');
                sandGame.graphics().drawRectangle(0, 0, -1, 1, soil, true);
            }
        }),
        BenchmarkProvider.#createBenchmark('soil-fill', 1000, function (sandGame, j) {
            if (j === 0) {
                const soil = sandGame.getBrushCollection().byCodeName('soil');
                sandGame.graphics().drawRectangle(0, 0, -1, -1, soil, true);
            }
        }),
        BenchmarkProvider.#createBenchmark('water-fall-q', 500, function (sandGame, j) {
            const water = sandGame.getBrushCollection().byCodeName('water');
            sandGame.graphics().drawRectangle(0, 0, -1, 1, water, true);
        }),
        BenchmarkProvider.#createBenchmark('water-fall-s', 2000, function (sandGame, j) {
            if (j % 10 === 0) {
                const water = sandGame.getBrushCollection().byCodeName('water');
                sandGame.graphics().drawRectangle(0, 0, -1, 1, water, true);
            }
        }),
        BenchmarkProvider.#createBenchmark('water-fill', 1000, function (sandGame, j) {
            if (j === 0) {
                const water = sandGame.getBrushCollection().byCodeName('water');
                sandGame.graphics().drawRectangle(0, 0, -1, -1, water, true);
            }
        }),
        BenchmarkProvider.#createBenchmark('sand-into-water', 1000, function (sandGame, j) {
            if (j === 0) {
                const sand = sandGame.getBrushCollection().byCodeName('sand');
                const water = sandGame.getBrushCollection().byCodeName('water');
                sandGame.graphics().drawRectangle(0, 0, -1, 31, sand, true);
                sandGame.graphics().drawRectangle(0, 60, -1, -1, water, true);
            }
        }),
        BenchmarkProvider.#createBenchmark('soil-into-water', 1000, function (sandGame, j) {
            if (j === 0) {
                const soil = sandGame.getBrushCollection().byCodeName('soil');
                const water = sandGame.getBrushCollection().byCodeName('water');
                sandGame.graphics().drawRectangle(0, 0, -1, 31, soil, true);
                sandGame.graphics().drawRectangle(0, 60, -1, -1, water, true);
            }
        }),
    ];
}
