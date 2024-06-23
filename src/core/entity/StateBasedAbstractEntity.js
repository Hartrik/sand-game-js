// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import ElementHead from "../ElementHead";
import Entity from "./Entity";
import PositionedElement from "../PositionedElement";

// TODO: support collisions/interleaving with other entities

/**
 *
 * @author Patrik Harag
 * @version 2024-05-05
 */
export default class StateBasedAbstractEntity extends Entity {

    /** @type ElementArea */
    _elementArea;
    /** @type DeterministicRandom */
    _random;
    /** @type ProcessorContext */
    _processorContext;

    /** @type StateDefinition */
    _stateDefinition;
    /** @type Brush */
    _brush;
    _areaBoundary;

    /** @type string */
    _type;
    _iteration = 0;
    _x = 0;
    _y = 0;
    _waypoint = null;
    _state = 0;
    _stuck = 0;

    constructor(type, serialized, stateDefinition, brush, gameState) {
        super();
        this._type = type;
        this._stateDefinition = stateDefinition;
        this._brush = brush;
        this._areaBoundary = 2 * (Math.abs(this._stateDefinition.getMinX() - this._stateDefinition.getMaxX()) + 1);

        this._elementArea = gameState.elementArea;
        this._random = gameState.random;
        this._processorContext = gameState.processorContext;

        if (serialized.iteration !== undefined) {
            this._iteration = serialized.iteration;
        } else {
            // set randomly; so state change will not be on the same time
            this._iteration = this._random.nextInt(this._stateDefinition.getStatesCount());
        }
        if (serialized.x !== undefined) {
            this._x = serialized.x;
        }
        if (serialized.y !== undefined) {
            this._y = serialized.y;
        }
        if (serialized.state !== undefined) {
            this._state = serialized.state;
        } else {
            // random state by default
            this._state = this._random.nextInt(this._stateDefinition.getStatesCount());
        }
        if (serialized.stuck !== undefined) {
            this._stuck = serialized.stuck;
        }
    }

    // abstract methods

    _checkIsSpace(elementHead) {
        throw 'Not implemented';
    }

    performBeforeProcessing() {
        return this._state !== -1;
    }

    performAfterProcessing() {
        return this._state !== -1;
    }

    // methods

    serialize() {
        return {
            entity: this._type,
            iteration: this._iteration,
            x: this._x,
            y: this._y,
            state: this._state,
            stuck: this._stuck,
        };
    }

    getType() {
        return this._type;
    }

    getX() {
        return this._x;
    }

    getY() {
        return this._y;
    }

    assignWaypoint(x, y) {
        this._waypoint = {
            x: x,
            y: y,
            stuck: 0
        }
    }

    unassignWaypoint() {
        this._waypoint = null;
    }

    isActive() {
        return this._state !== -1;
    }

    initialize() {
        this.paint(this._x, this._y, this._elementArea, this._random);
    }

    _incrementState() {
        const x = this._x;
        const y = this._y;

        const transitions = this._stateDefinition.getTransitions()[this._state];

        let allowed = true;
        for (const [[dx1, dy1], [dx2, dy2]] of transitions) {
            if (!this._elementArea.isValidPosition(x + dx1, y + dy1) || !this._checkIsSpaceAt(x + dx2, y + dy2)) {
                allowed = false;
                break;
            }
        }

        if (allowed) {
            for (const [[dx1, dy1], [dx2, dy2]] of transitions) {
                this._elementArea.swap(x + dx1, y + dy1, x + dx2, y + dy2);
            }

            this._stuck = 0;
            this._state++;
            if (this._state === this._stateDefinition.getStates().length) {
                this._state = 0;
            }
        } else {
            // stuck
            this._stuck++;
        }
    }

    _moveRandom(visionExtra) {
        const xChange = this._random.nextInt(3) - 1;
        const yChange = this._random.nextInt(3) - 1;

        return this._move(xChange, yChange, visionExtra);
    }

