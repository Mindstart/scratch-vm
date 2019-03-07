const com = require("firmata/lib/com");
const five = require("johnny-five");
const firmata = require("firmata");

let main;
class ComPort {

    /**
     * A BT device session object.  It handles connecting, over web sockets, to
     * BT devices, and reading and writing data to them.
     * @param {Runtime} runtime - the Runtime for sending/receiving GUI update events.
     * @param {object} deviceOptions - the list of options for device discovery.
     * @param {object} connectCallback - a callback for connection.
     * @param {object} messageCallback - a callback for message sending.
     */
    constructor(runtime, connectCallback) {

        this.requestPeripheral(); // only call request device after socket opens
        this.onerror = this._sendError.bind(this, 'ws onerror');
        this.onclose = this._sendError.bind(this, 'ws onclose');
        this._connectCallback = connectCallback;
        this._connected = false;
        this._discoverTimeoutID = null;
        this._runtime = runtime;
        main = this;

    }

    /**
     * Request connection to the device.
     * If the web socket is not yet open, request when the socket promise resolves.
     */
    requestPeripheral() {
        const availablePeripherals = {};
        com.list(function (err, ports) {
			console.log("Ports: "+ports);
            ports.forEach(function(port) {
                port => firmata.isAcceptablePort(port) && port;
                if (port) {
                    const device = {
                        name: port.comName,
                        key: port.comName,
                        peripheralId: port.comName,
                        rssi: port.rssi
                    };
                    availablePeripherals[port.comName] = device;
                };
            });
            main._runtime.emit(main._runtime.constructor.PERIPHERAL_LIST_UPDATE, availablePeripherals);
        });
    }


    /**
     * Try connecting to the input peripheral id, and then call the connect
     * callback if connection is successful.
     * @param {number} id - the id of the peripheral to connect to
     */
    connectPeripheral(id) {
        console.info("enter connectDevice="+ id);
        let connected = true;
        if (typeof board == "undefined") {
            connected = false;
            this._io = new firmata(id);
            const board = new five.Board({
                io: this._io,
                repl: false
            });
            board.on("ready", () => {
                console.log("Arduino board ready " + board);
                this._board = board;
                this._connected = true;
                this._runtime.emit(this._runtime.constructor.PERIPHERAL_CONNECTED);
                this._connectCallback();
                //board.samplingInterval(200);

            });
            board.on("error", () => {
                console.log("Arduino board error " + board);
                connected = false;
				board.transport.close();
				this._runtime.emit(this._runtime.constructor.PERIPHERAL_CONNECTED);
            });

        }
    }

    /**
     * Close the Comport.
     */
    disconnect() {
        console.info("enter disconnectSession ");
        if (this._board)
            this._board.transport.close();
        this._connected = false;
        this._runtime.emit(this._runtime.constructor.PERIPHERAL_CONNECTED);
    }

    /**
     * @return {bool} whether the peripheral is connected.
     */
     isConnected() {
        //console.info("getPeripheralIsConnected=" + this._connected);
        return this._connected;
    }

    getBoard() {
        return this._board;
    }

    _sendError(/* e */) {
        this.disconnectSession();
        // log.error(`BTSession error: ${JSON.stringify(e)}`);
        this._runtime.emit(this._runtime.constructor.PERIPHERAL_ERROR);
    }

    _sendDiscoverTimeout() {
        this._runtime.emit(this._runtime.constructor.PERIPHERAL_SCAN_TIMEOUT);
    }

}

module.exports = ComPort;
