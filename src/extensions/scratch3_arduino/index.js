const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const formatMessage = require('format-message');
const MathUtil = require('../../util/math-util');
const five = require("johnny-five");
const ComPort = require('../../io/comport');
const async = require("async");

let now = 0;
let board;
let motorStatus = 0;
let first = true;
let ultrasonicPin = 12;
let lastValue;
let digitalPinArray = new Array();

// digitalArray 0:ultrasonic-distance 1:temperature 2-13:pin2-pin13 14-19:A0-A5 20-21:color-reflect
let digitalArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];// 0:ultrasonic distance 1:
let motorA, motorB;
let motor_init = 0;
let lcd_init = 0;
let lcd;
let poll = 0;
let startRun = 0;
let ultrasonic = 0;
let readDigitalFlag = 0, readDigitalTime = 0;
let main;
let displaycount = 0;
const BLEUUID = {
    service: 0xffe0,
    rxChar: '2a00',
    txChar: '2a01'
};

// TODO: Refactor/rename all these high level primitives to be clearer/match

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFwAAACACAIAAAF+dqnNAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3FpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQyIDc5LjE2MDkyNCwgMjAxNy8wNy8xMy0wMTowNjozOSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDoyZmQzNTgyMS05ZDI5LTkzNDYtOGIwYS1hNjE0YmVhNzE2NzciIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NTU0RUU0MEYwNzQyMTFFOThGOENENzRDMjc3MjJCNUYiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NTU0RUU0MEUwNzQyMTFFOThGOENENzRDMjc3MjJCNUYiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjlhZjhlNGRlLWJkMzctNzA0OS1iNTVhLTQyODAxY2JjNGIyMSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDoyZmQzNTgyMS05ZDI5LTkzNDYtOGIwYS1hNjE0YmVhNzE2NzciLz4gPC9y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';

/**
 * High-level primitives / constants used by the extension.
 * @type {object}
 */
const PIN_MODE = [
	{
	  name: 'Input',
	  id: 'arduino.pinMode.Input',
	  value: 0
	},
	{
	  name: 'Output',
	  id: 'arduino.pinMode.Output',
	  value: 1
	}
];

const VALID_PIN_MODE = [0, 1, 2, 3, 4];

/**
 * Array of accepted sensor ports.
 * @note These should not be translated as they correspond to labels on
 *       the Arduino hub.
 * @type {array}
 */
const PIN_LEVEL = [
	{
	  name: 'low',
	  id: 'arduino.pinLevel.low',
	  value: 0
	},
	{
	  name: 'high',
	  id: 'arduino.pinLevel.high',
	  value: 1
	}
];

const Variable_Type = [
	{
	  name: 'Integer',
	  id: 'arduino.variableType.integer',
	  value: "int"
	},
	{
	  name: 'Long',
	  id: 'arduino.variableType.long',
	  value: "long"
	},
	{
	  name: 'Double',
	  id: 'arduino.variableType.double',
	  value: "double"
	},
	{
	  name: 'Float',
	  id: 'arduino.variableType.float',
	  value: "float"
	},
	{
	  name: 'Byte',
	  id: 'arduino.variableType.byte',
	  value: "byte"
	},
	{
	  name: 'Char',
	  id: 'arduino.variableType.char',
	  value: "char"
	},
	{
	  name: 'String',
	  id: 'arduino.variableType.string',
	  value: "String"
	}
];

const Baudrate = [
	{name: '9600',   value: 9600,   id: null},
	{name: '19200',  value: 19200,  id: null},
	{name: '38400',  value: 38400,  id: null},
	{name: '57600',  value: 57600,  id: null},
	{name: '115200', value: 115200, id: null}

];

const VALID_PIN_LEVEL = [0, 1];

const NEW_LINE = [{name: 'WRAP', value: 'Serial.println'}, {name:'NO WRAP', value: 'Serial.print'}];

class Arduino {

    constructor(runtime, extensionId) {
        // console.info("enter Arduino constructor");

        /**
         * The Scratch 3.0 runtime used to trigger the green flag button.
         * @type {Runtime}
         * @private
         */
        this._runtime = runtime;
        this._runtime.on('PROJECT_STOP_ALL', this._stopAll.bind(this));
        this._runtime.on('PROJECT_RUN_STOP', this._stopRun.bind(this));
        this._runtime.on('PROJECT_RUN_START', this._startRun.bind(this));
        //this._readDataArry = [];
        this._pollingIntervalID = null;
        this._pollingCounter = 0;

        /**
         * The Bluetooth connection session for reading/writing device data.
         * @type {BTSession}
         * @private
         */
        this._bt = null;
        this._runtime.registerPeripheralExtension(extensionId, this);
        //this._onSessionConnect();
        //this.connectDevice(11);//COM12
        main = this;
    };

