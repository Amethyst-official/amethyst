import makeToolboxXML from '../../../src/lib/make-toolbox-xml';

describe('makeToolboxXML', () => {
    test('keeps the 3D toolbox category valid so later block categories still load', () => {
        const xml = makeToolboxXML(false, false, 'target-id', [], 'Model', 'Scene', 'pop');

        expect(xml).toContain('Camera');
        expect(xml).not.toContain('Camera & Lights');

        for (const categoryId of [
            'motion',
            'scene3d',
            'environment',
            'looks',
            'sound',
            'events',
            'control',
            'sensing',
            'mouse',
            'operators',
            'variables',
            'media',
            'network',
            'myBlocks'
        ]) {
            expect(xml).toContain(`id="${categoryId}"`);
        }
    });

    test('puts advanced media and network categories below variables and above my blocks', () => {
        const xml = makeToolboxXML(false, false, 'target-id', [], 'Model', 'Scene 1', 'pop');

        const variablesIndex = xml.indexOf('id="variables"');
        const mediaIndex = xml.indexOf('id="media"');
        const networkIndex = xml.indexOf('id="network"');
        const myBlocksIndex = xml.indexOf('id="myBlocks"');

        expect(variablesIndex).toBeGreaterThan(-1);
        expect(mediaIndex).toBeGreaterThan(variablesIndex);
        expect(networkIndex).toBeGreaterThan(mediaIndex);
        expect(myBlocksIndex).toBeGreaterThan(networkIndex);
    });

    test('uses 3D-ready user-facing blocks instead of broken 2D blocks', () => {
        const xml = makeToolboxXML(false, false, 'target-id', [], 'Model', 'Scene 1', 'pop');

        expect(xml).toContain('motion_turnyawby');
        expect(xml).toContain('motion_turnpitchby');
        expect(xml).toContain('motion_turnrollby');
        expect(xml).toContain('sensing_mousez');
        expect(xml).toContain('looks_setmodelcolor');
        expect(xml).not.toContain('looks_movemodelpoint');
        expect(xml).toContain('looks_switchbackdropto');
        expect(xml).toContain('looks_nextbackdrop');
        expect(xml).toContain('looks_backdropnumbername');
        expect(xml).toContain('event_whenbackdropswitchesto');
        expect(xml).not.toContain('looks_say');
        expect(xml).not.toContain('looks_think');
        expect(xml.indexOf('id="environment"')).toBeLessThan(xml.indexOf('id="mouse"'));
    });

    test('adds environment blocks for world and stage controls', () => {
        const xml = makeToolboxXML(false, false, 'target-id', [], 'Model', 'Scene 1', 'pop');

        expect(xml).toContain('name="Environment" id="environment"');
        expect(xml).toContain('scene3d_setskycolor');
        expect(xml).toContain('scene3d_setgroundcolor');
        expect(xml).toContain('scene3d_setfogamount');
        expect(xml).toContain('scene3d_setsunangle');
        expect(xml).toContain('scene3d_setambientlight');
        expect(xml).toContain('scene3d_setkeylight');
        expect(xml).toContain('scene3d_setsuncolor');
        expect(xml).toContain('scene3d_setenvironmentpreset');
        expect(xml).toContain('scene3d_switchbackdrop');
        expect(xml).toContain('scene3d_nextbackdrop');
    });

    test('adds mouse control blocks for 3D projects', () => {
        const xml = makeToolboxXML(false, false, 'target-id', [], 'Model', 'Scene 1', 'pop');

        expect(xml).toContain('name="Mouse"');
        expect(xml).toContain('mouse_showcursor');
        expect(xml).toContain('mouse_hidecursor');
        expect(xml).toContain('mouse_setmode');
        expect(xml).toContain('mouse_setsensitivity');
        expect(xml).toContain('mouse_setthirdpersondistance');
        expect(xml).toContain('mouse_lock');
        expect(xml).toContain('mouse_unlock');
        expect(xml).toContain('sensing_mousedown');
        expect(xml).toContain('mouse_buttondown');
        expect(xml).toContain('sensing_mousex');
        expect(xml).toContain('sensing_mousey');
        expect(xml).toContain('sensing_mousez');
        expect(xml).toContain('mouse_deltax');
        expect(xml).toContain('mouse_deltay');
        expect(xml).toContain('mouse_mode');
    });

    test('adds camera follow blocks for 3D projects', () => {
        const xml = makeToolboxXML(false, false, 'target-id', [], 'Model', 'Scene 1', 'pop');

        expect(xml).toContain('motion_movesidewayssteps');
        expect(xml).toContain('scene3d_turncameraupdownby');
        expect(xml).toContain('scene3d_turncameraleftrightby');
        expect(xml).toContain('scene3d_setcamerasmoothingduration');
        expect(xml).toContain('scene3d_followthisactor');
        expect(xml).toContain('scene3d_stopfollowing');
        expect(xml).toContain('scene3d_setfollowdistance');
        expect(xml).toContain('scene3d_setfollowheight');
    });

    test('adds base conversion blocks to operators', () => {
        const xml = makeToolboxXML(false, false, 'target-id', [], 'Model', 'Scene 1', 'pop');

        expect(xml).toContain('operator_decimaltohex');
        expect(xml).toContain('operator_decimaltobin');
        expect(xml).toContain('operator_hextodecimal');
        expect(xml).toContain('operator_bintodecimal');
    });
});
