
/**
 * Tools for working with the element head.
 *
 * The element head structure:
 * <pre>
 *     | type                        4b  | weight                      4b  |
 *     | behaviour                   4b  | special                     4b  |
 *     | flammable  2b  | flame heat 2b  | burnable   2b  | meltable   2b  |
 *     | temperature                                                   8b  |
 * </pre>
 *
 * @author Patrik Harag
 * @version 2023-02-19
 */
export class ElementHead {

    static FIELD_TYPE_SIZE = 4;  // bits
    static TYPE_STATIC = 0x0;
    static TYPE_FALLING = 0x1;
    static TYPE_SAND_1 = 0x2;
    static TYPE_SAND_2 = 0x3;
    static TYPE_FLUID_1 = 0x4;
    static TYPE_FLUID_2 = 0x5;

    static FIELD_WEIGHT_SIZE = 4;  // bits
    static WEIGHT_AIR = 0x0;
    static WEIGHT_WATER = 0x1;
    static WEIGHT_POWDER = 0x2;
    static WEIGHT_WALL = 0x3;

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
    static BEHAVIOUR_FIRE_SOURCE = 0x0A;
    static BEHAVIOUR_METEOR = 0x0B;

    static FIELD_SPECIAL_SIZE = 4;  // bits

    // how hard it is to ignite this element
    static FIELD_FLAMMABLE_TYPE_SIZE = 2;  // bits
    static FLAMMABLE_TYPE_NONE = 0x00;
    static FLAMMABLE_TYPE_SLOW = 0x01;
    static FLAMMABLE_TYPE_MEDIUM = 0x02;
    static FLAMMABLE_TYPE_FAST = 0x03;

    // how much heat this element produces while burning
    static FIELD_FLAME_HEAT_TYPE_SIZE = 2;  // bits
    static FLAME_HEAT_TYPE_NONE = 0x00;
    static FLAME_HEAT_TYPE_MEDIUM = 0x01;
    static FLAME_HEAT_TYPE_HIGH = 0x02;
    static FLAME_HEAT_TYPE_EXTREME = 0x03;

    // how hard it is to burn down this element
    static FIELD_BURNABLE_TYPE_SIZE = 2;  // bits
    static BURNABLE_TYPE_NEVER = 0x00;
    static BURNABLE_TYPE_SLOW = 0x01;
    static BURNABLE_TYPE_MEDIUM = 0x02;
    static BURNABLE_TYPE_FAST = 0x03;

    static FIELD_MELTABLE_TYPE_SIZE = 2;  // bits
    // TODO

    static FIELD_TEMPERATURE_SIZE = 8;  // bits


    static of(type = 0, weight = 0, behaviour = 0, special = 0,
            flammableType = 0, flameHeatType = 0, burnableType = 0, meltableType = 0,
            temperature = 0) {

        let value = temperature << 2;
        value = (value | meltableType) << 2;
        value = (value | burnableType) << 2;
        value = (value | flameHeatType) << 2;
        value = (value | flammableType) << 4;
        value = (value | special) << 4;
        value = (value | behaviour) << 4;
        value = (value | weight) << 4;
        value = value | type;
        return value;
    }

    // get methods

    static getType(elementHead) {
        return elementHead & 0x0000000F;
    }

    static getWeight(elementHead) {
        return (elementHead >> 4) & 0x0000000F;
    }

    static getBehaviour(elementHead) {
        return (elementHead >> 8) & 0x0000000F;
    }

    static getSpecial(elementHead) {
        return (elementHead >> 12) & 0x0000000F;
    }

    static getFlammableType(elementHead) {
        return (elementHead >> 16) & 0x00000003;
    }

    static getFlameHeatType(elementHead) {
        return (elementHead >> 18) & 0x00000003;
    }

    static getBurnableType(elementHead) {
        return (elementHead >> 20) & 0x00000003;
    }

    static getMeltableType(elementHead) {
        return (elementHead >> 22) & 0x00000003;
    }

    static getTemperature(elementHead) {
        return (elementHead >> 24) & 0x000000FF;
    }

    // set methods

    static setType(elementHead, type) {
        return (elementHead & 0xFFFFFFF0) | type;
    }

    static setWeight(elementHead, weight) {
        return (elementHead & 0xFFFFFF0F) | (weight << 4);
    }

    static setBehaviour(elementHead, behaviour) {
        return (elementHead & 0xFFFFF0FF) | (behaviour << 8);
    }

    static setSpecial(elementHead, special) {
        return (elementHead & 0xFFFF0FFF) | (special << 12);
    }

    static setTemperature(elementHead, temperature) {
        return (elementHead & 0x00FFFFFF) | (temperature << 24);
    }
}