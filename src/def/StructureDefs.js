// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import _ASSET_TREE_TRUNK_TEMPLATES from './assets/structures/tree-trunk-templates.json'
import _ASSET_TREE_CELL_TEMPLATES from './assets/structures/tree-leaf-cluster-templates.json'

/**
 *
 * @author Patrik Harag
 * @version 2023-12-18
 */
export default class StructureDefs {

    /** @type {[]} */
    static TREE_TRUNK_TEMPLATES = _ASSET_TREE_TRUNK_TEMPLATES;

    /** @type {[]} */
    static TREE_CLUSTER_TEMPLATES = _ASSET_TREE_CELL_TEMPLATES;
}
