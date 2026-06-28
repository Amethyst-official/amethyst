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
