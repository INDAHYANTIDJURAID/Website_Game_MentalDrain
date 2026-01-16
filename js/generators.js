import { PropertyRule, NumberRule, NegationRule } from './rules.js';
import { TextGenerator } from './text_generator.js';

export const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'cyan'];
export const SHAPES = ['circle', 'square'];
export const FULL_SHAPES = ['circle', 'square', 'triangle'];

export class GameObject {
    constructor(id, color, shape, number) {
        this.id = id;
        this.color = color;
        this.shape = shape;
        this.number = number;
    }
}

export class Generator {
    constructor() {
        this.activeRules = [];
        this.difficultyLevel = 1;
        this.textGen = new TextGenerator();
    }

    generateRule() {
        const types = ['color', 'shape', 'number'];
        const type = types[Math.floor(Math.random() * types.length)];

        let rule;

        switch (type) {
            case 'color':
                const color = COLORS[Math.floor(Math.random() * COLORS.length)];
                const colorMap = {
                    'red': 'MERAH', 'blue': 'BIRU', 'green': 'HIJAU',
                    'yellow': 'KUNING', 'purple': 'UNGU', 'cyan': 'CYAN'
                };
                const cDesc = this.textGen.getDescription('color', colorMap[color], this.difficultyLevel);
                rule = new PropertyRule('color', color, cDesc, `color_${color}`);
                rule.rawType = 'color';
                rule.rawValue = colorMap[color];
                break;
            case 'shape':
                const shape = FULL_SHAPES[Math.floor(Math.random() * FULL_SHAPES.length)];
                const shapeMap = {
                    'circle': 'LINGKARAN', 'square': 'KOTAK', 'triangle': 'SEGITIGA'
                };
                const sDesc = this.textGen.getDescription('shape', shapeMap[shape], this.difficultyLevel);
                rule = new PropertyRule('shape', shape, sDesc, `shape_${shape}`);
                rule.rawType = 'shape';
                rule.rawValue = shapeMap[shape];
                break;
            case 'number':
                const subType = ['even', 'odd', 'gt', 'lt'][Math.floor(Math.random() * 4)];
                if (subType === 'even') {
                    const desc = this.textGen.getDescription('number_even', null, this.difficultyLevel);
                    rule = new NumberRule('even', 0, desc, "num_even");
                    rule.rawType = 'number_even';
                }
                else if (subType === 'odd') {
                    const desc = this.textGen.getDescription('number_odd', null, this.difficultyLevel);
                    rule = new NumberRule('odd', 0, desc, "num_odd");
                    rule.rawType = 'number_odd';
                }
                else if (subType === 'gt') {
                    const val = Math.floor(Math.random() * 5) + 1;
                    const desc = this.textGen.getDescription('number_gt', val, this.difficultyLevel);
                    rule = new NumberRule('gt', val, desc, `num_gt_${val}`);
                    rule.rawType = 'number_gt';
                    rule.rawValue = val;
                }
                else if (subType === 'lt') {
                    const val = Math.floor(Math.random() * 5) + 5;
                    const desc = this.textGen.getDescription('number_lt', val, this.difficultyLevel);
                    rule = new NumberRule('lt', val, desc, `num_lt_${val}`);
                    rule.rawType = 'number_lt';
                    rule.rawValue = val;
                }
                break;
        }

        // Random chance to negate (Level 2+)
        if (this.difficultyLevel >= 2 && Math.random() > 0.6) {
            const originalDesc = rule.description;
            // Capture inner logic before wrapping
            const innerRawType = rule.rawType;
            const innerRawValue = rule.rawValue;

            rule = new NegationRule(rule);

            // Generate description
            rule.description = this.textGen.getDescription('negation', originalDesc, this.difficultyLevel);

            // Mark as negation for updates
            rule.rawType = 'negation';
            // We need to store inner structure to update inner text if we wanted deep update
            rule.innerWrapper = { rawType: innerRawType, rawValue: innerRawValue };
        }

        return rule;
    }

    refreshRuleDescription(rule) {
        if (rule instanceof NegationRule) {
            // Re-generate the wrapper text.
            // Ideally we should regenerate inner text too, but that's complex without full recursion support in this simple structure.
            // Let's just update the "BUKAN ..." part, or just keep it simple.
            // To maximize confusion: Update the whole string if possible.
            // Since we stored innerWrapper data:
            if (rule.innerWrapper) {
                const newInnerDesc = this.textGen.getDescription(rule.innerWrapper.rawType, rule.innerWrapper.rawValue, this.difficultyLevel);
                rule.description = this.textGen.getDescription('negation', newInnerDesc, this.difficultyLevel);
            }
        } else if (rule.rawType) {
            rule.description = this.textGen.getDescription(rule.rawType, rule.rawValue, this.difficultyLevel);
        }
    }

    generateRoundObjects(count, activeRules) {
        let attempts = 0;
        const maxAttempts = 500;

        while (attempts < maxAttempts) {
            attempts++;
            const validObject = this.createRandomObject('valid');
            if (activeRules.every(r => r.check(validObject))) {
                const distractors = [];
                let distractorsFailed = false;

                for (let i = 0; i < count - 1; i++) {
                    let dAttempt = 0;
                    let dObj;
                    let validDistractor = false;
                    while (dAttempt < 50) {
                        dObj = this.createRandomObject(`dist_${i}`);
                        if (!activeRules.every(r => r.check(dObj))) {
                            validDistractor = true;
                            break;
                        }
                        dAttempt++;
                    }
                    if (!validDistractor) {
                        distractorsFailed = true;
                        break;
                    }
                    distractors.push(dObj);
                }

                if (!distractorsFailed) {
                    const allObjects = [validObject, ...distractors];
                    return allObjects.sort(() => Math.random() - 0.5);
                }
            }
        }
        console.error("Failed to generate valid round configuration after", maxAttempts);
        throw new Error("CRITICAL: Impossible rule combination or generator failure.");
    }

    createRandomObject(id) {
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        const shape = FULL_SHAPES[Math.floor(Math.random() * FULL_SHAPES.length)];
        const number = Math.floor(Math.random() * 9) + 1;
        return new GameObject(id, color, shape, parseInt(number, 10));
    }
}
