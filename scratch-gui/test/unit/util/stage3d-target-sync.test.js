import {
    findRenderableTarget,
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

        expect(findRenderableTarget(vm, 'actor-1', 'model-a')).toBe(actor);
        expect(findRenderableTarget(makeVM([]), 'actor-1', 'model-a')).toBe(null);
        expect(findRenderableTarget(vm, 'actor-1', 'model-b')).toBe(null);
        expect(findRenderableTarget(makeVM([{...actor, modelAssetDataUri: null}]), 'actor-1', 'model-a')).toBe(null);
        expect(findRenderableTarget(makeVM([{...actor, isStage: true}]), 'actor-1', 'model-a')).toBe(null);
    });

    test('targetObjectNeedsReplacement detects model swaps on the same actor', () => {
        expect(targetObjectNeedsReplacement(null, {modelAssetId: 'model-a'})).toBe(false);
        expect(targetObjectNeedsReplacement({userData: {modelAssetId: 'model-a'}}, {modelAssetId: 'model-a'}))
            .toBe(false);
        expect(targetObjectNeedsReplacement({userData: {modelAssetId: 'model-a'}}, {modelAssetId: 'model-b'}))
            .toBe(true);
    });
});
