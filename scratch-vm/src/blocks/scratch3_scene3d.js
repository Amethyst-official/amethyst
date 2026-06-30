const Cast = require('../util/cast');

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const degToRad = degrees => degrees * Math.PI / 180;
const normalize = vector => {
    const length = Math.sqrt(
        (vector.x * vector.x) +
        (vector.y * vector.y) +
        (vector.z * vector.z)
    ) || 1;
    return {
        x: vector.x / length,
        y: vector.y / length,
        z: vector.z / length
    };
};

const environmentPresets = {
    sunny: {
        skyColor: '#8fc6ff',
        groundColor: '#d7eef7',
        fogAmount: 0,
        ambient: 160,
        sun: 120,
        sunColor: '#ffffff',
        azimuth: 35,
        elevation: 50
    },
    sunset: {
        skyColor: '#ff9c66',
        groundColor: '#6f6a55',
        fogAmount: 12,
        ambient: 95,
        sun: 140,
        sunColor: '#ffd08a',
        azimuth: 250,
        elevation: 14
    },
    night: {
        skyColor: '#10142a',
        groundColor: '#182136',
        fogAmount: 18,
        ambient: 45,
        sun: 55,
        sunColor: '#9fb7ff',
        azimuth: 210,
        elevation: 55
    },
    space: {
        skyColor: '#03040a',
        groundColor: '#171722',
        fogAmount: 0,
        ambient: 70,
        sun: 95,
        sunColor: '#d8e7ff',
        azimuth: 15,
        elevation: 65
    },
    studio: {
        skyColor: '#f3f4f8',
        groundColor: '#d9dce6',
        fogAmount: 0,
        ambient: 180,
        sun: 95,
        sunColor: '#ffffff',
        azimuth: 45,
        elevation: 60
    }
};

const defaultSceneState = () => ({
    revision: 0,
    currentBackdrop: 0,
    camera: {
        position: {x: 260, y: 180, z: 420},
        target: {x: 0, y: 20, z: 0},
        fov: 55,
        smoothingDuration: 0,
        follow: {
            enabled: false,
            targetId: null,
            distance: 240,
            height: 35
        }
    },
    lighting: {
        ambient: 1.6,
        key: 1.2,
        keyColor: '#ffffff',
        keyPosition: {x: 180, y: 320, z: 240}
    },
    background: {
        mode: 'sky',
        skyColor: '#8fc6ff',
        groundColor: '#d7eef7',
        fogAmount: 0,
        imageDataUri: null,
        imageName: null
    },
    backdrops: []
});

const cloneScenePart = value => JSON.parse(JSON.stringify(value));

