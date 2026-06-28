import makeToolboxXML from '../../../src/lib/make-toolbox-xml';

describe('makeToolboxXML', () => {
    test('keeps the 3D toolbox category valid so later block categories still load', () => {
        const xml = makeToolboxXML(false, false, 'target-id', [], 'Model', 'Scene', 'pop');

        expect(xml).toContain('Camera');
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

    test('uses 3D-ready user-facing blocks instead of broken 2D blocks', () => {
        const xml = makeToolboxXML(false, false, 'target-id', [], 'Model', 'Scene 1', 'pop');

        expect(xml).toContain('motion_turnyawby');
        expect(xml).toContain('motion_turnpitchby');
        expect(xml).toContain('motion_turnrollby');
        expect(xml).toContain('sensing_mousez');
        expect(xml).toContain('looks_setmodelcolor');
        expect(xml).toContain('looks_switchbackdropto');
        expect(xml).toContain('looks_nextbackdrop');
        expect(xml).toContain('looks_backdropnumbername');
        expect(xml).toContain('event_whenbackdropswitchesto');
        expect(xml).not.toContain('looks_say');
        expect(xml).not.toContain('looks_think');
        expect(xml).not.toContain('scene3d_setambientlight');
        expect(xml).not.toContain('scene3d_setkeylight');
    });
});
