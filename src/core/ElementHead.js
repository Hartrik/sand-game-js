
/**
 * Tools for working with the element head.
 *
 * The element head structure:
 * <pre>
 *     | type       4 bits  | weight     4 bits  |
 *     | behaviour  4 bits  | special    4 bits  |
 *     | temperature                     8 bits  |
 *     |                                         |
 * </pre>
 * Note: 4 bits = 16 values.
 *
 * @author Patrik Harag
 * @version 2023-02-18
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

    static FIELD_SPECIAL_SIZE = 4;  // bits

    static FIELD_TEMPERATURE_SIZE = 8;  // bits


    static of(type, weight, behaviour = 0, special = 0) {
        let value = 0;
        value = (value | special) << 4;
        value = (value | behaviour) << 4;
        value = (value | weight) << 4;
        value = value | type;
        return value;
    }

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

    static getTemperature(elementHead) {
        return (elementHead >> 16) & 0x000000FF;
    }

    static setType(elementHead, type) {
        return (elementHead & ~(0x0000000F)) | type;
    }

    static setSpecial(elementHead, special) {
        return (elementHead & ~(0x0000F000)) | (special << 12);
    }

    static setTemperature(elementHead, temperature) {
        return (elementHead & ~(0x00FF0000)) | (temperature << 16);
    }
}