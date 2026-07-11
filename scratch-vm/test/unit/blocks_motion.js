const test = require('tap').test;
const Motion = require('../../src/blocks/scratch3_motion');
const Runtime = require('../../src/engine/runtime');
const Sprite = require('../../src/sprites/sprite.js');
const RenderedTarget = require('../../src/sprites/rendered-target.js');
const compatBlocks = require('../../src/compiler/compat-blocks');

test('getPrimitives', t => {
    const rt = new Runtime();
    const motion = new Motion(rt);
    t.type(motion.getPrimitives(), 'object');
    t.end();
});

test('Coordinates have limited precision', t => {
    const rt = new Runtime();
    const motion = new Motion(rt);
    const sprite = new Sprite(null, rt);
    const target = new RenderedTarget(sprite, rt);
    const util = {target};

    motion.goToXY({X: 0.999999999, Y: 0.999999999}, util);

    t.equals(motion.getX({}, util), 1);
    t.equals(motion.getY({}, util), 1);
    t.end();
});

test('3D coordinates preserve Z while keeping Scratch XY behavior', t => {
    const rt = new Runtime();
    const motion = new Motion(rt);
    const sprite = new Sprite(null, rt);
    const target = new RenderedTarget(sprite, rt);
    const util = {target};

    motion.goToXY({X: 12, Y: 34, Z: -5}, util);

    t.equals(motion.getX({}, util), 12);
    t.equals(motion.getY({}, util), 34);
    t.equals(motion.getZ({}, util), -5);

    motion.changeZ({DZ: 8}, util);
    t.equals(motion.getZ({}, util), 3);

    motion.setZ({Z: 99}, util);
    t.equals(motion.getZ({}, util), 99);
    t.end();
});

test('move sideways steps moves relative to actor direction', t => {
    const rt = new Runtime();
    const motion = new Motion(rt);
    const sprite = new Sprite(null, rt);
    const target = new RenderedTarget(sprite, rt);
    const util = {target};

    target.setDirection(90);
    motion.moveSidewaysSteps({STEPS: 10, DIRECTION: 'right'}, util);
    t.equal(Math.round(target.x), 0);
    t.equal(Math.round(target.y), -10);

    motion.moveSidewaysSteps({STEPS: 5, DIRECTION: 'left'}, util);
    t.equal(Math.round(target.x), 0);
    t.equal(Math.round(target.y), -5);
    t.end();
});

test('3D model actors can move outside the old 2D stage fence', t => {
    const rt = new Runtime();
    const motion = new Motion(rt);
    const sprite = new Sprite(null, rt);
    const target = new RenderedTarget(sprite, rt);
    const requestedPositions = [];
    target.renderer = {
        getFencedPositionOfDrawable: () => [240, 180],
        updateDrawablePosition: (id, position) => requestedPositions.push(position)
    };
    target.drawableID = 1;
    target.modelAssetId = 'model-1';
    const util = {target};

    motion.goToXY({X: 10000, Y: -9000, Z: 8000}, util);

    t.equal(motion.getX({}, util), 10000);
    t.equal(motion.getY({}, util), -9000);
    t.equal(motion.getZ({}, util), 8000);
    t.same(requestedPositions[0], [10000, -9000]);
    t.end();
});

test('glide to XYZ updates Z', t => {
    const rt = new Runtime();
    const motion = new Motion(rt);
    const sprite = new Sprite(null, rt);
    const target = new RenderedTarget(sprite, rt);
    const util = {target, stackFrame: {}};

    motion.glide({SECS: 0, X: 4, Y: 5, Z: 6}, util);

    t.equals(motion.getX({}, util), 4);
    t.equals(motion.getY({}, util), 5);
    t.equals(motion.getZ({}, util), 6);
    t.end();
});

test('3D model metadata is stored on rendered targets', t => {
    const rt = new Runtime();
    const sprite = new Sprite(null, rt);
    const target = new RenderedTarget(sprite, rt);

    t.equal(target.modelAssetId, null);
    t.same(target.modelPartTransforms, {});

    target.setModel3D({
        id: 'model-1',
        name: 'robot.glb',
        dataUri: 'data:model/gltf-binary;base64,abc'
    });

    t.equal(target.modelAssetId, 'model-1');
    t.equal(target.modelAssetName, 'robot.glb');
    t.equal(target.modelAssetDataUri, 'data:model/gltf-binary;base64,abc');
    t.same(target.modelPartTransforms, {});

    const json = target.toJSON();
    t.equal(json.modelAssetId, 'model-1');
    t.equal(json.modelAssetName, 'robot.glb');
    t.equal(json.modelAssetDataUri, 'data:model/gltf-binary;base64,abc');
    t.same(json.modelPartTransforms, {});
    t.end();
});

