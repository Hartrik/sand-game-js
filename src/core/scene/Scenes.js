// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import SceneImplHardcoded from "./SceneImplHardcoded";

/**
 *
 * @author Patrik Harag
 * @version 2024-03-24
 */
export default class Scenes {

    /**
     *
     * @param name {string}
     * @param func {function(SandGame):Promise<any>|any}
     */
    static custom(name, func) {
        return new SceneImplHardcoded({
            name: name,
            apply: func
        });
    }
}
