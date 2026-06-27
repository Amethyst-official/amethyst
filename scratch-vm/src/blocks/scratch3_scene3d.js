const Cast = require('../util/cast');

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const defaultSceneState = () => ({
    revision: 0,
    camera: {
        position: {x: 260, y: 180, z: 420},
        target: {x: 0, y: 20, z: 0},
        fov: 55
    },
    lighting: {
        ambient: 1.6,
        key: 1.2,
        keyPosition: {x: 180, y: 320, z: 240}
    },
    background: {
        mode: 'sky',
        skyColor: '#8fc6ff',
        groundColor: '#d7eef7',
        imageDataUri: null,
        imageName: null
    }
});

class Scratch3Scene3DBlocks {
    constructor (runtime) {
        this.runtime = runtime;
        this._ensureSceneState();
    }

    getPrimitives () {
        return {
            scene3d_setcameraposition: this.setCameraPosition,
            scene3d_pointcameraat: this.pointCameraAt,
            scene3d_setcamerafov: this.setCameraFov,
            scene3d_setambientlight: this.setAmbientLight,
            scene3d_setkeylight: this.setKeyLight,
            scene3d_setkeylightposition: this.setKeyLightPosition
        };
    }

    _ensureSceneState () {
        if (!this.runtime.scratch3dScene) {
            this.runtime.scratch3dScene = defaultSceneState();
        }
        return this.runtime.scratch3dScene;
    }

    _requestRedraw () {
        this._ensureSceneState().revision++;
        if (this.runtime.requestRedraw) {
            this.runtime.requestRedraw();
        }
    }

    setCameraPosition (args) {
        const scene = this._ensureSceneState();
        scene.camera.position = {
            x: Cast.toNumber(args.X),
            y: Cast.toNumber(args.Y),
            z: Cast.toNumber(args.Z)
        };
        this._requestRedraw();
    }

    pointCameraAt (args) {
        const scene = this._ensureSceneState();
        scene.camera.target = {
            x: Cast.toNumber(args.X),
            y: Cast.toNumber(args.Y),
            z: Cast.toNumber(args.Z)
        };
        this._requestRedraw();
    }

    setCameraFov (args) {
        const scene = this._ensureSceneState();
        scene.camera.fov = clamp(Cast.toNumber(args.FOV), 15, 120);
        this._requestRedraw();
    }

    setAmbientLight (args) {
        const scene = this._ensureSceneState();
        scene.lighting.ambient = clamp(Cast.toNumber(args.BRIGHTNESS), 0, 300) / 100;
        this._requestRedraw();
    }

    setKeyLight (args) {
        const scene = this._ensureSceneState();
        scene.lighting.key = clamp(Cast.toNumber(args.BRIGHTNESS), 0, 300) / 100;
        this._requestRedraw();
    }

    setKeyLightPosition (args) {
        const scene = this._ensureSceneState();
        scene.lighting.keyPosition = {
            x: Cast.toNumber(args.X),
            y: Cast.toNumber(args.Y),
            z: Cast.toNumber(args.Z)
        };
        this._requestRedraw();
    }
}

Scratch3Scene3DBlocks.defaultSceneState = defaultSceneState;

module.exports = Scratch3Scene3DBlocks;