test('3D actor rotation and model color metadata are stored on rendered targets', t => {
    const rt = new Runtime();
    const motion = new Motion(rt);
    const sprite = new Sprite(null, rt);
    const target = new RenderedTarget(sprite, rt);
    const util = {target};

    motion.turnYaw({DEGREES: 30}, util);
    motion.turnPitch({DEGREES: -15}, util);
    motion.turnRoll({DEGREES: 45}, util);
    target.setModelColor('#ff8844');

    t.equal(target.direction, 120);
    t.equal(target.pitch, -15);
    t.equal(target.roll, 45);
    t.equal(target.modelColor, '#ff8844');

    const clone = target.makeClone();
    t.equal(clone.pitch, -15);
    t.equal(clone.roll, 45);
    t.equal(clone.modelColor, '#ff8844');
    t.end();
});

test('3D actor clones inherit Z and model metadata', t => {
    const rt = new Runtime();
    const sprite = new Sprite(null, rt);
    const target = new RenderedTarget(sprite, rt);
    target.z = 42;
    target.setModel3D({
        id: 'model-1',
        name: 'robot.glb',
        dataUri: 'data:model/gltf-binary;base64,abc'
    });
    target.setModelPartTransform('Arm:2', {
        offset: {x: 1, y: 2, z: 3},
        rotation: {x: 0, y: 45, z: 0},
        scale: {x: 1, y: 1, z: 1},
        pivot: {x: 0, y: 1, z: 0},
        color: '#855cd6'
    });

    const clone = target.makeClone();

    t.equal(clone.z, 42);
    t.equal(clone.modelAssetId, 'model-1');
    t.equal(clone.modelAssetName, 'robot.glb');
    t.equal(clone.modelAssetDataUri, 'data:model/gltf-binary;base64,abc');
    t.same(clone.modelPartTransforms['Arm:2'], {
        offset: {x: 1, y: 2, z: 3},
        rotation: {x: 0, y: 45, z: 0},
        scale: {x: 1, y: 1, z: 1},
        pivot: {x: 0, y: 1, z: 0},
        color: '#855cd6'
    });
    t.not(clone.modelPartTransforms, target.modelPartTransforms);
    t.end();
});

test('3D model costumes can be added and selected like Scratch costumes', t => {
    const rt = new Runtime();
    const sprite = new Sprite(null, rt);
    const target = new RenderedTarget(sprite, rt);

    target.setModel3D({
        id: 'model-1',
        name: 'idle.glb',
        dataUri: 'data:model/gltf-binary;base64,idle'
    });
    target.setModel3D({
        id: 'model-2',
        name: 'run.glb',
        dataUri: 'data:model/gltf-binary;base64,run'
    });

    t.equal(target.modelCostumes.length, 2);
    t.equal(target.currentModelCostume, 1);
    t.equal(target.modelAssetId, 'model-2');

    target.setModelCostume(0);

    t.equal(target.currentModelCostume, 0);
    t.equal(target.modelAssetId, 'model-1');
    t.equal(target.modelAssetName, 'idle.glb');

    const json = target.toJSON();
    t.equal(json.currentModelCostume, 0);
    t.same(json.modelCostumes.map(model => model.name), ['idle.glb', 'run.glb']);
    t.end();
});

test('Amethyst 3D motion blocks are accepted by compiler compatibility layer', t => {
    [
        'motion_changezby',
        'motion_setz',
        'motion_turnpitchby',
        'motion_turnrollby',
        'motion_turnyawby'
    ].forEach(opcode => {
        t.ok(compatBlocks.stacked.includes(opcode), `${opcode} is stack-compatible`);
    });

    t.ok(compatBlocks.inputs.includes('motion_zposition'), 'motion_zposition is reporter-compatible');
    t.end();
});

test('3D actor clones inherit model costume list and pivot metadata', t => {
    const rt = new Runtime();
    const sprite = new Sprite(null, rt);
    const target = new RenderedTarget(sprite, rt);
    target.setModel3D({
        id: 'model-1',
        name: 'idle.glb',
        dataUri: 'data:model/gltf-binary;base64,idle'
    });
    target.setModel3D({
        id: 'model-2',
        name: 'run.glb',
        dataUri: 'data:model/gltf-binary;base64,run'
    });
    target.setModelPivot({x: 5, y: -3, z: 9});

    const clone = target.makeClone();

    t.equal(clone.currentModelCostume, 1);
    t.equal(clone.modelAssetId, 'model-2');
    t.same(clone.modelPivot, {x: 5, y: -3, z: 9});
    t.same(clone.modelCostumes.map(model => model.id), ['model-1', 'model-2']);
    t.not(clone.modelCostumes, target.modelCostumes);
    t.not(clone.modelPivot, target.modelPivot);
    t.end();
});