    // TODO: keep here? / refactor
    /**
     * Called by the runtime when user wants to scan for a device.
     */
    scan() {
        console.info('Start startDeviceScan');
        this._bt = new ComPort(this._runtime, this._onSessionConnect.bind(this));
        console.info("End DeviceScan comport=" + this._bt.isConnected());
    };


    // TODO: keep here? / refactor
    /**
     * Called by the runtime when user wants to connect to a certain device.
     * @param {number} id - the id of the device to connect to.
     */
    connect(id) {
		global.port_connect = id;
		console.info('enter Arduino connectDevice=' + id);
        motor_init = 0;
        //if (!this._bt)
        this.scan();
        if (this._bt) {
            this._bt.connectPeripheral(id);
        }
        this._onSessionConnect();
    };

    // TODO: keep here? / refactor
    /**
     * Called by the runtime when user wants to disconnect from the device.
     */
    disconnect() {
        this._bt.disconnect();
        window.clearInterval(this._pollingIntervalID); // TODO: window?
        this._pollingIntervalID = null;
    };


    // TODO: keep here? / refactor
    /**
     * Called by the runtime to detect whether the device is connected.
     * @return {boolean} - the connected state.
     */
    isConnected () {
        let connected = false;
        if (this._bt) {
            connected = this._bt.isConnected();
        }
        return connected;

    };
    setPinMode(pin, mode) {
        if (!this._bt.isConnected()) return;
        //console.info('setPinMode(' + pin + "," + mode + ")");
        board = this._bt.getBoard();
        board.pinMode(pin, mode);
        this.sleepus(70000);
    };

    digitalwrite(pin, level) {
        if (!this._bt.isConnected()) return;
        //console.info('digitalWrite(' + pin + "," + level + ")");
        board = this._bt.getBoard();
        board.digitalWrite(pin, level);
		this.sleepus(1200);
    };

    analogWrite(pin, value) {
        if (!this._bt.isConnected()) return;
        //console.info('analogWrite(' + pin + "," + value + ")");
        board = this._bt.getBoard();
        board.analogWrite(pin, value);
        this.sleepus(1200);
    }

    servoWrite(pin, degree) {
        if (!this._bt.isConnected()) return;
        console.info('servoWrite(' + pin + "," + value + ")");
        board = this._bt.getBoard();
        board.servoWrite(pin, degree);
        this.sleepus(2000);
    }

    digitalRead(pin) {
        let value = digitalArray[pin];
        return value;
    }

    lcdDisplay(value) {
       if (typeof value !== "undefined") {
            console.info("lastValue=" + lastValue + " " + value);
            if (lcd_init == 0) {
                console.info("enter lcd init");
                lcd = new five.LCD({
                    //  controller: "JHD1313M1"
                    controller: "PCF8574T",
                });
                lcd_init = 1;
            }
            displaycount++;
            //console.info(" lcd display count=" + displaycount);
            //if(displaycount%3==0)
            //lcd.home();
            lcd.clear();

            // if (lcd.control == "JHD1313M1")
            //     lcd.bgColor(0, 0, 128);
            // else
            //     lcd.backlight();
            //setTimeout(function () {
            lcd.cursor(0, 0).print(value);
            lastValue = value;
            return;
            //},0);
        }
    }

    sleepus(usDelay) {
        var startTime = process.hrtime();
        var deltaTime;
        var usWaited = 0;
        while (usDelay > usWaited) {
            deltaTime = process.hrtime(startTime);
            usWaited = (deltaTime[0] * 1E9 + deltaTime[1]) / 1000;
        }
    }

    motorInit() {
        console.info("enter motorInit");

        this.setPinMode(8, 1);
        this.setPinMode(11, 1);
        this.setPinMode(10, 3);
        this.setPinMode(12, 1);
        this.setPinMode(13, 1);
        this.setPinMode(9, 3);
        return;
    }

    motorStop() {
        this.analogWrite(10, 0);
        this.analogWrite(9, 0);
    }

    // *******
    // PRIVATE
    // *******

    _stopAll() {
        console.info("enter _stopAll");
        startRun = 0;
        poll = 0;
        ultrasonic = 0;
        motor_init = 0;
        this._stopAllMotors();
        ultrasonic = 0;
        readDigitalFlag = 0;
        readDigitalTime = 0;
        for (let i = 0; i < digitalPinArray.length; i++) {
            digitalPinArray.pop();
            console.info("remove pin=" + pin);
        }
    }

