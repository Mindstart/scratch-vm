const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const TargetType = require('../../extension-support/target-type');
const formatMessage = require('format-message');

const DATA_TYPE = [
	{
	  name: 'digital',
	  id: 'sensor.dataType.digital',
	  value: 0
	}, 
	{
	  name: 'analog',
	  id: 'sensor.dataType.analog',
	  value: 1
	}
];
const MOTOR_DIR = [
	{
	  name: 'Forward',
	  id: 'sensor.motorDir.forward',
	  value: 1
	}, 
	{
	  name: 'Backward',
	  id: 'sensor.motorDir.backward',
	  value: 0
	}
];
const PORT_MODE = [
	{
	  name: 'Port 1 (Digital)',
	  id: 'sensor.portMode.1',
	  value: 12
	}, 
	{
	  name: 'Port 2 (Digital)',
	  id: 'sensor.portMode.2',
	  value: 13
	}, 
	{
	  name: 'Port 3 (Analog)',
	  id: 'sensor.portMode.3',
	  value: 0
	}, 
	{
	  name: 'Port 4 (Analog)',
	  id: 'sensor.portMode.4',
	  value: 1
	}, 
	{
	  name: 'Port 5 (Analog)',
	  id: 'sensor.portMode.5',
	  value: 2
	}, 
	{
	  name: 'Port 6 (Analog)',
	  id: 'sensor.portMode.6',
	  value: 3
	}, 
	{
	  name: 'Port 7 (PWM)',
	  id: 'sensor.portMode.7',
	  value: 3
	}, 
	{
	  name: 'Port 8 (PWM)',
	  id: 'sensor.portMode.8',
	  value: 9
	}
];
const DIGITAL_PIN = [
    {
        name: '0',
        id: 'sensor.pin.0',
        value: 0
    },
    {
        name: '1',
        id: 'sensor.pin.1',
        value: 1
    },
    {
        name: '2',
        id: 'sensor.pin.2',
        value: 2
    },
    {
        name: '3',
        id: 'sensor.pin.3',
        value: 3
    },
    {
        name: '4',
        id: 'sensor.pin.4',
        value: 4
    },
    {
        name: '5',
        id: 'sensor.pin.5',
        value: 5
    },
    {
        name: '6',
        id: 'sensor.pin.6',
        value: 6
    },
    {
        name: '7',
        id: 'sensor.pin.7',
        value: 7
    },
    {
        name: '8',
        id: 'sensor.pin.8',
        value: 8
    },
    {
        name: '9',
        id: 'sensor.pin.9',
        value: 9
    },
    {
        name: '10',
        id: 'sensor.pin.10',
        value: 10
    },
    {
        name: '11',
        id: 'sensor.pin.11',
        value: 11
    },
    {
        name: '12',
        id: 'sensor.pin.12',
        value: 12
    },
    {
        name: '13',
        id: 'sensor.pin.13',
        value: 13
    },
    {
        name: 'A0',
        id: 'sensor.pin.A0',
        value: 14
    },
    {
        name: 'A1',
        id: 'sensor.pin.A1',
        value: 15
    },
    {
        name: 'A2',
        id: 'sensor.pin.A2',
        value: 16
    },
    {
        name: 'A3',
        id: 'sensor.pin.A3',
        value: 17
    },
    {
        name: 'A4',
        id: 'sensor.pin.A4',
        value: 18
    },
    {
        name: 'A5',
        id: 'sensor.pin.A5',
        value: 19
    }
];
const DHT11_TYPE = [
    {
        name: 'temperature',
        id: 'sensor.dht11.temperature',
        value: 'temperature'
    },
    {
        name: 'humidity',
        id: 'sensor.dht11.humidity',
        value: 'humidity'

    }
];
const BMP_DATA = [
	{name: 'temperature', value: 'temperature', id: null},
	{name: 'pressure', value: 'pressure', id: null},
	{name: 'altitude', value: 'altitude', id: null}
];
const OSS = [
	{name: 'Single', value: 0, id: null},
	{name: '2 times', value: 1, id: null},
	{name: '4 times', value: 2, id: null},
	{name: '8 times', value: 3, id: null}
];
const LCD_LINE = [{name: '1', value: 0},{name: '2', value: 1}]

