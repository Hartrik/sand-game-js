import { ComponentContainer } from "./ComponentContainer";
import { ComponentButton } from "./ComponentButton";
import { ActionIOExport } from "./ActionIOExport";
import { ActionIOImport } from "./ActionIOImport";
import { ComponentButtonStartStop } from "./ComponentButtonStartStop";
import { ComponentStatusIndicator } from "./ComponentStatusIndicator";

/**
 *
 * @author Patrik Harag
 * @version 2023-08-19
 */
export class ComponentViewOptions extends ComponentContainer {

    constructor() {
        super('sand-game-options', [
            new ComponentButton('Import', ComponentButton.CLASS_LIGHT, new ActionIOImport()),
            new ComponentButton('Export', ComponentButton.CLASS_LIGHT, new ActionIOExport()),
            new ComponentButtonStartStop(ComponentButton.CLASS_LIGHT),
            new ComponentStatusIndicator(),
        ]);
    }
}
