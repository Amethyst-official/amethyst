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
        key: 'SCENE3D_TURNCAMERAUPDOWNBY',
        defaultMessage: 'turn camera up/down by %1'
    },
    {
        key: 'SCENE3D_TURNCAMERALEFTRIGHTBY',
        defaultMessage: 'turn camera left/right by %1'
    },
    {
        key: 'SCENE3D_SETCAMERAFOV',
        defaultMessage: 'set camera zoom to %1'
    },
    {
        key: 'SCENE3D_SETCAMERASMOOTHINGDURATION',
        defaultMessage: 'set camera smoothing duration to %1'
    },
    {
        key: 'SCENE3D_FOLLOWTHISACTOR',
        defaultMessage: 'make camera follow this actor'
    },
    {
        key: 'SCENE3D_STOPFOLLOWING',
        defaultMessage: 'stop camera following'
    },
    {
        key: 'SCENE3D_SETFOLLOWDISTANCE',
        defaultMessage: 'set camera follow distance to %1'
    },
    {
        key: 'SCENE3D_SETFOLLOWHEIGHT',
        defaultMessage: 'set camera follow height to %1'
    },
    {
        key: 'SCENE3D_SETAMBIENTLIGHT',
        defaultMessage: 'set ambient brightness to %1'
    },
    {
        key: 'SCENE3D_SETKEYLIGHT',
        defaultMessage: 'set sunlight brightness to %1'
    },
    {
        key: 'SCENE3D_SETSUNCOLOR',
        defaultMessage: 'set sun color to %1'
    },
    {
        key: 'SCENE3D_SETSUNANGLE',
        defaultMessage: 'set sunlight angle direction %1 height %2'
    },
    {
        key: 'SCENE3D_SETKEYLIGHTPOSITION',
        defaultMessage: 'put sun light at x: %1 y: %2 z: %3'
    },
    {
        key: 'SCENE3D_SETSKYCOLOR',
        defaultMessage: 'set sky color to %1'
    },
    {
        key: 'SCENE3D_SETGROUNDCOLOR',
        defaultMessage: 'set ground color to %1'
    },
    {
        key: 'SCENE3D_SETFOGAMOUNT',
        defaultMessage: 'set fog amount to %1'
    },
    {
        key: 'SCENE3D_SETENVIRONMENTPRESET',
        defaultMessage: 'set environment to %1'
    },
    {
        key: 'SCENE3D_SWITCHBACKDROP',
        defaultMessage: 'change stage to %1'
    },
    {
        key: 'SCENE3D_NEXTBACKDROP',
        defaultMessage: 'next stage'
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
        key: 'MOUSE_SHOWCURSOR',
        defaultMessage: 'show mouse'
    },
    {
        key: 'MOUSE_HIDECURSOR',
        defaultMessage: 'hide mouse'
    },
    {
        key: 'MOUSE_SETMODE',
        defaultMessage: 'set mouse mode to %1'
    },
    {
        key: 'MOUSE_SETSENSITIVITY',
        defaultMessage: 'set mouse sensitivity to %1'
    },
    {
        key: 'MOUSE_SETTHIRDPERSONDISTANCE',
        defaultMessage: 'set third person distance to %1'
    },
    {
        key: 'MOUSE_LOCK',
        defaultMessage: 'grab mouse'
    },
    {
        key: 'MOUSE_UNLOCK',
        defaultMessage: 'release mouse'
    },
    {
        key: 'MOUSE_BUTTONDOWN',
        defaultMessage: '%1 mouse down?'
    },
    {
        key: 'MOUSE_DELTAX',
        defaultMessage: 'mouse movement x'
    },
    {
        key: 'MOUSE_DELTAY',
        defaultMessage: 'mouse movement y'
    },
    {
        key: 'MOUSE_WHEELUP',
        defaultMessage: 'scroll wheel up?'
    },
    {
        key: 'MOUSE_WHEELDOWN',
        defaultMessage: 'scroll wheel down?'
    },
    {
        key: 'MOUSE_MODE',
        defaultMessage: 'mouse mode'
    },
    {
        key: 'OPERATOR_DECIMALTOHEX',
        defaultMessage: 'decimal %1 to hex'
    },
    {
        key: 'OPERATOR_DECIMALTOBIN',
        defaultMessage: 'decimal %1 to binary'
    },
    {
        key: 'OPERATOR_HEXTODECIMAL',
        defaultMessage: 'hex %1 to decimal'
    },
    {
        key: 'OPERATOR_BINTODECIMAL',
        defaultMessage: 'binary %1 to decimal'
    },
    {
        key: 'NETWORK_CONFIRMSAFETY',
        defaultMessage: 'I understand Network blocks'
    },
    {
        key: 'NETWORK_ISCONFIRMED',
        defaultMessage: 'network enabled?'
    },
    {
        key: 'NETWORK_SENDREQUEST',
        defaultMessage: 'send %1 request to %2'
    },
    {
        key: 'NETWORK_SENDAPIREQUEST',
        defaultMessage: 'send api %1 request to %2 body %3'
    },
    {
        key: 'NETWORK_RESPONSETEXT',
        defaultMessage: 'response text'
    },
    {
        key: 'NETWORK_RESPONSESTATUS',
        defaultMessage: 'response status'
    },
    {
        key: 'NETWORK_RESPONSEOK',
        defaultMessage: 'response ok?'
    },
    {
        key: 'NETWORK_JSONGET',
        defaultMessage: 'json get %1 from %2'
    },
    {
        key: 'NETWORK_JSONSET',
        defaultMessage: 'json set %1 to %2 in %3'
    },
    {
        key: 'NETWORK_JSONVALID',
        defaultMessage: 'json valid? %1'
    },
    {
        key: 'NETWORK_JSONSTRINGIFY',
        defaultMessage: 'json text %1'
    },
    {
        key: 'MEDIA_SETIMAGEURL',
        defaultMessage: 'show image url %1'
    },
    {
        key: 'MEDIA_SETVIDEOURL',
        defaultMessage: 'show video url %1'
    },
    {
        key: 'MEDIA_SETUPLOADED',
        defaultMessage: 'show uploaded media %1 named %2'
    },
    {
        key: 'MEDIA_SETSIZE',
        defaultMessage: 'set media size width %1 height %2'
    },
    {
        key: 'MEDIA_PLAY',
        defaultMessage: 'play media'
    },
    {
        key: 'MEDIA_PAUSE',
        defaultMessage: 'pause media'
    },
    {
        key: 'MEDIA_RESTART',
        defaultMessage: 'restart media'
    },
    {
        key: 'MEDIA_TIME',
        defaultMessage: 'media time'
    },
    {
        key: 'MEDIA_DURATION',
        defaultMessage: 'media duration'
    },
    {
        key: 'MEDIA_LOADED',
        defaultMessage: 'media loaded?'
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
    'scene3d_turncameraupdownby',
    'scene3d_turncameraleftrightby',
    'scene3d_setcamerafov',
    'scene3d_setcamerasmoothingduration',
    'scene3d_followthisactor',
    'scene3d_stopfollowing',
    'scene3d_setfollowdistance',
    'scene3d_setfollowheight',
    'scene3d_setambientlight',
    'scene3d_setkeylight',
    'scene3d_setsuncolor',
    'scene3d_setsunangle',
    'scene3d_setkeylightposition',
    'scene3d_setskycolor',
    'scene3d_setgroundcolor',
    'scene3d_setfogamount',
    'scene3d_setenvironmentpreset',
    'scene3d_switchbackdrop',
    'scene3d_nextbackdrop'
];