    _stopRun() {
        console.info("enter _stopRun");
        startRun = 0;
        poll = 0;
        ultrasonic = 0;
        motor_init = 0;
        this._stopAllMotors();
        ultrasonic = 0;
        readDigitalFlag = 0;
        readDigitalTime = 0;
        for (let i = 0; i < digitalPinArray.length; i++) {
            var pin = digitalPinArray.pop();
            console.info("remove pin=" + pin);
        }
    }
    _startRun() {
        console.info("enter _startRun");
        poll = 0;
        ultrasonic = 0;
        motor_init = 0;
        ultrasonic = 0;
        readDigitalFlag = 0;
        readDigitalTime = 0;
        startRun = 1;

    }
    _stopAllMotors() {
        this.analogWrite(10, 0);
        this.analogWrite(9, 0);
    }

    // TODO: keep here? / refactor
    _applyPrefix(n, cmd) {
        // TODO: document
        const len = cmd.length + 5;
        return [].concat(
            len & 0xFF,
            (len >> 8) & 0xFF,
            0x1,
            0x0,
            0x0,
            n,
            0x0,
            cmd
        );
    }


    // TODO: keep here? / refactor
    _onSessionConnect() {
        console.info("enter _onSessionConnect");
        // start polling
        // TODO: window?
        // if (board.isReady)
        this._pollingIntervalID = window.setInterval(this._getSessionData.bind(this), 2000);
    }

    _onSessionMessage() {
        console.info("enter _onSessionMessage");
    }

    // TODO: keep here? / refactor
    _getSessionData() {

        if (!this.isConnected()) return;
        //console.info("enter _getSessionData");
        if (startRun ==1 && readDigitalFlag == 0) {
            console.info("enter _getSessionData*******************" + digitalPinArray);
            //const pin = [4, 5];
            board = this._bt.getBoard();
            //readDigitalFlag = 1;
            // for (let i = 0; i < digitalPinArray.length; i++) {
            //     this.removeAllListeners(`digital-read-${digitalPinArray[i]}`);
            // }
            for (let i = 0; i < digitalPinArray.length; i++) {

                console.info("read digitalPinArray " + digitalPinArray[i]);
                readDigitalFlag = 1;
                board.removeAllListeners(`digital-read-${digitalPinArray[i]}`);
                board.digitalRead(digitalPinArray[i], function (value) {
                    const randow = Math.ceil(Math.random() * 10);
                    //if(randow == 5) {
                    console.log("digital pin: %d value: %d", digitalPinArray[i], value);
                    //     readDigitalFlag = 0;
                    // }
                    //board.removeAllListeners(`digital-read-${pin[i]}`);
                    digitalArray[digitalPinArray[i]] = value;
                    readDigitalTime = Date.now();
                   // readDigitalFlag = 1;
                    //console.info("response=" + digitalArray+"");
                });
            }
        }
        // for (let i = 0; i <= 3; i++) {
        //     board.analogRead(i, function (value) {
        //         //console.log("analog pin: %d value: %d", i, value);
        //         board.removeAllListeners(`analog-read-${i}`);
        //         digitalArray[14 + i] = value;
        //     });
        // }

        if (ultrasonic == 1) {
            board = this._bt.getBoard();
            const pinNumber = ultrasonicPin;
            let proximity = new five.Proximity({
                controller: "HCSR04",
                pin: pinNumber,
                freq: 300,

            });
            board.removeAllListeners(`ping-read-${pinNumber}`);
            // proximity.on("data", function () {
            //     board.removeAllListeners(`ping-read-${pinNumber}`);
            //     //  if (this.cm.toString() != "0") {
            //     // console.info("distanceFFFFFFFFFF=" + this.cm);
            //     // digitalArray[0] = this.cm;
            //     //  }
            // });

            proximity.on("change", function () {
                board.removeAllListeners(`ping-read-${pinNumber}`);
                let dis = this.cm;
                if (this.cm != "0") {
                    if (Number(this.cm) > 2000)
                        dis = 500;
                    //console.info("distance=" + dis + " difftime=");
                    digitalArray[0] = dis;
                    proximity.dis
                }
            });

        }
        //first = !first;
        this._pollingCounter++;
    }


    // TODO: keep here? / refactor
    _tachoValue(list) {
        const value = list[0] + (list[1] * 256) + (list[2] * 256 * 256) + (list[3] * 256 * 256 * 256);
        return value;
    }

