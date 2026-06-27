const scene3DMessages = [
    {
        key: 'SCENE3D_SETCAMERAPOSITION',
        defaultMessage: 'set camera position x: %1 y: %2 z: %3'
    },
    {
        key: 'SCENE3D_POINTCAMERAAT',
        defaultMessage: 'point camera at x: %1 y: %2 z: %3'
    },
    {
        key: 'SCENE3D_SETCAMERAFOV',
        defaultMessage: 'set camera zoom to %1'
    },
    {
        key: 'SCENE3D_SETAMBIENTLIGHT',
        defaultMessage: 'set world light to %1'
    },
    {
        key: 'SCENE3D_SETKEYLIGHT',
        defaultMessage: 'set sun light to %1'
    },
    {
        key: 'SCENE3D_SETKEYLIGHTPOSITION',
        defaultMessage: 'put sun light at x: %1 y: %2 z: %3'
    }
];

export const scene3DBlockTypes = [
    'scene3d_setcameraposition',
    'scene3d_pointcameraat',
    'scene3d_setcamerafov',
    'scene3d_setambientlight',
    'scene3d_setkeylight',
    'scene3d_setkeylightposition'
];

const xyzArgs = [
    {
        type: 'input_value',
        name: 'X'
    },
    {
        type: 'input_value',
        name: 'Y'
    },
    {
        type: 'input_value',
        name: 'Z'
    }
];

const valueArg = name => [
    {
        type: 'input_value',
        name
    }
];

const scene3DBlockSpecs = [
    {
        type: 'scene3d_setcameraposition',
        messageKey: 'SCENE3D_SETCAMERAPOSITION',
        args0: xyzArgs
    },
    {
        type: 'scene3d_pointcameraat',
        messageKey: 'SCENE3D_POINTCAMERAAT',
        args0: xyzArgs
    },
    {
        type: 'scene3d_setcamerafov',
        messageKey: 'SCENE3D_SETCAMERAFOV',
        args0: valueArg('FOV')
    },
    {
        type: 'scene3d_setambientlight',
        messageKey: 'SCENE3D_SETAMBIENTLIGHT',
        args0: valueArg('BRIGHTNESS')
    },
    {
        type: 'scene3d_setkeylight',
        messageKey: 'SCENE3D_SETKEYLIGHT',
        args0: valueArg('BRIGHTNESS')
    },
    {
        type: 'scene3d_setkeylightposition',
        messageKey: 'SCENE3D_SETKEYLIGHTPOSITION',
        args0: xyzArgs
    }
];

const translate = (ScratchBlocks, key, defaultMessage) => {
    if (ScratchBlocks.ScratchMsgs && ScratchBlocks.ScratchMsgs.translate) {
        return ScratchBlocks.ScratchMsgs.translate(key, defaultMessage);
    }
    return defaultMessage;
};

const defineScratch3DSceneBlocks = ScratchBlocks => {
    scene3DMessages.forEach(({key, defaultMessage}) => {
        ScratchBlocks.Msg[key] = translate(ScratchBlocks, key, defaultMessage);
    });

    const category = ScratchBlocks.Categories && ScratchBlocks.Categories.motion ?
        ScratchBlocks.Categories.motion :
        'motion';

    ScratchBlocks.defineBlocksWithJsonArray(scene3DBlockSpecs.map(block => ({
        type: block.type,
        message0: ScratchBlocks.Msg[block.messageKey],
        args0: block.args0,
        category,
        extensions: ['colours_motion', 'shape_statement']
    })));
};

export {
    defineScratch3DSceneBlocks
};
