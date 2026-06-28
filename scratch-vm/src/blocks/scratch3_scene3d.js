const Cast = require('../util/cast');

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const defaultSceneState = () => ({
    revision: 0,
    currentBackdrop: 0,
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
    },
    backdrops: []
});

const cloneScenePart = value => JSON.parse(JSON.stringify(value));

const makeBackdrop = (name, scene) => ({
    id: `scene-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: name || `Scene ${(scene.backdrops && scene.backdrops.length + 1) || 1}`,
    background: cloneScenePart(scene.background),
    camera: cloneScenePart(scene.camera)
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
            scene3d_setkeylightposition: this.setKeyLightPosition,
            scene3d_addbackdrop: this.addBackdrop,
            scene3d_switchbackdrop: this.switchBackdrop,
            scene3d_nextbackdrop: this.nextBackdrop,
            scene3d_setskycolor: this.setSkyColor
        };
    }

    _ensureSceneState () {
        if (!this.runtime.scratch3dScene) {
            this.runtime.scratch3dScene = defaultSceneState();
        }
        const scene = this.runtime.scratch3dScene;
        if (!scene.background) scene.background = defaultSceneState().background;
        if (!scene.camera) scene.camera = defaultSceneState().camera;
        if (!scene.lighting) scene.lighting = defaultSceneState().lighting;
        if (!Array.isArray(scene.backdrops) || scene.backdrops.length === 0) {
            scene.backdrops = [makeBackdrop('Scene 1', scene)];
        }
        scene.currentBackdrop = clamp(Math.round(scene.currentBackdrop || 0), 0, scene.backdrops.length - 1);
        const active = scene.backdrops[scene.currentBackdrop];
        active.background = active.background || cloneScenePart(scene.background);
        active.camera = active.camera || cloneScenePart(scene.camera);
        scene.background = active.background;
        scene.camera = active.camera;
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
        scene.backdrops[scene.currentBackdrop].camera = scene.camera;
        this._requestRedraw();
    }

    pointCameraAt (args) {
        const scene = this._ensureSceneState();
        scene.camera.target = {
            x: Cast.toNumber(args.X),
            y: Cast.toNumber(args.Y),
            z: Cast.toNumber(args.Z)
        };
        scene.backdrops[scene.currentBackdrop].camera = scene.camera;
        this._requestRedraw();
    }

    setCameraFov (args) {
        const scene = this._ensureSceneState();
        scene.camera.fov = clamp(Cast.toNumber(args.FOV), 15, 120);
        scene.backdrops[scene.currentBackdrop].camera = scene.camera;
        this._requestRedraw();
    }

    setSkyColor (args) {
        const scene = this._ensureSceneState();
        scene.background.mode = 'sky';
        scene.background.skyColor = Cast.toString(args.COLOR);
        scene.backdrops[scene.currentBackdrop].background = scene.background;
        this._requestRedraw();
    }

    addBackdrop (args) {
        const scene = this._ensureSceneState();
        scene.backdrops.push(makeBackdrop(Cast.toString(args.NAME), scene));
        scene.currentBackdrop = scene.backdrops.length - 1;
        scene.background = scene.backdrops[scene.currentBackdrop].background;
        scene.camera = scene.backdrops[scene.currentBackdrop].camera;
        this._requestRedraw();
    }

    switchBackdrop (args) {
        const scene = this._ensureSceneState();
        const requested = Cast.toString(args.BACKDROP);
        const numeric = Cast.toNumber(requested);
        let index = scene.backdrops.findIndex(backdrop => backdrop.name === requested);
        if (index < 0 && Number.isFinite(numeric)) {
            index = numeric - 1;
        }
        if (index < 0) return;
        scene.currentBackdrop = clamp(index, 0, scene.backdrops.length - 1);
        scene.background = scene.backdrops[scene.currentBackdrop].background;
        scene.camera = scene.backdrops[scene.currentBackdrop].camera;
        this.runtime.startHats('event_whenbackdropswitchesto', {
            BACKDROP: scene.backdrops[scene.currentBackdrop].name
        });
        this._requestRedraw();
    }

    nextBackdrop () {
        const scene = this._ensureSceneState();
        scene.currentBackdrop = (scene.currentBackdrop + 1) % scene.backdrops.length;
        scene.background = scene.backdrops[scene.currentBackdrop].background;
        scene.camera = scene.backdrops[scene.currentBackdrop].camera;
        this.runtime.startHats('event_whenbackdropswitchesto', {
            BACKDROP: scene.backdrops[scene.currentBackdrop].name
        });
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
