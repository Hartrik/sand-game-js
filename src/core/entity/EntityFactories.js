// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import ElementHead from "../ElementHead";
import ElementTail from "../ElementTail";
import Element from "../Element";
import Brushes from "../brush/Brushes";
import StateDefinition from "./StateDefinition";
import StateBasedBirdLikeEntity from "./StateBasedBirdLikeEntity";
import StateBasedFishLikeEntity from "./StateBasedFishLikeEntity";

/**
 *
 * @author Patrik Harag
 * @version 2024-06-23
 */
export default class EntityFactories {

    // bird

    static #BIRD_STATES = StateDefinition.createCyclic([
        [[0, 0], [1, -1], [-1, -1], [2, -1], [-2, -1], [3, -1], [-3, -1]],
        [[0, 0], [1, -1], [-1, -1], [2, -1], [-2, -1], [3, -2], [-3, -2]],
        [[0, 0], [1, -1], [-1, -1], [2, -2], [-2, -2], [3, -2], [-3, -2]],
        [[0, 0], [1, -1], [-1, -1], [2, -2], [-2, -2], [3, -1], [-3, -1]],
        [[0, 0], [1, -1], [-1, -1], [2, -1], [-2, -1], [3, -1], [-3, -1]],
        [[0, 0], [1, -1], [-1, -1], [2,  0], [-2,  0], [3,  0], [-3,  0]],
        [[0, 0], [1, -1], [-1, -1], [2,  0], [-2,  0], [3,  1], [-3,  1]],
        [[0, 0], [1, -1], [-1, -1], [2,  0], [-2,  0], [3,  0], [-3,  0]],
    ]);

    static #BIRD_BRUSH = Brushes.custom((x, y) => {
        // motion blur - ends of wings only
        const blurType = Math.abs(x) < 2 ? ElementTail.BLUR_TYPE_NONE : ElementTail.BLUR_TYPE_1;
        return new Element(
            ElementHead.of(
                ElementHead.type8(ElementHead.TYPE_STATIC),
                ElementHead.behaviour8(ElementHead.BEHAVIOUR_ENTITY, 0),
                ElementHead.modifiers8(ElementHead.HMI_WOOD_LIKE)),
            ElementTail.of(0, 0, 0, blurType))
    });

    static birdFactory(serialized, gameState) {
        return new StateBasedBirdLikeEntity('bird', serialized, EntityFactories.#BIRD_STATES, EntityFactories.#BIRD_BRUSH, gameState);
    }

    // butterfly

    static #BUTTERFLY_STATES = StateDefinition.createCyclic([
        [[0, 0], [1, -1], [-1, -1]],
        [[0, 0], [1, -1], [-1, -1]],
        [[0, 0], [1,  0], [-1,  0]],
        [[0, 0], [1,  1], [-1,  1]],
        [[0, 0], [1,  1], [-1,  1]],
    ]);

    static #BUTTERFLY_BRUSH = Brushes.custom((x, y) => {
        // motion blur - ends of wings only
        const blurType = Math.abs(x) === 0 ? ElementTail.BLUR_TYPE_NONE : ElementTail.BLUR_TYPE_1;
        const r = Math.abs(x) === 0 ? 0 : 200;
        return new Element(
            ElementHead.of(
                ElementHead.type8(ElementHead.TYPE_STATIC),
                ElementHead.behaviour8(ElementHead.BEHAVIOUR_ENTITY, 0),
                ElementHead.modifiers8(ElementHead.HMI_CONDUCTIVE_1)),
            ElementTail.of(r, 0, 0, blurType));
    });

    static butterflyFactory(serialized, gameState) {
        return new StateBasedBirdLikeEntity('butterfly', serialized, EntityFactories.#BUTTERFLY_STATES, EntityFactories.#BUTTERFLY_BRUSH, gameState);
    }

    // fish

    static #FISH_STATES = StateDefinition.createCyclic([
        [[0, 0], [1, 0]],
    ]);

    static #FISH_BRUSH = Brushes.custom((x, y) => {
        return new Element(
            ElementHead.of(
                ElementHead.type8(ElementHead.TYPE_STATIC),
                ElementHead.behaviour8(ElementHead.BEHAVIOUR_ENTITY, 0),
                ElementHead.modifiers8(ElementHead.HMI_CONDUCTIVE_1)),
            ElementTail.of(0, 0, 0, ElementTail.BLUR_TYPE_NONE))
    });

    static fishFactory(serialized, gameState) {
        return new StateBasedFishLikeEntity('fish', serialized, EntityFactories.#FISH_STATES, EntityFactories.#FISH_BRUSH, gameState);
    }

    // ---

    static findFactoryByEntityType(type) {
        switch (type) {
            case 'bird':
                return EntityFactories.birdFactory;
            case 'butterfly':
                return EntityFactories.butterflyFactory;
            case 'fish':
                return EntityFactories.fishFactory;
        }
        return null;
    }
}