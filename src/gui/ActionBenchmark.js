import { Controller } from "./Controller";
import { Brushes } from "../def/Brushes";
import { SceneImplHardcoded } from "../core/SceneImplHardcoded";
import { Action } from "./Action";
import { DomBuilder } from "./DomBuilder";
import FileSaver from 'file-saver';

/**
 *
 * @author Patrik Harag
 * @version 2023-12-04
 */
export class ActionBenchmark extends Action {

    performAction(controller) {
        let benchmarkProvider = new BenchmarkProvider(controller, results => {
            let dialog = new DomBuilder.BootstrapDialog();
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
export class BenchmarkProvider {

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
        let scene = new SceneImplHardcoded({
            apply: (sandGame) => this.#benchmarkScene(sandGame)
        });

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

                sandGame.graphics().fill(Brushes.AIR);

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
            sandGame.graphics().drawRectangle(0, 0, -1, 0, Brushes.SAND, true);
        }),
        BenchmarkProvider.#createBenchmark('sand-fall-s', 2000, function (sandGame, j) {
            if (j % 10 === 0) {
                sandGame.graphics().drawRectangle(0, 0, -1, 0, Brushes.SAND, true);
            }
        }),
        BenchmarkProvider.#createBenchmark('sand-fill', 1000, function (sandGame, j) {
            if (j === 0) {
                sandGame.graphics().drawRectangle(0, 0, -1, -1, Brushes.SAND, true);
            }
        }),
        BenchmarkProvider.#createBenchmark('soil-fall-q', 500, function (sandGame, j) {
            sandGame.graphics().drawRectangle(0, 0, -1, 0, Brushes.SOIL, true);
        }),
        BenchmarkProvider.#createBenchmark('soil-fall-s', 2000, function (sandGame, j) {
            if (j % 10 === 0) {
                sandGame.graphics().drawRectangle(0, 0, -1, 0, Brushes.SOIL, true);
            }
        }),
        BenchmarkProvider.#createBenchmark('soil-fill', 1000, function (sandGame, j) {
            if (j === 0) {
                sandGame.graphics().drawRectangle(0, 0, -1, -1, Brushes.SOIL, true);
            }
        }),
        BenchmarkProvider.#createBenchmark('water-fall-q', 500, function (sandGame, j) {
            sandGame.graphics().drawRectangle(0, 0, -1, 0, Brushes.WATER, true);
        }),
        BenchmarkProvider.#createBenchmark('water-fall-s', 2000, function (sandGame, j) {
            if (j % 10 === 0) {
                sandGame.graphics().drawRectangle(0, 0, -1, 0, Brushes.WATER, true);
            }
        }),
        BenchmarkProvider.#createBenchmark('water-fill', 1000, function (sandGame, j) {
            if (j === 0) {
                sandGame.graphics().drawRectangle(0, 0, -1, -1, Brushes.WATER, true);
            }
        }),
        BenchmarkProvider.#createBenchmark('sand-into-water', 1000, function (sandGame, j) {
            if (j === 0) {
                sandGame.graphics().drawRectangle(0, 0, -1, 30, Brushes.SAND, true);
                sandGame.graphics().drawRectangle(0, 60, -1, -1, Brushes.WATER, true);
            }
        }),
        BenchmarkProvider.#createBenchmark('soil-into-water', 1000, function (sandGame, j) {
            if (j === 0) {
                sandGame.graphics().drawRectangle(0, 0, -1, 30, Brushes.SOIL, true);
                sandGame.graphics().drawRectangle(0, 60, -1, -1, Brushes.WATER, true);
            }
        }),
    ];
}
