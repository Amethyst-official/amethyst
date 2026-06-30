const Cast = require('../util/cast');

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const defaultMouseState = () => ({
    visible: true,
    locked: false,
    mode: 'normal',
    sensitivity: 1,
    thirdPersonDistance: 240,
    deltaX: 0,
    deltaY: 0,
    revision: 0
});

class Scratch3Mouse3DBlocks {
    constructor (runtime) {
        this.runtime = runtime;
        this._ensureMouseState();
    }

    getPrimitives () {
        return {
            mouse_showcursor: this.showCursor,
            mouse_hidecursor: this.hideCursor,
            mouse_setmode: this.setMode,
            mouse_setsensitivity: this.setSensitivity,
            mouse_setthirdpersondistance: this.setThirdPersonDistance,
            mouse_lock: this.lockPointer,
            mouse_unlock: this.unlockPointer,
            mouse_buttondown: this.buttonDown,
            mouse_deltax: this.deltaX,
            mouse_deltay: this.deltaY,
            mouse_mode: this.mode
        };
    }

    getMonitored () {
        return {
            mouse_deltax: {
                getId: () => 'mouse_deltax'
            },
            mouse_deltay: {
                getId: () => 'mouse_deltay'
            },
            mouse_mode: {
                getId: () => 'mouse_mode'
            }
        };
    }

    _ensureMouseState () {
        if (!this.runtime.scratch3dMouse) {
            this.runtime.scratch3dMouse = defaultMouseState();
        }
        return this.runtime.scratch3dMouse;
    }

    _requestRedraw () {
        this._ensureMouseState().revision++;
        if (this.runtime.requestRedraw) {
            this.runtime.requestRedraw();
        }
    }

    showCursor () {
        this._ensureMouseState().visible = true;
        this._requestRedraw();
    }

    hideCursor () {
        this._ensureMouseState().visible = false;
        this._requestRedraw();
    }

    setMode (args) {
        const requested = Cast.toString(args.MODE).toLowerCase();
        const mode = ['normal', 'first person', 'third person'].includes(requested) ? requested : 'normal';
        this._ensureMouseState().mode = mode;
        this._requestRedraw();
    }

    setSensitivity (args) {
        this._ensureMouseState().sensitivity = clamp(Cast.toNumber(args.SENSITIVITY), 0.05, 20);
        this._requestRedraw();
    }

    setThirdPersonDistance (args) {
        this._ensureMouseState().thirdPersonDistance = clamp(Cast.toNumber(args.DISTANCE), 10, 2000);
        this._requestRedraw();
    }

    lockPointer () {
        this._ensureMouseState().locked = true;
        this._requestRedraw();
    }

    unlockPointer () {
        this._ensureMouseState().locked = false;
        this._requestRedraw();
    }

    buttonDown (args) {
        const buttonName = Cast.toString(args.BUTTON).toLowerCase();
        const button = {
            left: 0,
            middle: 1,
            right: 2
        }[buttonName];
        if (typeof button !== 'number' || !this.runtime.ioDevices || !this.runtime.ioDevices.mouse) return false;
        return this.runtime.ioDevices.mouse.getButtonIsDown(button);
    }

    deltaX () {
        return this._ensureMouseState().deltaX;
    }

    deltaY () {
        return this._ensureMouseState().deltaY;
    }

    mode () {
        return this._ensureMouseState().mode;
    }
}

Scratch3Mouse3DBlocks.defaultMouseState = defaultMouseState;

module.exports = Scratch3Mouse3DBlocks;
