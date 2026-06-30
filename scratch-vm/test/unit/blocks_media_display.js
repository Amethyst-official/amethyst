const test = require('tap').test;
const MediaDisplay = require('../../src/blocks/scratch3_media_display');
const compatBlocks = require('../../src/compiler/compat-blocks');

const makeRuntime = () => ({
    requestRedrawCalled: false,
    requestTargetsUpdateCalled: false,
    requestRedraw () {
        this.requestRedrawCalled = true;
    },
    requestTargetsUpdate () {
        this.requestTargetsUpdateCalled = true;
    }
});

const makeTarget = () => ({
    id: 'actor-1',
    isStage: false,
    visible: true
});

test('sets actor media image and size', t => {
    const runtime = makeRuntime();
    const blocks = new MediaDisplay(runtime);
    const target = makeTarget();

    blocks.setImageUrl({URL: 'https://example.com/cat.png'}, {target});
    blocks.setMediaSize({WIDTH: 320, HEIGHT: 180}, {target});

    t.same(target.mediaDisplay, {
        type: 'image',
        source: 'https://example.com/cat.png',
        name: '',
        width: 320,
        height: 180,
        playing: false,
        revision: 2
    });
    t.equal(runtime.requestRedrawCalled, true);
    t.equal(runtime.requestTargetsUpdateCalled, true);
    t.end();
});

test('sets actor media video playback state', t => {
    const runtime = makeRuntime();
    const blocks = new MediaDisplay(runtime);
    const target = makeTarget();

    blocks.setVideoUrl({URL: 'https://example.com/movie.mp4'}, {target});
    blocks.play({}, {target});
    t.equal(target.mediaDisplay.type, 'video');
    t.equal(target.mediaDisplay.playing, true);

    blocks.pause({}, {target});
    t.equal(target.mediaDisplay.playing, false);

    blocks.restart({}, {target});
    t.equal(target.mediaDisplay.playing, true);
    t.equal(target.mediaDisplay.restartToken, 1);
    t.end();
});

test('media commands ignore the stage', t => {
    const runtime = makeRuntime();
    const blocks = new MediaDisplay(runtime);
    const target = {isStage: true};

    blocks.setImageUrl({URL: 'https://example.com/nope.png'}, {target});

    t.equal(target.mediaDisplay, undefined);
    t.equal(runtime.requestRedrawCalled, false);
    t.end();
});

test('media display blocks are accepted by compiler compatibility layer', t => {
    [
        'media_duration',
        'media_loaded',
        'media_pause',
        'media_play',
        'media_restart',
        'media_setimageurl',
        'media_setsize',
        'media_setuploaded',
        'media_setvideourl',
        'media_time'
    ].forEach(opcode => {
        t.ok(compatBlocks.stacked.includes(opcode), `${opcode} is stack-compatible`);
    });

    [
        'media_duration',
        'media_loaded',
        'media_time'
    ].forEach(opcode => {
        t.ok(compatBlocks.inputs.includes(opcode), `${opcode} is reporter-compatible`);
    });
    t.end();
});