const customCategoryColours = {
    camera: {
        colour: '#4c7dff',
        colourSecondary: '#6b93ff',
        colourTertiary: '#3151a8'
    },
    environment: {
        colour: '#2fb86f',
        colourSecondary: '#45ca83',
        colourTertiary: '#21804e'
    },
    mouse: {
        colour: '#00a9a5',
        colourSecondary: '#22bfbc',
        colourTertiary: '#047a77'
    },
    network: {
        colour: '#0f8f8c',
        colourSecondary: '#22aaa7',
        colourTertiary: '#047a77'
    },
    media: {
        colour: '#9966ff',
        colourSecondary: '#855cd6',
        colourTertiary: '#774dcb'
    }
};

const scene3DEnvironmentBlockTypes = new Set([
    'scene3d_setambientlight',
    'scene3d_setkeylight',
    'scene3d_setsuncolor',
    'scene3d_setsunangle',
    'scene3d_setkeylightposition',
    'scene3d_setskycolor',
    'scene3d_setgroundcolor',
    'scene3d_setfogamount',
    'scene3d_setenvironmentpreset',
    'scene3d_switchbackdrop',
    'scene3d_nextbackdrop'
]);

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

const methodArg = [{
    type: 'field_dropdown',
    name: 'METHOD',
    options: [
        ['GET', 'GET'],
        ['POST', 'POST'],
        ['PUT', 'PUT'],
        ['PATCH', 'PATCH'],
        ['DELETE', 'DELETE']
    ]
}];

