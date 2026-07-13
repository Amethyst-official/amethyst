import {
    defineScratch3DSceneBlocks,
    scene3DBlockTypes
} from '../../../src/lib/scratch3d-scene-blocks';

describe('scratch3d scene blocks', () => {
    test('registers camera and light block shapes with Scratch Blocks', () => {
        const ScratchBlocks = {
            Categories: {
                motion: 'motion'
            },
            Msg: {},
            ScratchMsgs: {
                translate: (id, defaultMessage) => `${id}:${defaultMessage}`
            },
            defineBlocksWithJsonArray: jest.fn()
        };

        defineScratch3DSceneBlocks(ScratchBlocks);

        expect(ScratchBlocks.Msg.SCENE3D_SETCAMERAPOSITION)
            .toBe('SCENE3D_SETCAMERAPOSITION:set camera position x: %1 y: %2 z: %3');
        expect(ScratchBlocks.defineBlocksWithJsonArray).toHaveBeenCalledTimes(2);

        const definitions = ScratchBlocks.defineBlocksWithJsonArray.mock.calls[0][0];
        expect(definitions.map(definition => definition.type)).toEqual(scene3DBlockTypes);
        expect(definitions).toEqual(expect.arrayContaining([
            expect.objectContaining({
                type: 'scene3d_setcameraposition',
                args0: [
                    {type: 'input_value', name: 'X'},
                    {type: 'input_value', name: 'Y'},
                    {type: 'input_value', name: 'Z'}
                ],
                category: 'motion',
                colour: '#4c7dff',
                extensions: ['shape_statement']
            }),
            expect.objectContaining({
                type: 'scene3d_setambientlight',
                args0: [
                    {type: 'input_value', name: 'BRIGHTNESS'}
                ]
            }),
            expect.objectContaining({
                type: 'scene3d_setkeylightposition',
                args0: [
                    {type: 'input_value', name: 'X'},
                    {type: 'input_value', name: 'Y'},
                    {type: 'input_value', name: 'Z'}
                ]
            })
        ]));

        const coreDefinitions = ScratchBlocks.defineBlocksWithJsonArray.mock.calls[1][0];
        expect(coreDefinitions.map(definition => definition.type)).toEqual(expect.arrayContaining([
            'motion_turnyawby',
            'motion_turnpitchby',
            'motion_turnrollby',
            'mouse_wheelup',
            'mouse_wheeldown',
            'network_sendrequest',
            'media_setimageurl'
        ]));
    });
});
