const test = require('tap').test;
const Scene3D = require('../../src/blocks/scratch3_scene3d');
const Runtime = require('../../src/engine/runtime');

test('3D scene primitives update camera and lighting state', t => {
    const rt = new Runtime();
    const scene3d = new Scene3D(rt);

    scene3d.setCameraPosition({X: 10, Y: 20, Z: 30});
    t.same(rt.scratch3dScene.camera.position, {x: 10, y: 20, z: 30});

    scene3d.pointCameraAt({X: -5, Y: 6, Z: 7});
    t.same(rt.scratch3dScene.camera.target, {x: -5, y: 6, z: 7});

    scene3d.setCameraPosition({X: 0, Y: 0, Z: 10});
    scene3d.pointCameraAt({X: 0, Y: 0, Z: 0});
    scene3d.turnCameraUpDownBy({DEGREES: 45});
    t.ok(rt.scratch3dScene.camera.target.y > 7);
    t.ok(rt.scratch3dScene.camera.target.z > 2);

    scene3d.setCameraFov({FOV: 70});
    t.equal(rt.scratch3dScene.camera.fov, 70);

    scene3d.setAmbientLight({BRIGHTNESS: 45});
    t.equal(rt.scratch3dScene.lighting.ambient, 0.45);

    scene3d.setKeyLight({BRIGHTNESS: 150});
    t.equal(rt.scratch3dScene.lighting.key, 1.5);

    scene3d.setKeyLightPosition({X: 1, Y: 2, Z: 3});
    t.same(rt.scratch3dScene.lighting.keyPosition, {x: 1, y: 2, z: 3});

    t.end();
});

test('3D scene camera fov and lighting brightness are clamped', t => {
    const rt = new Runtime();
    const scene3d = new Scene3D(rt);

    scene3d.setCameraFov({FOV: -100});
    t.equal(rt.scratch3dScene.camera.fov, 15);

    scene3d.setCameraFov({FOV: 200});
    t.equal(rt.scratch3dScene.camera.fov, 120);

    scene3d.setAmbientLight({BRIGHTNESS: -100});
    t.equal(rt.scratch3dScene.lighting.ambient, 0);

    scene3d.setKeyLight({BRIGHTNESS: 500});
    t.equal(rt.scratch3dScene.lighting.key, 3);

    t.end();
});

test('3D scene supports multiple switchable backdrop presets', t => {
    const rt = new Runtime();
    const scene3d = new Scene3D(rt);

    scene3d.addBackdrop({NAME: 'Night'});
    scene3d.switchBackdrop({BACKDROP: 'Night'});
    scene3d.setCameraPosition({X: 1, Y: 2, Z: 3});
    scene3d.setSkyColor({COLOR: '#001122'});

    t.equal(rt.scratch3dScene.currentBackdrop, 1);
    t.equal(rt.scratch3dScene.backdrops.length, 2);
    t.equal(rt.scratch3dScene.backdrops[1].name, 'Night');
    t.same(rt.scratch3dScene.backdrops[1].camera.position, {x: 1, y: 2, z: 3});
    t.equal(rt.scratch3dScene.backdrops[1].background.skyColor, '#001122');

    scene3d.nextBackdrop();
    t.equal(rt.scratch3dScene.currentBackdrop, 0);
    t.end();
});

test('3D scene camera can follow the current actor', t => {
    const rt = new Runtime();
    const scene3d = new Scene3D(rt);
    const util = {
        target: {
            id: 'actor-1',
            isStage: false
        }
    };

    scene3d.followThisActor({}, util);
    t.same(rt.scratch3dScene.camera.follow, {
        enabled: true,
        targetId: 'actor-1',
        distance: 240,
        height: 35
    });

    scene3d.setFollowDistance({DISTANCE: 500});
    scene3d.setFollowHeight({HEIGHT: 80});
    t.equal(rt.scratch3dScene.camera.follow.distance, 500);
    t.equal(rt.scratch3dScene.camera.follow.height, 80);

    scene3d.stopFollowing();
    t.equal(rt.scratch3dScene.camera.follow.enabled, false);
    t.end();
});

test('3D scene camera can turn left and right around its position', t => {
    const rt = new Runtime();
    const scene3d = new Scene3D(rt);

    scene3d.setCameraPosition({X: 0, Y: 0, Z: 10});
    scene3d.pointCameraAt({X: 0, Y: 0, Z: 0});
    scene3d.turnCameraLeftRightBy({DEGREES: 90});

    t.ok(Math.abs(rt.scratch3dScene.camera.target.x - 10) < 0.001);
    t.ok(Math.abs(rt.scratch3dScene.camera.target.y) < 0.001);
    t.ok(Math.abs(rt.scratch3dScene.camera.target.z - 10) < 0.001);
    t.end();
});

test('3D scene camera smoothing duration is stored and clamped', t => {
    const rt = new Runtime();
    const scene3d = new Scene3D(rt);

    scene3d.setCameraSmoothingDuration({SECONDS: 0.35});
    t.equal(rt.scratch3dScene.camera.smoothingDuration, 0.35);

    scene3d.setCameraSmoothingDuration({SECONDS: -5});
    t.equal(rt.scratch3dScene.camera.smoothingDuration, 0);

    scene3d.setCameraSmoothingDuration({SECONDS: 99});
    t.equal(rt.scratch3dScene.camera.smoothingDuration, 10);
    t.end();
});

test('3D scene environment blocks update background and sunlight state', t => {
    const rt = new Runtime();
    const scene3d = new Scene3D(rt);

    scene3d.setSkyColor({COLOR: '#112233'});
    scene3d.setGroundColor({COLOR: '#445566'});
    scene3d.setFogAmount({AMOUNT: 35});
    scene3d.setSunColor({COLOR: '#ffeeaa'});
    scene3d.setSunAngle({AZIMUTH: 90, ELEVATION: 45});
    scene3d.setAmbientLight({BRIGHTNESS: 80});

    t.equal(rt.scratch3dScene.background.skyColor, '#112233');
    t.equal(rt.scratch3dScene.background.groundColor, '#445566');
    t.equal(rt.scratch3dScene.background.fogAmount, 35);
    t.equal(rt.scratch3dScene.lighting.keyColor, '#ffeeaa');
    t.equal(rt.scratch3dScene.lighting.ambient, 0.8);
    t.ok(Math.abs(rt.scratch3dScene.lighting.keyPosition.x - 296.984) < 0.01);
    t.ok(Math.abs(rt.scratch3dScene.lighting.keyPosition.y - 296.984) < 0.01);
    t.ok(Math.abs(rt.scratch3dScene.lighting.keyPosition.z) < 0.01);
    t.end();
});

test('3D scene environment presets apply kid-friendly world settings', t => {
    const rt = new Runtime();
    const scene3d = new Scene3D(rt);

    scene3d.setEnvironmentPreset({PRESET: 'night'});
    t.equal(rt.scratch3dScene.background.skyColor, '#10142a');
    t.equal(rt.scratch3dScene.background.groundColor, '#182136');
    t.equal(rt.scratch3dScene.background.fogAmount, 18);
    t.equal(rt.scratch3dScene.lighting.keyColor, '#9fb7ff');
    t.equal(rt.scratch3dScene.lighting.ambient, 0.45);
    t.equal(rt.scratch3dScene.lighting.key, 0.55);

    scene3d.setEnvironmentPreset({PRESET: 'unknown'});
    t.equal(rt.scratch3dScene.background.skyColor, '#10142a');
    t.end();
});