const environmentPresetArg = [{
    type: 'field_dropdown',
    name: 'PRESET',
    options: [
        ['sunny', 'sunny'],
        ['sunset', 'sunset'],
        ['night', 'night'],
        ['space', 'space'],
        ['studio', 'studio']
    ]
}];

const withoutColourExtension = extensions => extensions.filter(extension => !extension.startsWith('colours_'));

const coloursForBlockType = type => {
    if (type.startsWith('scene3d_')) {
        return scene3DEnvironmentBlockTypes.has(type) ?
            customCategoryColours.environment :
            customCategoryColours.camera;
    }
    if (type.startsWith('mouse_')) return customCategoryColours.mouse;
    if (type.startsWith('network_')) return customCategoryColours.network;
    if (type.startsWith('media_')) return customCategoryColours.media;
    return null;
};

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
        checkboxInFlyout: true,
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
    },
    {
        type: 'mouse_showcursor',
        messageKey: 'MOUSE_SHOWCURSOR',
        args0: [],
        category: 'sensing',
        extensions: ['colours_sensing', 'shape_statement']
    },
    {
        type: 'mouse_hidecursor',
        messageKey: 'MOUSE_HIDECURSOR',
        args0: [],
        category: 'sensing',
        extensions: ['colours_sensing', 'shape_statement']
    },
    {
        type: 'mouse_setmode',
        messageKey: 'MOUSE_SETMODE',
        args0: [{
            type: 'field_dropdown',
            name: 'MODE',
            options: [
                ['normal', 'normal'],
                ['first person', 'first person'],
                ['third person', 'third person']
            ]
        }],
        category: 'sensing',
        extensions: ['colours_sensing', 'shape_statement']
    },
    {
        type: 'mouse_setsensitivity',
        messageKey: 'MOUSE_SETSENSITIVITY',
        args0: valueArg('SENSITIVITY'),
        category: 'sensing',
        extensions: ['colours_sensing', 'shape_statement']
    },
    {
        type: 'mouse_setthirdpersondistance',
        messageKey: 'MOUSE_SETTHIRDPERSONDISTANCE',
        args0: valueArg('DISTANCE'),
        category: 'sensing',
        extensions: ['colours_sensing', 'shape_statement']
    },
    {
        type: 'mouse_lock',
        messageKey: 'MOUSE_LOCK',
        args0: [],
        category: 'sensing',
        extensions: ['colours_sensing', 'shape_statement']
    },
    {
        type: 'mouse_unlock',
        messageKey: 'MOUSE_UNLOCK',
        args0: [],
        category: 'sensing',
        extensions: ['colours_sensing', 'shape_statement']
    },
    {
        type: 'mouse_buttondown',
        messageKey: 'MOUSE_BUTTONDOWN',
        args0: [{
            type: 'field_dropdown',
            name: 'BUTTON',
            options: [
                ['left', 'left'],
                ['middle', 'middle'],
                ['right', 'right']
            ]
        }],
        category: 'sensing',
        extensions: ['colours_sensing', 'output_boolean']
    },
    {
        type: 'mouse_deltax',
        messageKey: 'MOUSE_DELTAX',
        args0: [],
        category: 'sensing',
        checkboxInFlyout: true,
        extensions: ['colours_sensing', 'output_number']
    },
    {
        type: 'mouse_deltay',
        messageKey: 'MOUSE_DELTAY',
        args0: [],
        category: 'sensing',
        checkboxInFlyout: true,
        extensions: ['colours_sensing', 'output_number']
    },
    {
        type: 'mouse_wheelup',
        messageKey: 'MOUSE_WHEELUP',
        args0: [],
        category: 'sensing',
        checkboxInFlyout: true,
        extensions: ['colours_sensing', 'output_boolean']
    },
    {
        type: 'mouse_wheeldown',
        messageKey: 'MOUSE_WHEELDOWN',
        args0: [],
        category: 'sensing',
        checkboxInFlyout: true,
        extensions: ['colours_sensing', 'output_boolean']
    },
    {
        type: 'mouse_mode',
        messageKey: 'MOUSE_MODE',
        args0: [],
        category: 'sensing',
        checkboxInFlyout: true,
        extensions: ['colours_sensing', 'output_string']
    },
    {
        type: 'operator_decimaltohex',
        messageKey: 'OPERATOR_DECIMALTOHEX',
        args0: valueArg('NUM'),
        category: 'operators',
        extensions: ['colours_operators', 'output_string']
    },
    {
        type: 'operator_decimaltobin',
        messageKey: 'OPERATOR_DECIMALTOBIN',
        args0: valueArg('NUM'),
        category: 'operators',
        extensions: ['colours_operators', 'output_string']
    },
    {
        type: 'operator_hextodecimal',
        messageKey: 'OPERATOR_HEXTODECIMAL',
        args0: valueArg('VALUE'),
        category: 'operators',
        extensions: ['colours_operators', 'output_number']
    },
    {
        type: 'operator_bintodecimal',
        messageKey: 'OPERATOR_BINTODECIMAL',
        args0: valueArg('VALUE'),
        category: 'operators',
        extensions: ['colours_operators', 'output_number']
    },
    {
        type: 'network_confirmsafety',
        messageKey: 'NETWORK_CONFIRMSAFETY',
        args0: [],
        category: 'sensing',
        extensions: ['colours_sensing', 'shape_statement']
    },
    {
        type: 'network_isconfirmed',
        messageKey: 'NETWORK_ISCONFIRMED',
        args0: [],
        category: 'sensing',
        extensions: ['colours_sensing', 'output_boolean']
    },
    {
        type: 'network_sendrequest',
        messageKey: 'NETWORK_SENDREQUEST',
        args0: methodArg.concat(valueArg('URL')),
        category: 'sensing',
        extensions: ['colours_sensing', 'shape_statement']
    },
    {
        type: 'network_sendapirequest',
        messageKey: 'NETWORK_SENDAPIREQUEST',
        args0: methodArg.concat(valueArg('URL'), valueArg('BODY')),
        category: 'sensing',
        extensions: ['colours_sensing', 'shape_statement']
    },
    {
        type: 'network_responsetext',
        messageKey: 'NETWORK_RESPONSETEXT',
        args0: [],
        category: 'sensing',
        checkboxInFlyout: true,
        extensions: ['colours_sensing', 'output_string']
    },
    {
        type: 'network_responsestatus',
        messageKey: 'NETWORK_RESPONSESTATUS',
        args0: [],
        category: 'sensing',
        checkboxInFlyout: true,
        extensions: ['colours_sensing', 'output_number']
    },
    {
        type: 'network_responseok',
        messageKey: 'NETWORK_RESPONSEOK',
        args0: [],
        category: 'sensing',
        checkboxInFlyout: true,
        extensions: ['colours_sensing', 'output_boolean']
    },
    {
        type: 'network_jsonget',
        messageKey: 'NETWORK_JSONGET',
        args0: valueArg('PATH').concat(valueArg('JSON')),
        category: 'operators',
        extensions: ['colours_operators', 'output_string']
    },
    {
        type: 'network_jsonset',
        messageKey: 'NETWORK_JSONSET',
        args0: valueArg('PATH').concat(valueArg('VALUE'), valueArg('JSON')),
        category: 'operators',
        extensions: ['colours_operators', 'output_string']
    },
    {
        type: 'network_jsonvalid',
        messageKey: 'NETWORK_JSONVALID',
        args0: valueArg('JSON'),
        category: 'operators',
        extensions: ['colours_operators', 'output_boolean']
    },
    {
        type: 'network_jsonstringify',
        messageKey: 'NETWORK_JSONSTRINGIFY',
        args0: valueArg('TEXT'),
        category: 'operators',
        extensions: ['colours_operators', 'output_string']
    },
    {
        type: 'media_setimageurl',
        messageKey: 'MEDIA_SETIMAGEURL',
        args0: valueArg('URL'),
        category: 'looks',
        extensions: ['colours_looks', 'shape_statement']
    },
    {
        type: 'media_setvideourl',
        messageKey: 'MEDIA_SETVIDEOURL',
        args0: valueArg('URL'),
        category: 'looks',
        extensions: ['colours_looks', 'shape_statement']
    },
    {
        type: 'media_setuploaded',
        messageKey: 'MEDIA_SETUPLOADED',
        args0: valueArg('SOURCE').concat(valueArg('NAME')),
        category: 'looks',
        extensions: ['colours_looks', 'shape_statement']
    },
    {
        type: 'media_setsize',
        messageKey: 'MEDIA_SETSIZE',
        args0: valueArg('WIDTH').concat(valueArg('HEIGHT')),
        category: 'looks',
        extensions: ['colours_looks', 'shape_statement']
    },
    {
        type: 'media_play',
        messageKey: 'MEDIA_PLAY',
        args0: [],
        category: 'looks',
        extensions: ['colours_looks', 'shape_statement']
    },
    {
        type: 'media_pause',
        messageKey: 'MEDIA_PAUSE',
        args0: [],
        category: 'looks',
        extensions: ['colours_looks', 'shape_statement']
    },
    {
        type: 'media_restart',
        messageKey: 'MEDIA_RESTART',
        args0: [],
        category: 'looks',
        extensions: ['colours_looks', 'shape_statement']
    },
    {
        type: 'media_time',
        messageKey: 'MEDIA_TIME',
        args0: [],
        category: 'looks',
        extensions: ['colours_looks', 'output_number']
    },
    {
        type: 'media_duration',
        messageKey: 'MEDIA_DURATION',
        args0: [],
        category: 'looks',
        extensions: ['colours_looks', 'output_number']
    },
    {
        type: 'media_loaded',
        messageKey: 'MEDIA_LOADED',
        args0: [],
        category: 'looks',
        extensions: ['colours_looks', 'output_boolean']
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
        type: 'scene3d_turncameraupdownby',
        messageKey: 'SCENE3D_TURNCAMERAUPDOWNBY',
        args0: valueArg('DEGREES')
    },
    {
        type: 'scene3d_turncameraleftrightby',
        messageKey: 'SCENE3D_TURNCAMERALEFTRIGHTBY',
        args0: valueArg('DEGREES')
    },
    {
        type: 'scene3d_setcamerafov',
        messageKey: 'SCENE3D_SETCAMERAFOV',
        args0: valueArg('FOV')
    },
    {
        type: 'scene3d_setcamerasmoothingduration',
        messageKey: 'SCENE3D_SETCAMERASMOOTHINGDURATION',
        args0: valueArg('SECONDS')
    },
    {
        type: 'scene3d_followthisactor',
        messageKey: 'SCENE3D_FOLLOWTHISACTOR',
        args0: []
    },
    {
        type: 'scene3d_stopfollowing',
        messageKey: 'SCENE3D_STOPFOLLOWING',
        args0: []
    },
    {
        type: 'scene3d_setfollowdistance',
        messageKey: 'SCENE3D_SETFOLLOWDISTANCE',
        args0: valueArg('DISTANCE')
    },
    {
        type: 'scene3d_setfollowheight',
        messageKey: 'SCENE3D_SETFOLLOWHEIGHT',
        args0: valueArg('HEIGHT')
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
        type: 'scene3d_setsuncolor',
        messageKey: 'SCENE3D_SETSUNCOLOR',
        args0: valueArg('COLOR')
    },
    {
        type: 'scene3d_setsunangle',
        messageKey: 'SCENE3D_SETSUNANGLE',
        args0: valueArg('AZIMUTH').concat(valueArg('ELEVATION'))
    },
    {
        type: 'scene3d_setkeylightposition',
        messageKey: 'SCENE3D_SETKEYLIGHTPOSITION',
        args0: xyzArgs
    },
    {
        type: 'scene3d_setskycolor',
        messageKey: 'SCENE3D_SETSKYCOLOR',
        args0: valueArg('COLOR')
    },
    {
        type: 'scene3d_setgroundcolor',
        messageKey: 'SCENE3D_SETGROUNDCOLOR',
        args0: valueArg('COLOR')
    },
    {
        type: 'scene3d_setfogamount',
        messageKey: 'SCENE3D_SETFOGAMOUNT',
        args0: valueArg('AMOUNT')
    },
    {
        type: 'scene3d_setenvironmentpreset',
        messageKey: 'SCENE3D_SETENVIRONMENTPRESET',
        args0: environmentPresetArg
    },
    {
        type: 'scene3d_switchbackdrop',
        messageKey: 'SCENE3D_SWITCHBACKDROP',
        args0: valueArg('BACKDROP')
    },
    {
        type: 'scene3d_nextbackdrop',
        messageKey: 'SCENE3D_NEXTBACKDROP',
        args0: []
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
        ...coloursForBlockType(block.type),
        extensions: ['shape_statement']
    })));

    ScratchBlocks.defineBlocksWithJsonArray(scratch3DCoreBlockSpecs.map(block => ({
        type: block.type,
        message0: ScratchBlocks.Msg[block.messageKey],
        args0: block.args0,
        category: ScratchBlocks.Categories && ScratchBlocks.Categories[block.category] ?
            ScratchBlocks.Categories[block.category] :
            block.category,
        checkboxInFlyout: block.checkboxInFlyout,
        ...(coloursForBlockType(block.type) || {}),
        extensions: coloursForBlockType(block.type) ?
            withoutColourExtension(block.extensions) :
            block.extensions
    })));
};

export {
    defineScratch3DSceneBlocks
};
