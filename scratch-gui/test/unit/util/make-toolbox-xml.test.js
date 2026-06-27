import makeToolboxXML from '../../../src/lib/make-toolbox-xml';

describe('makeToolboxXML', () => {
    test('keeps the 3D toolbox category valid so later block categories still load', () => {
        const xml = makeToolboxXML(false, false, 'target-id', [], 'Model', 'Scene', 'pop');

        expect(xml).toContain('Camera &amp; Lights');
        expect(xml).not.toContain('Camera & Lights');

        for (const categoryId of [
            'motion',
            'scene3d',
            'looks',
            'sound',
            'events',
            'control',
            'sensing',
            'operators',
            'variables',
            'myBlocks'
        ]) {
            expect(xml).toContain(`id="${categoryId}"`);
        }
    });
});
