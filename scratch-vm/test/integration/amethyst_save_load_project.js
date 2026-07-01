const test = require('tap').test;
const VirtualMachine = require('../../src/index');

const tinyModelDataUri = 'data:model/gltf-binary;base64,Z2xi';
const blankSvgCostume = {
    assetId: 'cd21514d0531fdffb22204e0ec5ed84a',
    name: 'blank',
    md5ext: 'cd21514d0531fdffb22204e0ec5ed84a.svg',
    dataFormat: 'svg',
    bitmapResolution: 1,
    rotationCenterX: 0,
    rotationCenterY: 0
};

test('Amethyst projects preserve 3D actor and scene data through zipped save/load', async t => {
    const vm = new VirtualMachine();

    await vm.loadProject({
        targets: [
            {
                isStage: true,
                name: 'Stage',
                variables: {},
                lists: {},
                broadcasts: {},
                blocks: {},
                comments: {},
                currentCostume: 0,
                costumes: [blankSvgCostume],
                sounds: [],
                volume: 100,
                layerOrder: 0,
                tempo: 60,
                videoTransparency: 50,
                videoState: 'on'
            },
            {
                isStage: false,
                name: 'Actor',
                variables: {},
                lists: {},
                broadcasts: {},
                blocks: {},
                comments: {},
                currentCostume: 0,
                costumes: [blankSvgCostume],
                sounds: [],
                volume: 100,
                layerOrder: 1,
                visible: true,
                x: 12,
                y: 34,
                z: 56,
                size: 125,
                direction: 45,
                pitch: 12,
                roll: 8,
                draggable: false,
                rotationStyle: 'all around',
                modelAssetId: 'model-one',
                modelAssetName: 'Robot.glb',
                modelAssetDataUri: tinyModelDataUri,
                modelCostumes: [
                    {
                        id: 'model-one',
                        name: 'Robot.glb',
                        dataUri: tinyModelDataUri,
                        partTransforms: {
                            Head: {
                                position: {x: 1, y: 2, z: 3},
                                rotation: {x: 4, y: 5, z: 6},
                                scale: {x: 1.1, y: 1.2, z: 1.3},
                                color: '#8169ff'
                            }
                        }
                    }
                ],
                currentModelCostume: 0,
                modelPivot: {x: 7, y: 8, z: 9},
                modelColor: '#8169ff',
                modelPartTransforms: {
                    Head: {
                        position: {x: 1, y: 2, z: 3},
                        rotation: {x: 4, y: 5, z: 6},
                        scale: {x: 1.1, y: 1.2, z: 1.3},
                        color: '#8169ff'
                    }
                }
            }
        ],
        monitors: [],
        extensions: [],
        meta: {
            semver: '3.0.0',
            vm: '0.2.0',
            agent: 'Amethyst'
        },
        scratch3dScene: {
            revision: 7,
            currentBackdrop: 0,
            background: {
                mode: 'sky',
                skyColor: '#112233',
                groundColor: '#445566',
                fogAmount: 0.4
            },
            camera: {
                position: {x: 10, y: 20, z: 30},
                target: {x: 0, y: 1, z: 2},
                fov: 60,
                smoothingDuration: 0.25
            },
            lighting: {
                ambient: 1.5,
                key: 2,
                keyColor: '#abcdef',
                keyPosition: {x: 100, y: 200, z: 300}
            }
        }
    });

    const savedProject = await vm.saveProjectSb3('arraybuffer');
    const loadedVM = new VirtualMachine();
    await loadedVM.loadProject(savedProject);

    const actor = loadedVM.runtime.targets.find(target => target && !target.isStage && target.sprite.name === 'Actor');
    t.ok(actor, 'actor loaded');
    t.equal(actor.z, 56);
    t.equal(actor.modelAssetId, 'model-one');
    t.equal(actor.modelAssetName, 'Robot.glb');
    t.equal(actor.modelAssetDataUri, tinyModelDataUri);
    t.same(actor.modelCostumes, [{
        id: 'model-one',
        name: 'Robot.glb',
        dataUri: tinyModelDataUri,
        partTransforms: {
            Head: {
                position: {x: 1, y: 2, z: 3},
                rotation: {x: 4, y: 5, z: 6},
                scale: {x: 1.1, y: 1.2, z: 1.3},
                color: '#8169ff'
            }
        }
    }]);
    t.same(actor.modelPivot, {x: 7, y: 8, z: 9});
    t.same(actor.modelPartTransforms.Head.position, {x: 1, y: 2, z: 3});
    t.equal(actor.modelColor, '#8169ff');
    t.same(loadedVM.runtime.scratch3dScene.background, {
        mode: 'sky',
        skyColor: '#112233',
        groundColor: '#445566',
        fogAmount: 0.4
    });
});
