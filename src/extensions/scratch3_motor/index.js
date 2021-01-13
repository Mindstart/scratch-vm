const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const TargetType = require('../../extension-support/target-type');
const formatMessage = require('format-message');
const Cast = require('../../util/cast');

const MOTOR_DIR = [
    {
        name: 'Forward',
        id: 'motor.motorDir.forward',
        value: 1
    },
    {
        name: 'Backward',
        id: 'motor.motorDir.backward',
        value: 0
    }
];

class MotorBlocks {
    constructor (runtime) {
        /**
         * Store this for later communication with the Scratch VM runtime.
         * If this extension is running in a sandbox then `runtime` is an async proxy object.
         * @type {Runtime}
         */
        this.runtime = runtime;
    }

    /**
     * @return {object} This extension's metadata.
     */
    getInfo () {
        return {

            id: 'motor',
            name: 'Motor',
            colour: '#C266FF',
            colourSecondary: '#AD33FF',
            colourTertiary: '#9900FF',
            blockIconURI: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB5fY51AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjdDRkU2MkM1NDRGRjExRUJBM0I1RUI0RTVFRTNEQjA0IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjdDRkU2MkM2NDRGRjExRUJBM0I1RUI0RTVFRTNEQjA0Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6N0NGRTYyQzM0NEZGMTFFQkEzQjVFQjRFNUVFM0RCMDQiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6N0NGRTYyQzQ0NEZGMTFFQkEzQjVFQjRFNUVFM0RCMDQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7bNVB/AAAuDElEQVR42uyd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',

            blocks: [
                {
                    opcode: 'motorControl',
                    text: formatMessage({
                        id: 'motor.motorControl',
                        default: 'Motor L [DIRL] [POWERL] Motor R [DIRR] [POWERR]',
                        description: 'controlling the speeds and directions of left and right motor'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        DIRL: {
                            type: ArgumentType.STRING,
                            menu: 'motorDir',
                            defaultValue: 0
                        },
                        POWERL: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 110
                        },
                        DIRR: {
                            type: ArgumentType.STRING,
                            menu: 'motorDir',
                            defaultValue: 0
                        },
                        POWERR: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 110
                        }
                    }
                },
                {
                    opcode: 'motorStop',
                    text: formatMessage({
                        id: 'motor.motorStop',
                        default: 'Motor Stop',
                        description: 'motor Stop'
                    }),
                    blockType: BlockType.COMMAND

                }
            ],

            // Optional: define extension-specific menus here.
            menus: {
                motorDir: this._buildMenu(MOTOR_DIR)
            }


        };
    }

    get SETVALUE () {
        return [
            {
                text: 'low',
                value: 0
            },
            {
                text: 'high',
                value: 1
            }
        ];
    }

    /**
     * Implement myReporter.
     * @param {object} args - the block's arguments.
     * @property {string} MY_ARG - the string value of the argument.
     * @returns {string} a string which includes the block argument value.
     */
    _buildMenu (info) {
        return info.map((entry, index) => {
            const obj = {};
            obj.text = formatMessage({
                id: entry.id,
                default: entry.name
            });
            obj.name = entry.name;
            obj.value = String(index);
            return obj;
        });
    }
    motorInit () {
        return 'motor initialized';
    }
    motorSetup (args) {
        return [String(args.PORTL), String(args.PORTR)];
    }
    motorStop (args) {
        return 'motor pause';
    }
    motorControl (args) {
        return [args.DIRL, args.POWERL, args.DIRR, args.POWERR];
    }
}

module.exports = MotorBlocks;