    _moveInWaypointDirection(visionExtra) {
        let dx = this._waypoint.x - this._x;
        let xChange = 0;
        if (dx > 0) {
            // move right
            xChange += 1;
        } else if (dx < 0) {
            // move left
            xChange -= 1;
        }

        let dy = this._waypoint.y - this._y;
        let yChange = 0;
        if (dy > 0) {
            // move up
            yChange += 1;
        } else if (dy < 0) {
            // move down
            yChange -= 1;
        }

        const moved = this._move(xChange, yChange, visionExtra);
        if (moved) {
            this._waypoint.stuck = 0;
        } else {
            this._waypoint.stuck++;
        }
    }

    _move(xChange, yChange, visionExtra) {
        const x = this._x;
        const y = this._y;

        const newPos = this.#countNewPosition(x, y, xChange, yChange, visionExtra);

        if (newPos !== null) {
            const [nx, ny] = newPos;

            this.#relocate(this._stateDefinition.getStates()[this._state], x, y, nx, ny);

            this._x = nx;
            this._y = ny;

            return true;
        }
        return false;
    }

    #countNewPosition(x, y, xChange, yChange, visionExtra) {
        // check boundaries

        if (x + xChange < this._areaBoundary && xChange < 0) {
            xChange = 0;
        }
        if (x + xChange > this._elementArea.getWidth() - this._areaBoundary && xChange > 0) {
            xChange = 0;
        }

        if (y + yChange < this._areaBoundary && yChange < 0) {
            yChange = 0;
        }
        if (y + yChange > this._elementArea.getHeight() - this._areaBoundary && yChange > 0) {
            yChange = 0;
        }

        // check further obstacles

        if (xChange === 0 && yChange === 0) {
            return null;
        }

        // test right | right
        if (xChange > 0 || xChange < 0) {
            for (let yy = this._stateDefinition.getMinY() - visionExtra; yy <= this._stateDefinition.getMaxY() + visionExtra; yy++) {
                if (!this._checkIsSpaceAt(x + (xChange * 5), y + yChange + yy)) {
                    xChange = 0;
                    break;
                }
            }
        }

        // test above | below
        if (yChange > 0 || yChange < 0) {
            for (let xx = this._stateDefinition.getMinX() - visionExtra; xx <= this._stateDefinition.getMaxX() + visionExtra; xx++) {
                if (!this._checkIsSpaceAt(x + xChange + xx, y + (yChange * 5))) {
                    yChange = 0;
                    break;
                }
            }
        }

        // check close obstacles

        if (xChange === 0 && yChange === 0) {
            return null;
        }

        const mask = this._stateDefinition.getMasks()[this._state];
        for (const [dx, dy] of this._stateDefinition.getStates()[this._state]) {
            if (mask.matches(xChange + dx, yChange + dy)) {
                // its own part
            } else if (!this._checkIsSpaceAt(x + xChange + dx, y + yChange + dy)) {
                return null;
            }
        }

