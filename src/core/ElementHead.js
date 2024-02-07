
/**
 * Tools for working with the element head.
 *
 * The element head structure: <code>0x[type][beh.][flags][temp.]</code> (32b)
 * <pre>
 *     | type class   3b  | type modifiers                 5b  |
 *     | behaviour             4b  | special               4b  |
 *     | heat modifiers index                              8b  |
 *     | temperature                                       8b  |
 * </pre>
 *
 * Type modifier for powder-like types: (5b)
 * <pre>
 *     | sliding  1b |  direction  1b  | momentum  3b  |
 * </pre>
 *
 * @author Patrik Harag
 * @version 2024-02-07
 */
export class ElementHead {

    static FIELD_TYPE_CLASS_SIZE = 3;  // bits
    static TYPE_AIR = 0x0;
    static TYPE_EFFECT = 0x1;
    static TYPE_GAS = 0x2;
    static TYPE_POWDER_FLOATING = 0x3;   // floating, not wet, can turn into wet
    static TYPE_FLUID = 0x4;
    static TYPE_POWDER = 0x5;  // not wet, can turn into wet
    static TYPE_POWDER_WET = 0x6;  // wet
    static TYPE_STATIC = 0x7;

    static FIELD_TYPE_MODIFIERS_SIZE = 5;  // bits

    static FIELD_BEHAVIOUR_SIZE = 4;  // bits
    static BEHAVIOUR_NONE = 0x0;
    static BEHAVIOUR_SOIL = 0x1;
    static BEHAVIOUR_GRASS = 0x2;
    static BEHAVIOUR_FISH = 0x3;
    static BEHAVIOUR_FISH_BODY = 0x4;
    static BEHAVIOUR_TREE = 0x5;
    static BEHAVIOUR_TREE_ROOT = 0x6;
    static BEHAVIOUR_TREE_TRUNK = 0x7;
    static BEHAVIOUR_TREE_LEAF = 0x8;
    static BEHAVIOUR_FIRE = 0x9;
    static BEHAVIOUR_FIRE_SOURCE = 0xA;
    static BEHAVIOUR_METEOR = 0xB;
    static BEHAVIOUR_WATER = 0xC;

    static FIELD_SPECIAL_SIZE = 4;  // bits

    static FIELD_HMI_SIZE = 8;  // bits

    static FIELD_TEMPERATURE_SIZE = 8;  // bits


    static of(type8, behaviour8 = 0, modifiers8 = 0, temperature = 0) {
        let value = temperature << 8;
        value = (value | modifiers8) << 8;
        value = (value | behaviour8) << 8;
        value = value | type8;
        return value;
    }

    static type8(typeClass, typeModifiers = 0) {
        return typeClass | (typeModifiers << 3);
    }

    static type8Powder(typeClass, momentum = 0, sliding = 0, direction = 0) {
        let value = momentum << 1;
        value = (value | direction) << 1;
        value = (value | sliding) << 3;
        value = value | typeClass;
        return value;
    }

    // TODO TYPE_FLUID: density, step size, ? viscosity, ? pressure
    static type8Fluid(typeClass) {
        return typeClass;
    }

    static behaviour8(behaviour = 0, special = 0) {
        return behaviour | (special << 4);
    }

    static modifiers8(heatModIndex = 0) {
        return heatModIndex;
    }

    // get methods

    static getType(elementHead) {
        return elementHead & 0x000000FF;
    }

    static getTypeClass(elementHead) {
        return elementHead & 0x00000007;
    }

    static getTypeModifierPowderSliding(elementHead) {
        return (elementHead >> 3) & 0x00000001;
    }

    static getTypeModifierPowderDirection(elementHead) {
        return (elementHead >> 4) & 0x00000001;
    }

    static getTypeModifierPowderMomentum(elementHead) {
        return (elementHead >> 5) & 0x00000007;
    }

    static getBehaviour(elementHead) {
        return (elementHead >> 8) & 0x0000000F;
    }

    static getSpecial(elementHead) {
        return (elementHead >> 12) & 0x0000000F;
    }

    static getHeatModIndex(elementHead) {
        return (elementHead >> 16) & 0x000000FF;
    }

    static getTemperature(elementHead) {
        return (elementHead >> 24) & 0x000000FF;
    }

    // set methods

    static setType(elementHead, type) {
        return (elementHead & 0xFFFFFF00) | type;
    }

    static setTypeClass(elementHead, type) {
        return (elementHead & 0xFFFFFFF8) | type;
    }

    static setTypeModifierPowderSliding(elementHead, val) {
        return (elementHead & 0xFFFFFFF7) | (val << 3);
    }

    static setTypeModifierPowderDirection(elementHead, val) {
        return (elementHead & 0xFFFFFFEF) | (val << 4);
    }

    static setTypeModifierPowderMomentum(elementHead, val) {
        return (elementHead & 0xFFFFFF1F) | (val << 5);
    }

    static setBehaviour(elementHead, behaviour) {
        return (elementHead & 0xFFFFF0FF) | (behaviour << 8);
    }

    static setSpecial(elementHead, special) {
        return (elementHead & 0xFFFF0FFF) | (special << 12);
    }

    static setHeatModIndex(elementHead, heatModIndex) {
        return (elementHead & 0xFF00FFFF) | (heatModIndex << 16);
    }

    static setTemperature(elementHead, temperature) {
        return (elementHead & 0x00FFFFFF) | (temperature << 24);
    }


    // --- HEAT MODIFIERS ---

    static #HEAT_MODS_COUNT = 16;
    static #HEAT_MODS = Array(ElementHead.#HEAT_MODS_COUNT);

