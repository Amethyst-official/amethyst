const test = require('tap').test;
const Sound = require('../../src/blocks/scratch3_sound');
const compatBlocks = require('../../src/compiler/compat-blocks');
let playedSound;

const blocks = new Sound();
const util = {
    target: {
        sprite: {
            sounds: [
                {name: 'first name', soundId: 'first soundId'},
                {name: 'second name', soundId: 'second soundId'},
                {name: 'third name', soundId: 'third soundId'},
                {name: '6', soundId: 'fourth soundId'}
            ],
            soundBank: {
                playSound: (target, soundId) => (playedSound = soundId)
            }
        }
    }
};

test('playSound with a name string works', t => {
    const args = {SOUND_MENU: 'second name'};
    blocks.playSound(args, util);
    t.strictEqual(playedSound, 'second soundId');
    t.end();
});

test('playSound with a number string works 1-indexed', t => {
    let args = {SOUND_MENU: '5'};
    blocks.playSound(args, util);
    t.strictEqual(playedSound, 'first soundId');

    args = {SOUND_MENU: '1'};
    blocks.playSound(args, util);
    t.strictEqual(playedSound, 'first soundId');

    args = {SOUND_MENU: '0'};
    blocks.playSound(args, util);
    t.strictEqual(playedSound, 'fourth soundId');
    t.end();
});

test('playSound with a number works 1-indexed', t => {
    let args = {SOUND_MENU: 5};
    blocks.playSound(args, util);
    t.strictEqual(playedSound, 'first soundId');

    args = {SOUND_MENU: 1};
    blocks.playSound(args, util);
    t.strictEqual(playedSound, 'first soundId');

    args = {SOUND_MENU: 0};
    blocks.playSound(args, util);
    t.strictEqual(playedSound, 'fourth soundId');
    t.end();
});

test('playSound prioritizes sound index if given a number', t => {
    const args = {SOUND_MENU: 6};
    blocks.playSound(args, util);
    // Ignore the sound named '6', wrapClamp to the second instead
    t.strictEqual(playedSound, 'second soundId');
    t.end();
});

test('playSound prioritizes sound name if given a string', t => {
    const args = {SOUND_MENU: '6'};
    blocks.playSound(args, util);
    // Use the sound named '6', which is the fourth
    t.strictEqual(playedSound, 'fourth soundId');
    t.end();
});

test('stereo pan blocks update and report left-right audio position', t => {
    const runtime = {
        runtimeOptions: {miscLimits: true},
        on: () => {},
        requestRedraw: () => {}
    };
    const soundBlocks = new Sound(runtime);
    let syncedTarget = null;
    const target = {
        _customState: {},
        getCustomState (key) {
            return this._customState[key];
        },
        setCustomState (key, value) {
            this._customState[key] = value;
        },
        sprite: {
            soundBank: {
                setEffects: targetWithEffects => {
                    syncedTarget = targetWithEffects;
                }
            }
        }
    };
    const soundUtil = {target};

    soundBlocks.setStereoPan({PAN: -50}, soundUtil);
    t.equal(soundBlocks.getStereoPan({}, soundUtil), -50);
    t.equal(target.soundEffects.pan, -50);
    t.equal(syncedTarget, target);

    soundBlocks.changeStereoPan({PAN: 175}, soundUtil);
    t.equal(soundBlocks.getStereoPan({}, soundUtil), 100);

    soundBlocks.clearEffects({}, soundUtil);
    t.equal(soundBlocks.getStereoPan({}, soundUtil), 0);
    t.end();
});

test('stereo pan blocks are accepted by compiler compatibility layer', t => {
    [
        'sound_changestereopanby',
        'sound_setstereopan'
    ].forEach(opcode => {
        t.ok(compatBlocks.stacked.includes(opcode), `${opcode} is stack-compatible`);
    });

    t.ok(compatBlocks.inputs.includes('sound_stereopan'), 'sound_stereopan is reporter-compatible');
    t.end();
});
