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
    },
    {
        key: 'MOTION_TURNYAWBY',
        defaultMessage: 'turn yaw by %1 degrees'
    },
    {
        key: 'MOTION_TURNPITCHBY',
        defaultMessage: 'turn up/down by %1 degrees'
    },
    {
        key: 'MOTION_TURNROLLBY',
        defaultMessage: 'roll by %1 degrees'
    },
    {
        key: 'SENSING_MOUSEZ',
        defaultMessage: 'mouse z'
    },
    {
        key: 'LOOKS_SETMODELCOLOR',
        defaultMessage: 'set model color to %1'
    },
    {
        key: 'LOOKS_CLEARMODELCOLOR',
        defaultMessage: 'clear model color'
    },
    {
        key: 'EVENT_WHENTHISACTORCLICKEDINRANGE',
        defaultMessage: 'when this actor clicked within range %1'
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

const scratch3DCoreBlockSpecs = [
    {
        type: 'motion_turnyawby',
        messageKey: 'MOTION_TURNYAWBY',
        args0: valueArg('DEGREES'),
        category: 'motion',
        extensions: ['colours_motion', 'shape_statement']
    },
    {
        type: 'motion_turnpitchby',
        messageKey: 'MOTION_TURNPITCHBY',
        args0: valueArg('DEGREES'),
        category: 'motion',
        extensions: ['colours_motion', 'shape_statement']
    },
    {
        type: 'motion_turnrollby',
        messageKey: 'MOTION_TURNROLLBY',
        args0: valueArg('DEGREES'),
        category: 'motion',
        extensions: ['colours_motion', 'shape_statement']
    },
    {
        type: 'sensing_mousez',
        messageKey: 'SENSING_MOUSEZ',
        args0: [],
        category: 'sensing',
        extensions: ['colours_sensing', 'output_number']
    },
    {
        type: 'looks_setmodelcolor',
        messageKey: 'LOOKS_SETMODELCOLOR',
        args0: valueArg('COLOR'),
        category: 'looks',
        extensions: ['colours_looks', 'shape_statement']
    },
    {
        type: 'looks_clearmodelcolor',
        messageKey: 'LOOKS_CLEARMODELCOLOR',
        args0: [],
        category: 'looks',
        extensions: ['colours_looks', 'shape_statement']
    },
    {
        type: 'event_whenthisactorclickedinrange',
        messageKey: 'EVENT_WHENTHISACTORCLICKEDINRANGE',
        args0: valueArg('RANGE'),
        category: 'event',
        extensions: ['colours_event', 'shape_hat']
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

    ScratchBlocks.defineBlocksWithJsonArray(scratch3DCoreBlockSpecs.map(block => ({
        type: block.type,
        message0: ScratchBlocks.Msg[block.messageKey],
        args0: block.args0,
        category: ScratchBlocks.Categories && ScratchBlocks.Categories[block.category] ?
            ScratchBlocks.Categories[block.category] :
            block.category,
        extensions: block.extensions
    })));
};

export {
    defineScratch3DSceneBlocks
};