    static #defHeatMods({i, conductiveIndex = 0.2, heatLossChanceTo10000 = 2500,
                            flammableChanceTo10000 = 0, selfIgnitionChanceTo10000 = 0,
                            flameHeat = 0, burnDownChanceTo10000 = 0,
                            meltingTemperature = 0xFF + 1, meltingHMI = 0,
                            hardeningTemperature = 0, hardeningHMI = 0}) {

        const array = Array(10);
        array[0] = conductiveIndex;
        array[1] = heatLossChanceTo10000;
        array[2] = flammableChanceTo10000;
        array[3] = selfIgnitionChanceTo10000;
        array[4] = flameHeat;
        array[5] = burnDownChanceTo10000;
        array[6] = meltingTemperature;
        array[7] = meltingHMI;
        array[8] = hardeningTemperature;
        array[9] = hardeningHMI;

        ElementHead.#HEAT_MODS[i] = array;
        return i;
    }

    static HMI_DEFAULT = ElementHead.#defHeatMods({
        i: 0
        // default values
    });

    static HMI_CONDUCTIVE_1 = ElementHead.#defHeatMods({
        i: 1,
        conductiveIndex: 0.25,
        heatLossChanceTo10000: 500
    });

    static HMI_CONDUCTIVE_2 = ElementHead.#defHeatMods({
        i: 2,
        conductiveIndex: 0.3,
        heatLossChanceTo10000: 20
    });

    static HMI_CONDUCTIVE_3 = ElementHead.#defHeatMods({
        i: 3,
        conductiveIndex: 0.45,
        heatLossChanceTo10000: 10
    });

    static HMI_GRASS_LIKE = ElementHead.#defHeatMods({
        i: 4,
        flammableChanceTo10000: 4500,
        selfIgnitionChanceTo10000: 3,
        flameHeat: 165,
        burnDownChanceTo10000: 1000
    });

    static HMI_WOOD_LIKE = ElementHead.#defHeatMods({
        i: 5,
        flammableChanceTo10000: 100,
        selfIgnitionChanceTo10000: 2,
        flameHeat: 165,
        burnDownChanceTo10000: 2
    });

    static HMI_LEAF_LIKE = ElementHead.#defHeatMods({
        i: 6,
        flammableChanceTo10000: 4500,
        selfIgnitionChanceTo10000: 3,
        flameHeat: 165,
        burnDownChanceTo10000: 100
    });

    static HMI_METAL = ElementHead.#defHeatMods({
        i: 7,
        conductiveIndex: 0.45,
        heatLossChanceTo10000: 10,
        meltingTemperature: 200,
        meltingHMI: 8
    });

    static HMI_MOLTEN = ElementHead.#defHeatMods({
        i: 8,
        conductiveIndex: 0.45,
        heatLossChanceTo10000: 10,
        hardeningTemperature: 150,
        hardeningHMI: 7
    });

    static HMI_COAL = ElementHead.#defHeatMods({
        i: 9,
        conductiveIndex: 0.3,
        heatLossChanceTo10000: 20,
        flammableChanceTo10000: 500,
        selfIgnitionChanceTo10000: 3,
        flameHeat: 190,
        burnDownChanceTo10000: 50
    });

    static HMI_THERMITE = ElementHead.#defHeatMods({
        i: 10,
        conductiveIndex: 0.45,
        heatLossChanceTo10000: 10,
        flammableChanceTo10000: 8000,
        selfIgnitionChanceTo10000: 500,
        flameHeat: 250,
        burnDownChanceTo10000: 1000
    });

    static {
        // fill missing definitions - bounds checking is not needed then...
        for (let i = 0; i < ElementHead.#HEAT_MODS_COUNT; i++) {
            if (ElementHead.#HEAT_MODS[i] === undefined) {
                ElementHead.#defHeatMods(i);
            }
        }
    }

    // ---

    static hmiToConductiveIndex(heatModIndex) {
        return ElementHead.#HEAT_MODS[heatModIndex & 0xF][0];
    }

    static hmiToHeatLossChanceTo10000(heatModIndex) {
        return ElementHead.#HEAT_MODS[heatModIndex & 0xF][1];
    }

    // how hard it is to ignite this element
    static hmiToFlammableChanceTo10000(heatModIndex) {
        return ElementHead.#HEAT_MODS[heatModIndex & 0xF][2];
    }

    // how hard it is to ignite this element
    static hmiToSelfIgnitionChanceTo10000(heatModIndex) {
        return ElementHead.#HEAT_MODS[heatModIndex & 0xF][3];
    }

    // how much heat this element produces while burning
    static hmiToFlameHeat(heatModIndex) {
        return ElementHead.#HEAT_MODS[heatModIndex & 0xF][4];
    }

    // how hard it is to burn down this element
    static hmiToBurnDownChanceTo10000(heatModIndex) {
        return ElementHead.#HEAT_MODS[heatModIndex & 0xF][5];
    }

    static hmiToMeltingTemperature(heatModIndex) {
        return ElementHead.#HEAT_MODS[heatModIndex & 0xF][6];
    }

    static hmiToMeltingHMI(heatModIndex) {
        return ElementHead.#HEAT_MODS[heatModIndex & 0xF][7];
    }

    static hmiToHardeningTemperature(heatModIndex) {
        return ElementHead.#HEAT_MODS[heatModIndex & 0xF][8];
    }

    static hmiToHardeningHMI(heatModIndex) {
        return ElementHead.#HEAT_MODS[heatModIndex & 0xF][9];
    }
}