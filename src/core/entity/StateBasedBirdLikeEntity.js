// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import ElementHead from "../ElementHead";
import EntityUtils from "./EntityUtils";
import StateBasedAbstractEntity from "./StateBasedAbstractEntity";

/**
 *
 * @author Patrik Harag
 * @version 2024-06-23
 */
export default class StateBasedBirdLikeEntity extends StateBasedAbstractEntity {

    static #MAX_AVG_TEMPERATURE = 150;

    static #MAX_STUCK_COUNT = 15;

    constructor(type, serialized, stateDefinition, brush, gameState) {
        super(type, serialized, stateDefinition, brush, gameState);
    }

    _checkIsSpace(elementHead) {
        if (ElementHead.getTypeClass(elementHead) > ElementHead.TYPE_GAS) {
            return false;
        }
        return true;
    }

    performAfterProcessing() {
        this._iteration++;

        let isActive = (this._state !== -1);
        let isFalling = false;

        if (isActive) {
            const [retIsActive, retIsFalling] = this.#doCheckState();
            isActive = retIsActive;
            isFalling = retIsFalling;
        }

        if (isActive) {
            if (isFalling || this._stuck > 0) {
                const xChange = this._random.nextInt(3) - 1;
                const yChange = 1;
                this._moveForced(xChange, yChange);
            } else if (this._iteration % 11 === 0) {
                if (this._waypoint !== null) {
                    if (this._waypoint.stuck === 10) {
                        this._waypoint.stuck = -20;  // try random walk now...
                    }
                    if (this._waypoint.stuck >= 0) {
                        this._moveInWaypointDirection(3);
                    } else {
                        this._waypoint.stuck++;
                        this._moveRandom(3);
                    }
                } else {
                    this._moveRandom(3);
                }
            }
        }

        if (isActive && this._stateDefinition.getStatesCount() > 1 && this._iteration % 10 === 0) {
            this._incrementState();
        }

        return isActive;
    }

    #doCheckState() {
        const x = this._x;
        const y = this._y;
        const points = this._stateDefinition.getStates()[this._state];

        let heavyElementsAbove = false;
        let totalTemperature = 0;
        for (const [dx, dy] of points) {
            const ex = x + dx;
            const ey = y + dy;

            const elementHead = this._elementArea.getElementHeadOrNull(ex, ey);
            if (elementHead === null) {
                // lost body part / out of bounds
                return [this._kill(), false];
            }

            if (ElementHead.getBehaviour(elementHead) !== ElementHead.BEHAVIOUR_ENTITY) {
                // lost body part
                return [this._kill(), false];
            }

            totalTemperature += ElementHead.getTemperature(elementHead);

            // update
            this._elementArea.setElementHead(ex, ey, ElementHead.setSpecial(elementHead, 0));

            // check element above
            if (!heavyElementsAbove) {
                heavyElementsAbove = EntityUtils.isElementFallingHeavy(this._elementArea.getElementHeadOrNull(ex, ey - 1));
            }
        }

        if (totalTemperature / points.length > StateBasedBirdLikeEntity.#MAX_AVG_TEMPERATURE) {
            // killed by temperature
            return [this._kill(), false];
        }

        if (this._stuck > StateBasedBirdLikeEntity.#MAX_STUCK_COUNT) {
            // stuck to death
            return [this._kill(), false];
        }

        return [true, heavyElementsAbove];
    }
}