class SensorBlocks {
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

            id: 'sensor',
            name: 'Sensor',
			colour: '#B84DFF',
			colourSecondary: '#8600B3',
			colourTertiary: '#6B00B3',
			blockIconURI: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CgogPGc+CiAgPHRpdGxlPmJhY2tncm91bmQ8L3RpdGxlPgogIDxyZWN0IGZpbGw9IiNmZmFhNTYiIGlkPSJjYW52YXNfYmFja2dyb3VuZCIgaGVpZ2h0PSI0MiIgd2lkdGg9IjQyIiB5PSItMSIgeD0iLTEiLz4KIDwvZz4KIDxnPgogIDx0aXRsZT5MYXllciAxPC90aXRsZT4KICA8cGF0aCBmaWxsPSIjMEMzNzJDIiBzdHJva2U9Im51bGwiIGlkPSJzdmdfMSIgZD0ibTMzLjc4ODc0OCw3LjI5NjUyOGMtMy42ODMwMzcsLTMuNDE1NDY3IC04LjU4MDA2NywtNS4yOTY0ODUgLTEzLjc4ODYyOCwtNS4yOTY0ODVzLTEwLjEwNTU5MSwxLjg4MTAxOCAtMTMuNzg4NjI4LDUuMjk2NDg1Yy0zLjY4MzAzNywzLjQxNTQ2NyAtNS43MTE0MTYsNy45NTY3MyAtNS43MTE0MTYsMTIuNzg2ODkzczIuMDI4Mzc5LDkuMzcxNDI2IDUuNzExNDE2LDEyLjc4Njg5M2MzLjY4MzAzNywzLjQxNTQ2NyA4LjU4MDA2Nyw1LjI5NjQ4NSAxMy43ODg2MjgsNS4yOTY0ODVzMTAuMTA1NTkxLC0xLjg4MTAxOCAxMy43ODg2MjgsLTUuMjk2NDg1YzMuNjgzMDM3LC0zLjQxNTQ2NyA1LjcxMTQxNiwtNy45NTY3MyA1LjcxMTQxNiwtMTIuNzg2ODkzcy0yLjAyODM3OSwtOS4zNzE0MjYgLTUuNzExNDE2LC0xMi43ODY4OTN6bS0yLjk1ODUxLDE2LjM0Njk0OGMwLDAuNTE1MTYyIC0wLjQ1MTk3NCwwLjkzNDAyNCAtMS4wMDc0OTUsMC45MzQwMjRjLTAuNTU1MjIzLDAgLTEuMDA3MTk2LC0wLjQxODg2MiAtMS4wMDcxOTYsLTAuOTM0MDI0YzAsLTAuNTE1MTYyIDAuNDUxOTc0LC0wLjkzNDAyNSAxLjAwNzE5NywtMC45MzQwMjVjMC41NTU1MiwwIDEuMDA3NDk0LDAuNDE4ODYzIDEuMDA3NDk0LDAuOTM0MDI1em0tMjEuNjYwMjM3LC03LjEyMDExYzAsLTAuNTE1MTYyIDAuNDUxOTc0LC0wLjkzNDAyNCAxLjAwNzQ5NCwtMC45MzQwMjRjMC41NTUyMjMsMCAxLjAwNzE5NywwLjQxODg2MiAxLjAwNzE5NywwLjkzNDAyNGMwLDAuNTE1MTYyIC0wLjQ1MTk3NCwwLjkzNDAyNSAtMS4wMDcxOTcsMC45MzQwMjVjLTAuNTU1NTIsMCAtMS4wMDc0OTQsLTAuNDE5MTM4IC0xLjAwNzQ5NCwtMC45MzQwMjV6bTI0LjAwNjY5MiwxMy44MjEzNTdsMCwtMi4xNTE0M2MwLC0wLjU4NTI0OCAtMC41MTE3ODEsLTEuMDU5NTczIC0xLjE0MjU4MSwtMS4wNTk1NzNjLTAuNjMxMDk3LDAgLTEuMTQyNTgxLDAuNDc0MzI1IC0xLjE0MjU4MSwxLjA1OTU3M2wwLDQuMjQzNTM1Yy0wLjQ0NDIzOCwwLjMzNzQ2MyAtMC45MDY5MjMsMC42NTQyMzEgLTEuMzg2MjcxLDAuOTQ5NzUybDAsLTMuNzgwNTIzYzAsLTAuNTg0OTczIC0wLjUxMTQ4NCwtMS4wNTk1NzMgLTEuMTQyNTgxLC0xLjA1OTU3M2MtMC42MzA4LDAgLTEuMTQyNTgxLDAuNDc0NiAtMS4xNDI1ODEsMS4wNTk1NzNsMCw0Ljk2NzU3NmMtMC43ODE5NTQsMC4zMzYzNTkgLTEuNTk1MTUsMC42MjAyOTIgLTIuNDM1MTI1LDAuODQ2MDAzbDAsLTE4LjM0MTM3M2wyLjk0NjkwNiwwYzAuMzkzOTUyLDEuMjc3MjgyIDEuNjYzMjg4LDIuMjE1MTcgMy4xNjUzMDUsMi4yMTUxN2MxLjgxNTYzMiwwIDMuMjkyMzU5LC0xLjM2OTQ0MyAzLjI5MjM1OSwtMy4wNTMxNzFjMCwtMS42ODM0NTIgLTEuNDc2NzI2LC0zLjA1MzE3MSAtMy4yOTIzNTksLTMuMDUzMTcxYy0xLjMyMjAwMiwwIC0yLjQ2Mzk4NywwLjcyNjgwMSAtMi45ODczNzMsMS43NzIwMjZsLTQuMjY3NDE5LDBjLTAuNjMxMDk4LDAgLTEuMTQyNTgxLDAuNDc0MzI0IC0xLjE0MjU4MSwxLjA1OTU3M2wwLDE5Ljg2MDA5NWMtMC44MTY0NjksMC4xMTA2NDggLTEuNjUwNzkyLDAuMTY4ODcgLTIuNDk5NjkzLDAuMTY4ODdjLTkuNDkyMzQ3LDAgLTE3LjIxNDg4MywtNy4xNjE0OTkgLTE3LjIxNDg4MywtMTUuOTY0MjMzYzAsLTAuODUwNDE3IDAuMDcyODk5LC0xLjY4NTY1OSAwLjIxMTU1NiwtMi41MDA0ODJsNC4wOTI3NiwwYzAuNDY1NjYxLDEuMTYyNzcxIDEuNjc0LDEuOTkzNTk4IDMuMDg3NjQ2LDEuOTkzNTk4YzEuODE1NjMyLDAgMy4yOTIzNTgsLTEuMzY5NzE5IDMuMjkyMzU4LC0zLjA1MzE3MWMwLC0xLjY4MzQ1MiAtMS40NzY3MjUsLTMuMDUzMTcgLTMuMjkyMzU4LC0zLjA1MzE3Yy0xLjQxMzY0NywwIC0yLjYyMTk4NSwwLjgzMDgyNiAtMy4wODc2NDYsMS45OTM1OTdsLTMuNTY4NDgxLDBjMC42ODQwNiwtMi4wOTM3NiAxLjgyMDA5NSwtNC4wMDY3ODYgMy4zMDI0NzQsLTUuNjQxNjc0bDAsMS4zNTY0NzRjMCwwLjU4NDk3MyAwLjUxMTQ4NCwxLjA1OTU3MyAxLjE0MjU4MSwxLjA1OTU3M3MxLjE0MjU4MSwtMC40NzQ2IDEuMTQyNTgxLC0xLjA1OTU3M2wwLC0zLjQ0ODg1NWMwLjQ0NDIzOCwtMC4zMzcxODcgMC45MDY5MjMsLTAuNjUzOTU1IDEuMzg1OTc1LC0wLjk0OTQ3N2wwLDIuOTg1MjkyYzAsMC41ODUyNDkgMC41MTE3ODEsMS4wNTk1NzMgMS4xNDI1ODEsMS4wNTk1NzNjMC42MzEwOTcsMCAxLjE0MjU4MSwtMC40NzQzMjQgMS4xNDI1ODEsLTEuMDU5NTczbDAsLTQuMTcyMzQ0YzAuNjk5ODMxLC0wLjMwMTA0IDEuNDI0MzU4LC0wLjU2MDEzOSAyLjE3MDYwNiwtMC43NzI4ODFsMCwxOC41ODk3MTFsLTIuNzYwMDQ2LDBjLTAuNDY1MzY0LC0xLjE2Mjc3MSAtMS42NzM3MDMsLTEuOTkzNTk4IC0zLjA4NzY0NiwtMS45OTM1OThjLTEuODE1MzM1LDAgLTMuMjkyMzU5LDEuMzY5NzE5IC0zLjI5MjM1OSwzLjA1MzE3MWMwLDEuNjgzNzI4IDEuNDc3MDI0LDMuMDUzMTcxIDMuMjkyMzU5LDMuMDUzMTcxYzEuNDEzOTQ0LDAgMi42MjIyODIsLTAuODMwODI3IDMuMDg3NjQ2LC0xLjk5MzU5OGwzLjkwMjYyNywwYzAuNjMxMDk4LDAgMS4xNDI1ODEsLTAuNDc0MzI0IDEuMTQyNTgxLC0xLjA1OTU3M2wwLC0yMC4xNDM0NzVjMC45MDAzNzcsLTAuMTM1NDgyIDEuODIzNjY2LC0wLjIwNjk0OCAyLjc2NDUxLC0wLjIwNjk0OGM5LjQ5MjM0NywwIDE3LjIxNDg4Myw3LjE2MTQ5OSAxNy4yMTQ4ODMsMTUuOTY0MjMzYzAsMC44NTA0MTcgLTAuMDcyODk5LDEuNjg1NjU5IC0wLjIxMTU1NiwyLjUwMDQ4MmwtNC4wOTI3NiwwYy0wLjQ2NTY2MSwtMS4xNjI3NzEgLTEuNjc0LC0xLjk5MzU5OCAtMy4wODc2NDYsLTEuOTkzNTk4Yy0xLjgxNTYzMiwwIC0zLjI5MjM1OSwxLjM2OTcxOSAtMy4yOTIzNTksMy4wNTMxNzFjMCwxLjY4MzQ1MiAxLjQ3NjcyNiwzLjA1MzE3IDMuMjkyMzU5LDMuMDUzMTdjMS40MTM2NDYsMCAyLjYyMTk4NSwtMC44MzA4MjYgMy4wODc2NDYsLTEuOTkzNTk3bDMuNTY4NDgxLDBjLTAuNjg0MDYxLDIuMDkzNzYgLTEuODIwMDk1LDQuMDA3MDYyIC0zLjMwMjQ3NSw1LjY0MTY3NGwwLDAuMDAwMDAxem0tMi4yNzk1MDgsLTE1LjAzODQ4N2MwLjU1NTUyLDAgMS4wMDc0OTUsMC40MTkxMzkgMS4wMDc0OTUsMC45MzQwMjVjMCwwLjUxNTE2MiAtMC40NTE5NzQsMC45MzQwMjUgLTEuMDA3NDk1LDAuOTM0MDI1Yy0wLjU1NTIyMywwIC0xLjAwNzE5NiwtMC40MTg4NjMgLTEuMDA3MTk2LC0wLjkzNDAyNWMwLC0wLjUxNDg4NiAwLjQ1MTk3NCwtMC45MzQwMjUgMS4wMDcxOTYsLTAuOTM0MDI1em0tMjAuNzg2OTM1LDkuMTYzMzc1YzAsMC41MTUxNjIgLTAuNDUxOTc0LDAuOTM0MDI1IC0xLjAwNzE5NiwwLjkzNDAyNWMtMC41NTU1MiwwIC0xLjAwNzQ5NSwtMC40MTg4NjMgLTEuMDA3NDk1LC0wLjkzNDAyNWMwLC0wLjUxNDg4NiAwLjQ1MTk3NCwtMC45MzQwMjUgMS4wMDc0OTUsLTAuOTM0MDI1YzAuNTU1MjIzLDAgMS4wMDcxOTYsMC40MTkxMzkgMS4wMDcxOTYsMC45MzQwMjV6bTAsMCIvPgogIDxwYXRoIGZpbGw9IiMxNTM3MjMiIHN0cm9rZT0ibnVsbCIgaWQ9InN2Z18yIiBkPSJtMjQuODQzNDU4LDcuNjcwNjY4Yy0xLjQzNTg0NSwwIC0yLjYwMzkxLDEuMjM1NDYxIC0yLjYwMzkxLDIuNzU0NDU4YzAsMC4zMjMzNjYgMC4wNTM0MTUsMC42MzM1MzggMC4xNTA1OTcsMC45MjIwNTNsLTIuODkyNjMyLDIuNTU1ODA5Yy0wLjIwNTQyMywwLjE4MTQ3MyAtMC4zMjQyNTMsMC40NTAzMjMgLTAuMzI0MjUzLDAuNzMzNjFsMCwxMi4xMzEwN2wtMS4yNDAwNjksMC43MDg3MTZjLTAuNDU4ODQ5LC0wLjQyNjkyMyAtMS4wNTk1ODgsLTAuNjg2NTYxIC0xLjcxNzI3MiwtMC42ODY1NjFjLTEuNDM1NjA5LDAgLTIuNjAzNjc1LDEuMjM1NDYxIC0yLjYwMzY3NSwyLjc1NDQ1OWMwLDEuNTE4NzQ5IDEuMTY4MDY1LDIuNzU0NDU4IDIuNjAzNjc1LDIuNzU0NDU4YzEuNDM1ODQ1LDAgMi42MDM2NzUsLTEuMjM1NzEgMi42MDM2NzUsLTIuNzU0NDU4YzAsLTAuMTMxNDM3IC0wLjAwOTE3NywtMC4yNjAzODYgLTAuMDI2MTE5LC0wLjM4NjU5NWwxLjcxMjgwMiwtMC45NzkwNTljMC4yOTIyNTEsLTAuMTY2Nzg2IDAuNDc0MTQ0LC0wLjQ4OTkwMyAwLjQ3NDE0NCwtMC44NDA5bDAsLTEyLjI1NDA0NGwyLjU2OTA4NSwtMi4yNjk3ODNjMC4zODE0MzMsMC4yMzIwMDcgMC44MjMxMDUsMC4zNjU2ODUgMS4yOTM5NTUsMC4zNjU2ODVjMS40MzU2MDksMCAyLjYwMzY3NCwtMS4yMzU3MTEgMi42MDM2NzQsLTIuNzU0NDU5Yy0wLjAwMDIzNSwtMS41MTg5OTggLTEuMTY4MDY1LC0yLjc1NDQ1OCAtMi42MDM2NzQsLTIuNzU0NDU4em0tOS40MjQwNTUsMjEuODczNjE0YzAsLTAuNDY0NzYxIDAuMzU3NDMyLC0wLjg0MjY0MyAwLjc5NjUxNSwtMC44NDI2NDNjMC40MzkzMTksMCAwLjc5NjUxNSwwLjM3Nzg4MyAwLjc5NjUxNSwwLjg0MjY0M2MwLDAuNDY0NTExIC0wLjM1NzE5NywwLjg0MjY0MiAtMC43OTY1MTUsMC44NDI2NDJjLTAuNDM5MDgzLDAgLTAuNzk2NTE1LC0wLjM3ODEzMSAtMC43OTY1MTUsLTAuODQyNjQyem04LjYyNzMwNCwtMTkuMTE5MTU2YzAsLTAuNDY0NzYxIDAuMzU3NDMyLC0wLjg0MjY0MiAwLjc5Njc1MSwtMC44NDI2NDJjMC40MzkwODMsMCAwLjc5NjUxNSwwLjM3Nzg4MiAwLjc5NjUxNSwwLjg0MjY0MmMwLDAuNDY0NTEyIC0wLjM1NzQzMSwwLjg0MjY0MyAtMC43OTY1MTUsMC44NDI2NDNjLTAuNDM5MzE5LDAgLTAuNzk2NzUxLC0wLjM3ODEzMSAtMC43OTY3NTEsLTAuODQyNjQzem0wLDAiLz4KIDwvZz4KPC9zdmc+', 
			
