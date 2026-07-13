import makeToolboxXML from '../../../src/lib/make-toolbox-xml';

const Runtime = require('scratch-vm/src/engine/runtime');

const enabledAmethystModules = {
    camera: true,
    environment: true,
    mouse: true,
    media: true,
    network: true
};

const xmlBlockTypes = xml => Array.from(xml.matchAll(/<(?:block|shadow)\b[^>]*\btype="([^"]+)"/g))
    .map(match => match[1]);

const xmlCategoryIds = xml => Array.from(xml.matchAll(/<category\b[^>]*\bid="([^"]+)"/g))
    .map(match => match[1]);

const ignoredToolboxTypes = new Set([
    'math_number',
    'math_positive_number',
    'math_whole_number',
    'text',
    'colour_picker',
    'event_broadcast_menu',
    'control_create_clone_of_menu',
    'sensing_keyoptions',
    'sensing_of_object_menu',
    'looks_backdrops',
    'procedures_definition',
    'procedures_call',
    'control_start_as_clone',
    'event_whenbackdropswitchesto',
    'event_whenbroadcastreceived',
    'event_whenflagclicked',
    'event_whenkeypressed',
    'event_whenthisactorclickedinrange'
]);

describe('Amethyst block smoke coverage', () => {
    test('every visible toolbox block has a VM primitive or a known Blockly-only role', () => {
        const xml = makeToolboxXML(false, false, 'target-id', [], 'Model', 'Scene 1', 'pop',
            undefined, enabledAmethystModules);
        const toolboxTypes = Array.from(new Set(xmlBlockTypes(xml)))
            .filter(type => !ignoredToolboxTypes.has(type))
            .sort();

        const runtime = new Runtime();
        const primitiveNames = new Set(Object.keys(runtime._primitives));
        const missing = toolboxTypes.filter(type => !primitiveNames.has(type));

        expect(missing).toEqual([]);
    });

    test('3D coordinate toolbox blocks expose the same inputs that the VM reads', () => {
        const xml = makeToolboxXML(false, false, 'target-id', [], 'Model', 'Scene 1', 'pop',
            undefined, enabledAmethystModules);

        const expectBlockInputs = (type, inputNames) => {
            const block = xml.match(new RegExp(`<block type="${type}">([\\s\\S]*?)</block>`));
            expect(block && block[1]).toBeTruthy();
            inputNames.forEach(inputName => {
                expect(block[1]).toContain(`<value name="${inputName}">`);
            });
        };

        expectBlockInputs('motion_gotoxy', ['X', 'Y', 'Z']);
        expectBlockInputs('motion_glidesecstoxy', ['SECS', 'X', 'Y', 'Z']);
        expectBlockInputs('scene3d_setcameraposition', ['X', 'Y', 'Z']);
        expectBlockInputs('scene3d_pointcameraat', ['X', 'Y', 'Z']);
    });

    test('toolbox category order can be rearranged by category id', () => {
        const xml = makeToolboxXML(false, false, 'target-id', [], 'Model', 'Scene 1', 'pop',
            undefined, enabledAmethystModules, ['network', 'motion', 'scene3d']);
        const categoryIds = xmlCategoryIds(xml);

        expect(categoryIds.indexOf('network')).toBeLessThan(categoryIds.indexOf('motion'));
        expect(categoryIds.indexOf('motion')).toBeLessThan(categoryIds.indexOf('scene3d'));
    });
});
