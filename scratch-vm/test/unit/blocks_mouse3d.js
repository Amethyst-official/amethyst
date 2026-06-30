const test = require('tap').test;
const Mouse3D = require('../../src/blocks/scratch3_mouse3d');

const makeRuntime = () => ({
    ioDevices: {
        mouse: {
            getButtonIsDown: button => button === 2
        }
    },
    requestRedrawCalled: false,
    requestRedraw () {
        this.requestRedrawCalled = true;
    }
});

test('creates default mouse state', t => {
    const runtime = makeRuntime();
    const blocks = new Mouse3D(runtime);

    t.same(runtime.scratch3dMouse, {
        visible: true,
        locked: false,
        mode: 'normal',
        sensitivity: 1,
        thirdPersonDistance: 240,
        deltaX: 0,
        deltaY: 0,
        revision: 0
    });
    t.type(blocks.getPrimitives(), 'object');
    t.end();
});

test('updates cursor visibility and lock state', t => {
    const runtime = makeRuntime();
    const blocks = new Mouse3D(runtime);

    blocks.hideCursor();
    t.equal(runtime.scratch3dMouse.visible, false);
    t.equal(runtime.requestRedrawCalled, true);

    runtime.requestRedrawCalled = false;
    blocks.showCursor();
    t.equal(runtime.scratch3dMouse.visible, true);

    blocks.lockPointer();
    t.equal(runtime.scratch3dMouse.locked, true);

    blocks.unlockPointer();
    t.equal(runtime.scratch3dMouse.locked, false);
    t.equal(runtime.requestRedrawCalled, true);
    t.end();
});

test('sets mouse camera mode and tuning values', t => {
    const runtime = makeRuntime();
    const blocks = new Mouse3D(runtime);

    blocks.setMode({MODE: 'first person'});
    t.equal(runtime.scratch3dMouse.mode, 'first person');

    blocks.setMode({MODE: 'third person'});
    t.equal(runtime.scratch3dMouse.mode, 'third person');

    blocks.setMode({MODE: 'bad mode'});
    t.equal(runtime.scratch3dMouse.mode, 'normal');

    blocks.setSensitivity({SENSITIVITY: 2.5});
    t.equal(runtime.scratch3dMouse.sensitivity, 2.5);

    blocks.setThirdPersonDistance({DISTANCE: 9000});
    t.equal(runtime.scratch3dMouse.thirdPersonDistance, 2000);
    t.end();
});

test('reports mouse deltas and mode', t => {
    const runtime = makeRuntime();
    const blocks = new Mouse3D(runtime);
    runtime.scratch3dMouse.deltaX = -3.25;
    runtime.scratch3dMouse.deltaY = 7.5;
    runtime.scratch3dMouse.mode = 'third person';

    t.equal(blocks.deltaX(), -3.25);
    t.equal(blocks.deltaY(), 7.5);
    t.equal(blocks.mode(), 'third person');
    t.end();
});

test('reports specific mouse buttons', t => {
    const runtime = makeRuntime();
    const blocks = new Mouse3D(runtime);

    t.equal(blocks.buttonDown({BUTTON: 'left'}), false);
    t.equal(blocks.buttonDown({BUTTON: 'right'}), true);
    t.equal(blocks.buttonDown({BUTTON: 'middle'}), false);
    t.end();
});