const makeBackdrop = (name, scene) => ({
    id: `scene-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`,
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
            scene3d_turncameraupdownby: this.turnCameraUpDownBy,
            scene3d_turncameraleftrightby: this.turnCameraLeftRightBy,
            scene3d_setcamerafov: this.setCameraFov,
            scene3d_setcamerasmoothingduration: this.setCameraSmoothingDuration,
            scene3d_setambientlight: this.setAmbientLight,
            scene3d_setkeylight: this.setKeyLight,
            scene3d_setsuncolor: this.setSunColor,
            scene3d_setsunangle: this.setSunAngle,
            scene3d_setkeylightposition: this.setKeyLightPosition,
            scene3d_addbackdrop: this.addBackdrop,
            scene3d_switchbackdrop: this.switchBackdrop,
            scene3d_nextbackdrop: this.nextBackdrop,
            scene3d_setskycolor: this.setSkyColor,
            scene3d_setgroundcolor: this.setGroundColor,
            scene3d_setfogamount: this.setFogAmount,
            scene3d_setenvironmentpreset: this.setEnvironmentPreset,
            scene3d_followthisactor: this.followThisActor,
            scene3d_stopfollowing: this.stopFollowing,
            scene3d_setfollowdistance: this.setFollowDistance,
            scene3d_setfollowheight: this.setFollowHeight
        };
    }

    _ensureSceneState () {
        if (!this.runtime.scratch3dScene) {
            this.runtime.scratch3dScene = defaultSceneState();
        }
        const scene = this.runtime.scratch3dScene;
        if (!scene.background) scene.background = defaultSceneState().background;
        if (typeof scene.background.fogAmount !== 'number') {
            scene.background.fogAmount = defaultSceneState().background.fogAmount;
        }
        if (!scene.camera) scene.camera = defaultSceneState().camera;
        if (!scene.camera.follow) scene.camera.follow = defaultSceneState().camera.follow;
        if (typeof scene.camera.smoothingDuration !== 'number') {
            scene.camera.smoothingDuration = defaultSceneState().camera.smoothingDuration;
        }
        if (!scene.lighting) scene.lighting = defaultSceneState().lighting;
        if (!scene.lighting.keyColor) scene.lighting.keyColor = defaultSceneState().lighting.keyColor;
        if (!Array.isArray(scene.backdrops) || scene.backdrops.length === 0) {
            scene.backdrops = [makeBackdrop('Scene 1', scene)];
        }
        scene.currentBackdrop = clamp(Math.round(scene.currentBackdrop || 0), 0, scene.backdrops.length - 1);
        const active = scene.backdrops[scene.currentBackdrop];
        active.background = active.background || cloneScenePart(scene.background);
        if (typeof active.background.fogAmount !== 'number') {
            active.background.fogAmount = scene.background.fogAmount || 0;
        }
        active.camera = active.camera || cloneScenePart(scene.camera);
        active.camera.follow = active.camera.follow || cloneScenePart(defaultSceneState().camera.follow);
        if (typeof active.camera.smoothingDuration !== 'number') {
            active.camera.smoothingDuration = scene.camera.smoothingDuration || 0;
        }
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

    turnCameraUpDownBy (args) {
        const scene = this._ensureSceneState();
        const degrees = Cast.toNumber(args.DEGREES);
        const position = scene.camera.position;
        const target = scene.camera.target;
        const look = {
            x: target.x - position.x,
            y: target.y - position.y,
            z: target.z - position.z
        };
        const distance = Math.sqrt((look.x * look.x) + (look.y * look.y) + (look.z * look.z)) || 1;
        const forward = normalize(look);
        const right = normalize({
            x: -forward.z,
            y: 0,
            z: forward.x
        });
        const radians = degToRad(degrees);
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        const cross = {
            x: (right.y * forward.z) - (right.z * forward.y),
            y: (right.z * forward.x) - (right.x * forward.z),
            z: (right.x * forward.y) - (right.y * forward.x)
        };
        const rotated = normalize({
            x: (forward.x * cos) + (cross.x * sin),
            y: (forward.y * cos) + (cross.y * sin),
            z: (forward.z * cos) + (cross.z * sin)
        });
        scene.camera.target = {
            x: position.x + (rotated.x * distance),
            y: position.y + (rotated.y * distance),
            z: position.z + (rotated.z * distance)
        };
        scene.backdrops[scene.currentBackdrop].camera = scene.camera;
        this._requestRedraw();
    }

    turnCameraLeftRightBy (args) {
        const scene = this._ensureSceneState();
        const degrees = Cast.toNumber(args.DEGREES);
        const position = scene.camera.position;
        const target = scene.camera.target;
        const look = {
            x: target.x - position.x,
            y: target.y - position.y,
            z: target.z - position.z
        };
        const radians = degToRad(degrees);
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        scene.camera.target = {
            x: position.x + (look.x * cos) - (look.z * sin),
            y: target.y,
            z: position.z + (look.x * sin) + (look.z * cos)
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

    setCameraSmoothingDuration (args) {
        const scene = this._ensureSceneState();
        scene.camera.smoothingDuration = clamp(Cast.toNumber(args.SECONDS), 0, 10);
        scene.backdrops[scene.currentBackdrop].camera = scene.camera;
        this._requestRedraw();
    }

    followThisActor (args, util) {
        const scene = this._ensureSceneState();
        if (!util || !util.target || util.target.isStage) return;
        scene.camera.follow = {
            enabled: true,
            targetId: util.target.id,
            distance: scene.camera.follow.distance || 240,
            height: scene.camera.follow.height || 35
        };
        scene.backdrops[scene.currentBackdrop].camera = scene.camera;
        this._requestRedraw();
    }

    stopFollowing () {
        const scene = this._ensureSceneState();
        scene.camera.follow.enabled = false;
        scene.backdrops[scene.currentBackdrop].camera = scene.camera;
        this._requestRedraw();
    }

    setFollowDistance (args) {
        const scene = this._ensureSceneState();
        scene.camera.follow.distance = clamp(Cast.toNumber(args.DISTANCE), 10, 5000);
        scene.backdrops[scene.currentBackdrop].camera = scene.camera;
        this._requestRedraw();
    }

    setFollowHeight (args) {
        const scene = this._ensureSceneState();
        scene.camera.follow.height = clamp(Cast.toNumber(args.HEIGHT), -1000, 5000);
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

    setGroundColor (args) {
        const scene = this._ensureSceneState();
        scene.background.groundColor = Cast.toString(args.COLOR);
        scene.backdrops[scene.currentBackdrop].background = scene.background;
        this._requestRedraw();
    }

    setFogAmount (args) {
        const scene = this._ensureSceneState();
        scene.background.fogAmount = clamp(Cast.toNumber(args.AMOUNT), 0, 100);
        scene.backdrops[scene.currentBackdrop].background = scene.background;
        this._requestRedraw();
    }

    setSunColor (args) {
        const scene = this._ensureSceneState();
        scene.lighting.keyColor = Cast.toString(args.COLOR);
        this._requestRedraw();
    }

    setSunAngle (args) {
        const scene = this._ensureSceneState();
        const azimuth = degToRad(Cast.toNumber(args.AZIMUTH));
        const elevation = degToRad(clamp(Cast.toNumber(args.ELEVATION), -15, 90));
        const radius = 420;
        const horizontal = Math.cos(elevation) * radius;
        scene.lighting.keyPosition = {
            x: Math.sin(azimuth) * horizontal,
            y: Math.sin(elevation) * radius,
            z: Math.cos(azimuth) * horizontal
        };
        this._requestRedraw();
    }

    setEnvironmentPreset (args) {
        const scene = this._ensureSceneState();
        const preset = environmentPresets[Cast.toString(args.PRESET).toLowerCase()];
        if (!preset) return;
        scene.background.mode = 'sky';
        scene.background.skyColor = preset.skyColor;
        scene.background.groundColor = preset.groundColor;
        scene.background.fogAmount = preset.fogAmount;
        scene.backdrops[scene.currentBackdrop].background = scene.background;
        scene.lighting.ambient = preset.ambient / 100;
        scene.lighting.key = preset.sun / 100;
        scene.lighting.keyColor = preset.sunColor;
        this.setSunAngle({
            AZIMUTH: preset.azimuth,
            ELEVATION: preset.elevation
        });
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
