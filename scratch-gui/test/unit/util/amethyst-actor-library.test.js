import {amethystActorLibrary} from '../../../src/lib/libraries/amethyst-actor-library';

describe('amethyst-actor-library', () => {
    test('built-in actor models use the emitted build asset path', () => {
        const modeledActors = amethystActorLibrary.filter(actor => actor.model);

        expect(modeledActors.length).toBeGreaterThan(0);
        modeledActors.forEach(actor => {
            expect(actor.model.url).toMatch(/^\/amethyst-models\/.+\.glb$/);
            expect(actor.model.url).not.toContain('/static/amethyst-models/');
        });
    });
});