        return [x + xChange, y + yChange];
    }

    _moveForced(xChange, yChange) {
        const x = this._x;
        const y = this._y;

        const newPos = this.#countNewForcedPosition(x, y, xChange, yChange);

        if (newPos !== null) {
            const [nx, ny] = newPos;

            this.#relocate(this._stateDefinition.getStates()[this._state], x, y, nx, ny);

            this._x = nx;
            this._y = ny;

            return true;
        }
        return false;
    }

    #countNewForcedPosition(x, y, xChange, yChange) {
        if (x + xChange < 0 && xChange < 0) {
            xChange = 0;
        }
        if (x + xChange > this._elementArea.getWidth() && xChange > 0) {
            xChange = 0;
        }

        if (y + yChange < 0 && yChange < 0) {
            yChange = 0;
        }
        if (y + yChange > this._elementArea.getHeight() && yChange > 0) {
            yChange = 0;
        }

        if (xChange === 0 && yChange === 0) {
            return null;  // cannot move
        }

        // check is space
        for (const [dx, dy] of this._stateDefinition.getStates()[this._state]) {
            const ex = x + dx + xChange;
            const ey = y + dy + yChange;

            const elementHead = this._elementArea.getElementHeadOrNull(ex, ey);
            if (elementHead === null) {
                return null;  // cannot move
            }
            if (ElementHead.getBehaviour(elementHead) !== ElementHead.BEHAVIOUR_ENTITY) {
                if (ElementHead.getTypeClass(elementHead) > ElementHead.TYPE_FLUID) {
                    return null;  // cannot move
                }
            }
        }

        return [x + xChange, y + yChange];
    }

    _checkIsSpaceAt(tx, ty) {
        const targetElementHead = this._elementArea.getElementHeadOrNull(tx, ty);
        if (targetElementHead === null) {
            return false;
        }
        return this._checkIsSpace(targetElementHead);
    }

    #relocate(state, x, y, nx, ny) {
        const sortedPoints = [...state];

        if (nx > x) {
            sortedPoints.sort((a, b) => b[0] - a[0]);
        } else if (nx < x) {
            sortedPoints.sort((a, b) => a[0] - b[0]);
        }
        if (ny > y) {
            sortedPoints.sort((a, b) => b[1] - a[1]);
        } else if (ny < y) {
            sortedPoints.sort((a, b) => a[1] - b[1]);
        }

        for (const [dx, dy] of sortedPoints) {
            this._elementArea.swap(x + dx, y + dy, nx + dx, ny + dy);
        }
    }

    _kill() {
        const x = this._x;
        const y = this._y;

        for (const [dx, dy] of this._stateDefinition.getStates()[this._state]) {
            const ex = x + dx;
            const ey = y + dy;

            const elementHead = this._elementArea.getElementHeadOrNull(ex, ey);
            if (elementHead === null) {
                continue;
            }

            if (ElementHead.getBehaviour(elementHead) !== ElementHead.BEHAVIOUR_ENTITY) {
                continue;
            }

            let newElementHead = elementHead;
            newElementHead = ElementHead.setType(newElementHead, ElementHead.type8Solid(ElementHead.TYPE_STATIC, 4, true));
            newElementHead = ElementHead.setBehaviour(newElementHead, ElementHead.BEHAVIOUR_NONE);
            newElementHead = ElementHead.setSpecial(newElementHead, 0);
            this._elementArea.setElementHead(ex, ey, newElementHead);
        }

        this._state = -1;
        return false;  // not active
    }

    paint(x, y, elementArea, random) {
        for (const [dx, dy] of this._stateDefinition.getStates()[this._state]) {
            const ex = x + dx;
            const ey = y + dy;

            if (!elementArea.isValidPosition(ex, ey)) {
                continue;  // out of bounds
            }

            const element = this._brush.apply(dx, dy, random);
            elementArea.setElement(ex, ey, element);
        }
    }

    extract(defaultElement, rx, ry) {
        const x = this._x;
        const y = this._y;

        const positionedElements = [];
        for (const [dx, dy] of this._stateDefinition.getStates()[this._state]) {
            const ex = x + dx;
            const ey = y + dy;

            const elementHead = this._elementArea.getElementHeadOrNull(ex, ey);
            if (elementHead === null) {
                continue;  // out of bounds
            }
            if (ElementHead.getBehaviour(elementHead) !== ElementHead.BEHAVIOUR_ENTITY) {
                continue;
            }

            const elementTail = this._elementArea.getElementTail(ex, ey);
            positionedElements.push(new PositionedElement(ex, ey, elementHead, elementTail));

            this._elementArea.setElement(ex, ey, defaultElement);
        }

        const serializedEntity = this.serialize();
        // relativize entity position
        serializedEntity.x -= rx;
        serializedEntity.y -= ry;

        this._state = -1;
        return [serializedEntity, positionedElements];
    }

    countMaxBoundaries() {
        const w = Math.abs(this._stateDefinition.getMinX() - this._stateDefinition.getMaxX()) + 1;
        const h = Math.abs(this._stateDefinition.getMinY() - this._stateDefinition.getMaxY()) + 1;
        return [w, h];
    }
}