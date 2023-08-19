import { Brushes } from "../core/Brushes";
import { Brush } from "../core/Brush";
import { BenchmarkProvider } from "./BenchmarkProvider";
import { DomBuilder } from "./DomBuilder";
import FileSaver from 'file-saver';

/**
 *
 * @author Patrik Harag
 * @version 2023-08-19
 */
export class ActionsTest {

    static TREE_SPAWN_TEST = function (controller) {
        let sandGame = controller.getSandGame();
        if (sandGame === null) {
            return;
        }

        sandGame.graphics().fill(Brushes.AIR);
        sandGame.graphics().drawRectangle(0, -10, -1, -1, Brushes.SOIL, true);
        sandGame.graphics().drawRectangle(0, -11, -1, -11, Brushes.GRASS, true);

        let c = Math.trunc(sandGame.getHeight() / 2);
        sandGame.graphics().drawRectangle(0, c, -1, c, Brushes.WALL, true);
        sandGame.graphics().drawRectangle(0, c-10, -1, c-1, Brushes.SOIL, true);
        sandGame.graphics().drawRectangle(0, c-11, -1, c-11, Brushes.GRASS, true);
    }

    static TREE_GROW_TEST = function (controller) {
        let sandGame = controller.getSandGame();
        if (sandGame === null) {
            return;
        }

        let treeBrush = Brush.withIntensity(Brushes.TREE, 0.05);

        sandGame.graphics().fill(Brushes.AIR);
        sandGame.graphics().drawRectangle(0, -10, -1, -1, Brushes.SOIL, true);
        sandGame.graphics().drawRectangle(0, -11, -1, -11, treeBrush, true);

        let c = Math.trunc(sandGame.getHeight() / 2);
        sandGame.graphics().drawRectangle(0, c, -1, c, Brushes.WALL, true);
        sandGame.graphics().drawRectangle(0, c-10, -1, c-1, Brushes.SOIL, true);
        sandGame.graphics().drawRectangle(0, c-11, -1, c-11, treeBrush, true);
    }

    static BENCHMARK = function (controller) {
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
                    FileSaver.saveAs(blob, 'benchmark.json');
                })
            );
            dialog.show(controller.getDialogAnchor());
        });
        benchmarkProvider.start();
    }
}
