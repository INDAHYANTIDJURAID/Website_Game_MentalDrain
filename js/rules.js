/**
 * Base class for all rules.
 */
export class Rule {
    constructor(description, id) {
        this.description = description;
        this.id = id;
    }

    /**
     * Checks if the given object satisfies the rule.
     * @param {GameObject} gameObject 
     * @returns {boolean}
     */
    check(gameObject) {
        throw new Error("Method 'check' must be implemented.");
    }
}

/**
 * Checks a specific property of the object (color, shape, value).
 */
export class PropertyRule extends Rule {
    constructor(property, targetValue, description, id) {
        super(description, id);
        this.property = property;
        this.targetValue = targetValue;
    }

    check(gameObject) {
        return gameObject[this.property] === this.targetValue;
    }
}

/**
 * Checks a numerical condition (e.g., Even, Odd, Greater Than).
 */
export class NumberRule extends Rule {
    constructor(conditionType, value, description, id) {
        super(description, id);
        this.conditionType = conditionType; // 'even', 'odd', 'gt', 'lt'
        this.value = value;
    }

    check(gameObject) {
        const num = gameObject.number;
        switch (this.conditionType) {
            case 'even': return num % 2 === 0;
            case 'odd': return num % 2 !== 0;
            case 'gt': return num > this.value;
            case 'lt': return num < this.value;
            case 'eq': return num === this.value;
            default: return false;
        }
    }
}

/**
 * Negation Decorator. Inverts the result of a rule.
 */
export class NegationRule extends Rule {
    constructor(innerRule) {
        super(`BUKAN ${innerRule.description}`, `NOT_${innerRule.id}`);
        this.innerRule = innerRule;
    }

    check(gameObject) {
        return !this.innerRule.check(gameObject);
    }
}