            blocks: [
			// {       
            //         opcode: 'ultrasonicDistance',
            //         text: formatMessage({
            //             id: 'sensor.ultrasonicDistance',
            //             default: 'Ultrasonic Distance [PORT]',
            //             description: 'Ultrasonic sensor using one wire'
            //         }),
            //         blockType: BlockType.REPORTER,
            //         arguments: {
            //             PORT: {
            //                 type: ArgumentType.STRING,
            //                 menu: 'portMode',
            //                 defaultValue: 0
            //             }
            //         }
            //     },
				{
                    opcode: 'ultrasonicDistance2W',
                    text: formatMessage({
                        id: 'sensor.ultrasonicDistance2W',
                        default: 'Read Ultrasonic Sensor (cm) Trig[TRIG]Echo[ECHO]',
                        description: 'Ultrasonic sensor using two wires'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        TRIG: {
                            type: ArgumentType.NUMBER,
                            menu: 'digitalPin',
                            defaultValue: 0
                        },
						ECHO: {
                            type: ArgumentType.NUMBER,
                            menu: 'digitalPin',
                            defaultValue: 0						
						}
                    }
                },
                {
                    opcode: 'dht11',
                    text: formatMessage({
                        id: 'sensor.dht11',
                        default: 'Read pin [PIN] DHT11 [TYPE]',
                        description: 'Read DHT11'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            menu: 'digitalPin',
                            defaultValue: 0
                        },
						TYPE: {
                            type: ArgumentType.STRING,
                            menu: 'dht11Type',
                            defaultValue: 0						
						}
                    }
                },
                // {
                //     opcode: 'infraredTrack',
                //     text: formatMessage({
                //         id: 'sensor.infraredTrack',
                //         default: 'IR Reflect [MODE] [PORT]',
                //         description: 'infrared sensors used to track line'
                //     }),
                //     blockType: BlockType.REPORTER,
                //     arguments: {
                //         MODE:{
                //             type: ArgumentType.STRING,
                //             menu: 'dataType',
                //             defaultValue: 0
                //         },
                //         PORT: {
                //             type: ArgumentType.STRING,
                //             menu: 'portMode',
                //             defaultValue: 0
                //         }
                //     }
                // },
                // {
                //     opcode: 'temperature',
                //     text: formatMessage({
                //         id: 'sensor.temperature',
                //         default: 'Temperature [PORT]',
                //         description: 'get temperature from thermostat sensor at pin #'
                //     }),
                //     blockType: BlockType.REPORTER,
                //     arguments: {
                //         PORT: {
                //             type: ArgumentType.STRING,
                //             menu: 'portMode',
                //             defaultValue: 0
                //         }
                //     }
                // },
                // {
                //     opcode: 'humidity',
                //     text: formatMessage({
                //         id: 'sensor.humidity',
                //         default: 'DH11 Humidity [PORT]',
                //         description: 'get humidity from DHT sensor at pin #'
                //     }),
                //     blockType: BlockType.REPORTER,
                //     arguments: {
                //         PORT: {
                //             type: ArgumentType.STRING,
                //             menu: 'portMode',
                //             defaultValue: 0
                //         }
                //     }
                // },
                {
                    opcode: 'lcdAddress',
                    text: formatMessage({
                        id: 'sensor.lcdAddress',
                        default: 'LCD Address [VALUE]',
                        description: 'LCD display address'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: '0x27'
                        }
                    }
                },
                {
                    opcode: 'lcdDisplay',
                    text: formatMessage({
                        id: 'sensor.lcdDisplay',
                        default: 'LCD Display [VALUE] at row [ROW]',
                        description: 'LCD display String'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: 0
                        },
						ROW: {
						    type: ArgumentType.STRING,
                            menu: 'lcdLine',
                            defaultValue: 0	
						}
                    }
                },
		        // {
                //     opcode: 'bmp180',
                //     text: formatMessage({
                //         id: 'sensor.bmp180',
                //         default: 'BMP180 [DATA][OSS]',
                //         description: 'bmp180 sensors'
                //     }),
                //     blockType: BlockType.REPORTER,
                //     arguments: {
                //         DATA: {
                //             type: ArgumentType.STRING,
                //             menu: 'bmpData',
                //             defaultValue: 0
                //         },
				// 		OSS: {
                //             type: ArgumentType.NUMBER,
                //             menu: 'oss',
                //             defaultValue: 2
                //         }
                //     }
                // },		
				// {
                //     opcode: 'motorSetup',
                //     text: formatMessage({
                //         id: 'sensor.motorSetup',
				// 		default: 'Motor L [PORTL] Motor R [PORTR]',
                //         description: 'setting up the motor pins'
                //     }),
                //     blockType: BlockType.COMMAND,
                //     arguments: {
				// 		PORTL:{
                //             type: ArgumentType.STRING,
                //             menu: 'portMode',
                //             defaultValue: 0
				// 		},
				// 		PORTR:{
                //             type: ArgumentType.STRING,
                //             menu: 'portMode',
                //             defaultValue: 1
				// 		}
                //     }					
				// },
				{
                    opcode: 'motorControl',
                    text: formatMessage({
                        id: 'sensor.motorControl',
						default: 'Motor L [DIRL] [POWERL] Motor R [DIRR] [POWERR]',
                        description: 'controlling the speeds and directions of left and right motor'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
						DIRL:{
                            type: ArgumentType.STRING,
                            menu: 'motorDir',
                            defaultValue: 0
						},
                        POWERL: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 110
                        },
						DIRR:{
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
                        id: 'sensor.motorStop',
                        default: 'Motor Stop',
                        description: 'motor Stop'
                    }),
                    blockType: BlockType.COMMAND,

                }
            ],

            // Optional: define extension-specific menus here.
            menus: {
                dataType: this._buildMenu(DATA_TYPE),
                portMode: this._buildMenu(PORT_MODE),
				motorDir: this._buildMenu(MOTOR_DIR),
				oss: this._buildMenu(OSS),
				bmpData: this._buildMenu(BMP_DATA),
				lcdLine: this._buildMenu(LCD_LINE),
                digitalPin: this._buildMenu(DIGITAL_PIN),
                dht11Type: this._buildMenu(DHT11_TYPE)
            },


        };
    };

    /**
     * Implement myReporter.
     * @param {object} args - the block's arguments.
     * @property {string} MY_ARG - the string value of the argument.
     * @returns {string} a string which includes the block argument value.
     */
    _buildMenu(info) {
      return info.map(function (entry, index) {
        var obj = {};
        obj.text = formatMessage({
          id: entry.id,
          default: entry.name
        }); 
		obj.name = entry.name;
        obj.value = String(index);
        return obj;
      });
    }
	pin_mode(args) {
        return [String(args.PIN), String(args.MODE)];
    }
    ultrasonicDistance(args) {
		return String(args.PORT);
    }
	ultrasonicDistance2W(args) {
		return [String(args.TRIG), String(args.ECHO)];
    }
    dht11(args) {
        return [args.PIN, String(args.TYPE)];
    }
    infraredTrack(args){
        return String(args.PORT);
    }
    temperature(args){
        return String(args.PORT);
    }
    humidity(args){
        return String(args.PORT);
    }
	bmp180(args){
		return [String(args.DATA), String(args.OSS)];
	}
	lcdAddress(args){
        return String(args.VALUE);
	}
    lcdDisplay(args) {
        return String(args.VALUE);
    }
    motorInit() {		 
        return "motor initialized";
    }
	motorSetup(args){
		return [String(args.PORTL), String(args.PORTR)];
	}
    motorStop(args) {
        return "motor pause";
    }
    motorControl(args) {
		return [args.DIRL, args.POWERL, args.DIRR, args.POWERR]
    }
}

module.exports = SensorBlocks;