    // TODO: keep here? / refactor
    _array2float(list) {
        const buffer = new Uint8Array(list).buffer;
        const view = new DataView(buffer);
        return view.getFloat32(0, true);
    }

}

class Scratch3ArduinoBlocks {


    /**
     * Creates a new instance of the Arduino extension.
     * @param  {object} runtime VM runtime
     * @constructor
     */
    constructor(runtime) {
        /**
         * The Scratch 3.0 runtime.
         * @type {Runtime}
         */
        this.runtime = runtime;

        // Create a new Arduino device instance
        this._device = new Arduino(this.runtime, Scratch3ArduinoBlocks.EXTENSION_ID);
    }

	/**
     * The ID of the extension.
     * @return {string} the id
     */
    static get EXTENSION_ID() {
        return 'arduino';
    }
	/**
     * Define the Arduino extension.
     * @return {object} Extension description.
     */
    getInfo() {
        //console.info('enter arduino getInfo');
        return {
            id: Scratch3ArduinoBlocks.EXTENSION_ID,
            name: 'Ainobot',
            blockIconURI: blockIconURI,
            showStatusButton: true,
			colour: '#FF6680',
			colourSecondary: '#FF4D6A',
			colourTertiary: '#FF3355',
            blocks: [
				{
                    opcode: 'setup',
					blockType: BlockType.HAT,
					branchCount: 1,
                    text: formatMessage({
                        id: 'arduino.setup',
						default: 'Setup',
                        description: 'arduino setup'
                    }),
					arguments: { }
                },
				{
                    opcode: 'loop',
					blockType: BlockType.LOOP,
					branchCount: 1,
					isTerminal: true,
                    text: formatMessage({
                        id: 'arduino.loop',
						default: 'Loop',
                        description: 'arduino loop'
                    }),
					arguments: { }
                },
                {
                    opcode: 'variable_create',
                    text: formatMessage({
                        id: 'arduino.variable_create',
						default: 'Create[TYPE][NAME] as [VALUE]',
                        description: 'set pin mode'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TYPE: {
                            type: ArgumentType.STRING,
							menu: 'varType',
                            defaultValue: 0
                        },
                        NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: "Name"

                        },
						VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: ""
                        }
                    }
                },
                {
                    opcode: 'pin_mode',
                    text: formatMessage({
                        id: 'arduino.pin_mode',
                        default: 'Set [PIN] As [MODE]',
                        description: 'set pin mode'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 11
                        },
                        MODE: {
                            type: ArgumentType.STRING,
                            menu: 'pinMode',
                            defaultValue: 0
                        }
                    }
                },
				{
                    opcode: 'serial_begin',
                    text: formatMessage({
                        id: 'arduino.serial_begin',
                        default: 'Serial Begin [Baud]',
                        description: 'set serial connection'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        Baud: {
                            type: ArgumentType.NUMBER,
							menu: 'baudrate',
                            defaultValue: 9600
                        }
                    }
                },
				{
                    opcode: 'serial_print',
                    text: formatMessage({
                        id: 'arduino.serial_print',
                        default: 'Serial Print [VALUE] [NL]',
                        description: 'serial print data'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Hello'
                        },
						NL: {
                            type: ArgumentType.STRING,
                            menu: 'newLine',
							defaultValue: 'WRAP'
                        }
                    }
                },
                {
                    opcode: 'digital_write',
                    text: formatMessage({
                        id: 'arduino.digital_write',
                        default: 'Digital Write [PIN] [LEVEL]',
                        description: 'digital write pin high or low'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 11
                        },
                        LEVEL: {
                            type: ArgumentType.STRING,
                            menu: 'pinLevel',
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'pwm_write',
                    text: formatMessage({
                        id: 'arduino.pwm_write',
                        default: 'Analog Write [PIN] [VALUE]',
                        description: 'Analog write pin'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 255
                        },
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 11
                        }
                    }
                },
                {
                    opcode: 'servo_write',
                    text: formatMessage({
                        id: 'arduino.servo_write',
                        default: 'Servo Write [PIN] Degree [DEGREE]',
                        description: 'Servo write pin'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        DEGREE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 180
                        },
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 11
                        }
                    }
                },
                {
                    opcode: 'digital_read',
                    text: formatMessage({
                        id: 'arduino.digital_read',
                        default: 'Digital Read [PIN]',
                        description: 'digital Read pin'
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 2
                        }
                    }
                },
                {
                    opcode: 'analog_read',
                    text: formatMessage({
                        id: 'arduino.analog_read',
                        default: 'Analog Read [PIN]',
                        description: 'Analog Read pin'
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },

            ],
            menus: {
                pinMode: this._buildMenu(PIN_MODE),
                pinLevel: this._buildMenu(PIN_LEVEL),
				varType: this._buildMenu(Variable_Type),
				baudrate: this._buildMenu(Baudrate),
				newLine: this._buildMenu(NEW_LINE)
            },
        };
    }

    // TODO: redo?
    /**
     * Create data for a menu in scratch-blocks format, consisting of an array of objects with text and
     * value properties. The text is a translated string, and the value is one-indexed.
     * @param  {object[]} info - An array of info objects each having a name property.
     * @return {array} - An array of objects with text and value properties.
     * @private
     */

    get SETPINMODE () {
        return [
            {
                text: 'Digital Input',
                value: 0
            },
            {
                text: 'Digital Output',
                value: 1
            },
            {
                text: 'Analog Input',
                value: 2
            },
            {
                text: 'Analog Output(PWM)',
                value: 3
            },
            {
                text: 'Servo',
                value: 4
            }
        ];
    }
    get SETLEVEL () {
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
	get SETVariableType (){
		return Variable_Type;
	}

	get SETBaudrate (){
		return Baudrate;
	}

	get SETNEWLINE (){
		return NEW_LINE;
	}

    _buildMenu(info) {
      return info.map(function (entry, index) {
        var obj = {};
        obj.text = formatMessage({
          id: entry.id,
          default: entry.name
        });
		obj.name = entry.name;
        obj.value = String(index);
		obj.colour = '#FF8C00';
        return obj;
      });
    }
	setup(args){
		if(args == null){
			return "";
		}
		else return String(args);
	}
	loop(args){
		if(args == null){
			return "";
		}
		else return String(args);
	}
	variable_create(args){
		let variable = String(args.TYPE)+String(args.NAME)+String(args.VALUE);
		return variable;
	}

	serial_begin(args){
		let variable = String(args.TYPE)+String(args.NAME)+String(args.VALUE);
		return variable;
	}
	serial_print(args){
		let variable = String(args.TYPE) + String(args.VALUE) + String(args.NL);
		return variable;
	}
    pin_mode(args) {
        const pin = Cast.toNumber(args.PIN);
        const mode = Cast.toNumber(args.MODE);
        // if (!VALID_PIN_MODE.includes(mode)) {
        //     return;
        // }
        return this._device.setPinMode(pin, mode);
    }

    digital_write(args) {
        const pin = Cast.toNumber(args.PIN);
        const level = Cast.toNumber(args.LEVEL);
        return this._device.digitalwrite(pin, level);
    }


    pwm_write(args) {
        const pin = Cast.toNumber(args.PIN);
        const value = Cast.toNumber(args.VALUE);
        return this._device.analogWrite(pin, value);
    }

    servo_write(args) {
        const pin = Cast.toNumber(args.PIN);
        const degree = Cast.toNumber(args.DEGREE);
        return this._device.servoWrite(pin, degree);
    }

    digital_read(args) {
        readDigitalFlag == 1;
        let pin = Cast.toNumber(args.PIN);
        let data = this._device.digitalRead(pin);
        console.info('digitalRead data=' + data);
        return data;
    }

    analog_read(args) {
        let pin = 14 + Cast.toNumber(args.PIN);
        let data = this._device.digitalRead(pin);
        //console.info("analoglRead data=" + data);
        return data;

    }
    whenBrightnessLessThan(args) {
        const brightness = MathUtil.clamp(Cast.toNumber(args.DISTANCE), 0, 100);

        return this._device.brightness < brightness;
    }
    buttonPressed(args) {
        const port = Cast.toNumber(args.PORT);

        if (!VALID_PIN_LEVEL.includes(port)) {
            return;
        }

        return this._device.isButtonPressed(port);
    }
    getDistance() {
        return this._device.distance;
    }

    getBrightness() {
        return this._device.brightness;
    }
    reconnect(id) {
        return this._device.connectDevice(id);
    }
    beep(args) {
        const note = MathUtil.clamp(Cast.toNumber(args.NOTE), 47, 99); // valid Arduino sounds
        let time = Cast.toNumber(args.TIME) * 1000;
        time = MathUtil.clamp(time, 0, 3000);

        if (time === 0) {
            return; // don't send a beep time of 0
        }
        // https://en.wikipedia.org/wiki/MIDI_tuning_standard#Frequency_values
        const freq = Math.pow(2, ((note - 69 + 12) / 12)) * 440;
        return this._device.beep(freq, time);
    }
}

module.exports = Scratch3ArduinoBlocks;
