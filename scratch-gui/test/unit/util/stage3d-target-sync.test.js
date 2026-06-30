import {
    findRenderableTarget,
    targetModelCacheKey,
    targetObjectNeedsReplacement
} from '../../../src/lib/scratch3d/stage3d-target-sync';

describe('stage3d target sync helpers', () => {
    const makeVM = targets => ({
        runtime: {
            targets
        }
    });

    test('findRenderableTarget rejects late model loads for deleted or changed targets', () => {
        const actor = {
            id: 'actor-1',
            isStage: false,
            modelAssetId: 'model-a',
            modelAssetDataUri: 'data:model/gltf-binary;base64,aaaa'
        };
        const vm = makeVM([actor]);

        expect(findRenderableTarget(vm, 'actor-1', 'model-a', actor.modelAssetDataUri)).toBe(actor);
        expect(findRenderableTarget(makeVM([]), 'actor-1', 'model-a', actor.modelAssetDataUri)).toBe(null);
        expect(findRenderableTarget(vm, 'actor-1', 'model-b', actor.modelAssetDataUri)).toBe(null);
        expect(findRenderableTarget(vm, 'actor-1', 'model-a', 'data:model/gltf-binary;base64,bbbb')).toBe(null);
        expect(findRenderableTarget(makeVM([{...actor, modelAssetDataUri: null}]), 'actor-1', 'model-a', actor.modelAssetDataUri)).toBe(null);
        expect(findRenderableTarget(makeVM([{...actor, isStage: true}]), 'actor-1', 'model-a', actor.modelAssetDataUri)).toBe(null);
    });

    test('targetModelCacheKey changes when a loaded .amx has new data for the same model id', () => {
        expect(targetModelCacheKey({
            modelAssetId: 'model-a',
            modelAssetDataUri: 'data:model/gltf-binary;base64,aaaa'
        })).not.toEqual(targetModelCacheKey({
            modelAssetId: 'model-a',
            modelAssetDataUri: 'data:model/gltf-binary;base64,bbbb'
        }));
    });

    test('targetObjectNeedsReplacement detects model swaps on the same actor', () => {
        expect(targetObjectNeedsReplacement(null, {
            modelAssetId: 'model-a',
            modelAssetDataUri: 'data:model/gltf-binary;base64,aaaa'
        })).toBe(false);
        expect(targetObjectNeedsReplacement({
            userData: {
                modelAssetId: 'model-a',
                modelCacheKey: 'model-a:data:model/gltf-binary;base64,aaaa'
            }
        }, {
            modelAssetId: 'model-a',
            modelAssetDataUri: 'data:model/gltf-binary;base64,aaaa'
        }))
            .toBe(false);
        expect(targetObjectNeedsReplacement({userData: {modelAssetId: 'model-a'}}, {
            modelAssetId: 'model-b',
            modelAssetDataUri: 'data:model/gltf-binary;base64,aaaa'
        }))
            .toBe(true);
        expect(targetObjectNeedsReplacement({
            userData: {
                modelAssetId: 'model-a',
                modelCacheKey: 'model-a:data:model/gltf-binary;base64,aaaa'
            }
        }, {
            modelAssetId: 'model-a',
            modelAssetDataUri: 'data:model/gltf-binary;base64,bbbb'
        }))
            .toBe(true);
    });
});
