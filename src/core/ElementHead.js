
/**
 * Tools for working with the element head.
 *
 * The element head structure: <code>0x[type][beh.][flags][temp.]</code> (32b)
 * <pre>
 *     | type class         3b  | type modifiers                       5b  |
 *     | behaviour                   4b  | special                     4b  |
 *     | flammable  2b  | flame heat 2b  | burnable   2b  | t. cond.   2b  |
 *     | temperature                                                   8b  |
 * </pre>
 *
 * Type modifier for powder-like types: (5b)
 * <pre>
 *     | sliding  1b |  direction  1b  | momentum  3b  |
 * </pre>
 *
 * @author Patrik Harag
 * @version 2023-12-10
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

    static FIELD_T_CONDUCTIVITY_TYPE_SIZE = 2;  // bits
    // TODO

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

    static modifiers8(flammableType = 0, flameHeatType = 0, burnableType = 0, conductivityType = 0) {
        let value = conductivityType << 2;
        value = (value | burnableType) << 2;
        value = (value | flameHeatType) << 2;
        value = value | flammableType
        return value;
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

    static getFlammableType(elementHead) {
        return (elementHead >> 16) & 0x00000003;
    }

    static getFlameHeatType(elementHead) {
        return (elementHead >> 18) & 0x00000003;
    }

    static getBurnableType(elementHead) {
        return (elementHead >> 20) & 0x00000003;
    }

    static getConductivityType(elementHead) {
        return (elementHead >> 22) & 0x00000003;
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

    static setTemperature(elementHead, temperature) {
        return (elementHead & 0x00FFFFFF) | (temperature << 24);
    }
}