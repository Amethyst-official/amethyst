import LazyScratchBlocks from './tw-lazy-scratch-blocks';
import {defaultBlockColors} from './themes';

const categorySeparator = '<sep gap="36"/>';

const blockSeparator = '<sep gap="36"/>'; // At default scale, about 28px

const translate = (id, english) => {
    if (LazyScratchBlocks.isLoaded()) {
        return LazyScratchBlocks.get().ScratchMsgs.translate(id, english);
    }
    return english;
};

/* eslint-disable no-unused-vars */
const motion = function (isInitialSetup, isStage, targetId, colors) {
    const stageSelected = translate(
        'MOTION_STAGE_SELECTED',
        'Stage selected: no motion blocks'
    );
    // Note: the category's secondaryColour matches up with the blocks' tertiary color, both used for border color.
    return `
    <category name="%{BKY_CATEGORY_MOTION}" id="motion" colour="${colors.primary}" secondaryColour="${colors.tertiary}">
        ${isStage ? `
        <label text="${stageSelected}"></label>
        ` : `
        <block type="motion_movesteps">
            <value name="STEPS">
                <shadow type="math_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
        </block>
        <block type="motion_movesidewayssteps">
            <value name="STEPS">
                <shadow type="math_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
            <field name="DIRECTION">right</field>
        </block>
        <block type="motion_turnyawby">
            <value name="DEGREES">
                <shadow type="math_number">
                    <field name="NUM">15</field>
                </shadow>
            </value>
        </block>
        <block type="motion_turnpitchby">
            <value name="DEGREES">
                <shadow type="math_number">
                    <field name="NUM">15</field>
                </shadow>
            </value>
        </block>
        <block type="motion_turnrollby">
            <value name="DEGREES">
                <shadow type="math_number">
                    <field name="NUM">15</field>
                </shadow>
            </value>
        </block>
        ${blockSeparator}
        <block type="motion_goto">
            <value name="TO">
                <shadow type="motion_goto_menu">
                </shadow>
            </value>
        </block>
        <block type="motion_gotoxy">
            <value name="X">
                <shadow id="movex" type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
            <value name="Y">
                <shadow id="movey" type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
            <value name="Z">
                <shadow id="movez" type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
        </block>
        <block type="motion_glideto" id="motion_glideto">
            <value name="SECS">
                <shadow type="math_number">
                    <field name="NUM">1</field>
                </shadow>
            </value>
            <value name="TO">
                <shadow type="motion_glideto_menu">
                </shadow>
            </value>
        </block>
        <block type="motion_glidesecstoxy">
            <value name="SECS">
                <shadow type="math_number">
                    <field name="NUM">1</field>
                </shadow>
            </value>
            <value name="X">
                <shadow id="glidex" type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
            <value name="Y">
                <shadow id="glidey" type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
            <value name="Z">
                <shadow id="glidez" type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
        </block>
        ${blockSeparator}
        <block type="motion_pointindirection">
            <value name="DIRECTION">
                <shadow type="math_angle">
                    <field name="NUM">90</field>
                </shadow>
            </value>
        </block>
        <block type="motion_pointtowards">
            <value name="TOWARDS">
                <shadow type="motion_pointtowards_menu">
                </shadow>
            </value>
        </block>
        ${blockSeparator}
        <block type="motion_changexby">
            <value name="DX">
                <shadow type="math_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
        </block>
        <block type="motion_setx">
            <value name="X">
                <shadow id="setx" type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
        </block>
        <block type="motion_changeyby">
            <value name="DY">
                <shadow type="math_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
        </block>
        <block type="motion_sety">
            <value name="Y">
                <shadow id="sety" type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
        </block>
        <block type="motion_changezby">
            <value name="DZ">
                <shadow type="math_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
        </block>
        <block type="motion_setz">
            <value name="Z">
                <shadow id="setz" type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
        </block>
        ${blockSeparator}
        <block id="${targetId}_xposition" type="motion_xposition"/>
        <block id="${targetId}_yposition" type="motion_yposition"/>
        <block id="${targetId}_zposition" type="motion_zposition"/>
        <block id="${targetId}_direction" type="motion_direction"/>`}
        ${categorySeparator}
    </category>
    `;
};

const xmlEscape = function (unsafe) {
    return unsafe.replace(/[<>&'"]/g, c => {
        switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        }
    });
};

const looks = function (isInitialSetup, isStage, targetId, costumeName, backdropName, colors) {
    // Note: the category's secondaryColour matches up with the blocks' tertiary color, both used for border color.
    return `
    <category name="%{BKY_CATEGORY_LOOKS}" id="looks" colour="${colors.primary}" secondaryColour="${colors.tertiary}">
        ${isStage ? '' : `
            <block type="looks_changesizeby">
                <value name="CHANGE">
                    <shadow type="math_number">
                        <field name="NUM">10</field>
                    </shadow>
                </value>
            </block>
            <block type="looks_setsizeto">
                <value name="SIZE">
                    <shadow type="math_number">
                        <field name="NUM">100</field>
                </shadow>
            </value>
        </block>
        `}
        ${blockSeparator}
        ${isStage ? '' : `
            <block type="looks_show"/>
            <block type="looks_hide"/>
            ${blockSeparator}
            <block type="looks_setmodelcolor">
                <value name="COLOR">
                    <shadow type="colour_picker">
                        <field name="COLOUR">#ff8844</field>
                    </shadow>
                </value>
            </block>
            <block type="looks_clearmodelcolor"/>
            ${blockSeparator}
            <block id="${targetId}_size" type="looks_size"/>
        `}
        ${blockSeparator}
        <block type="looks_switchbackdropto">
            <value name="BACKDROP">
                <shadow type="looks_backdrops">
                    <field name="BACKDROP">${backdropName}</field>
                </shadow>
            </value>
        </block>
        <block type="looks_nextbackdrop"/>
        <block type="looks_backdropnumbername"/>
        ${categorySeparator}
    </category>
    `;
};

const scene3d = function (colors) {
    const primary = '#4c7dff';
    const tertiary = '#3151a8';
    return `
    <category name="Camera" id="scene3d" colour="${primary}" secondaryColour="${tertiary}">
        <block type="scene3d_setcameraposition">
            <value name="X">
                <shadow type="math_number">
                    <field name="NUM">260</field>
                </shadow>
            </value>
            <value name="Y">
                <shadow type="math_number">
                    <field name="NUM">180</field>
                </shadow>
            </value>
            <value name="Z">
                <shadow type="math_number">
                    <field name="NUM">420</field>
                </shadow>
            </value>
        </block>
        <block type="scene3d_pointcameraat">
            <value name="X">
                <shadow type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
            <value name="Y">
                <shadow type="math_number">
                    <field name="NUM">20</field>
                </shadow>
            </value>
            <value name="Z">
                <shadow type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
        </block>
        <block type="scene3d_turncameraupdownby">
            <value name="DEGREES">
                <shadow type="math_number">
                    <field name="NUM">15</field>
                </shadow>
            </value>
        </block>
        <block type="scene3d_turncameraleftrightby">
            <value name="DEGREES">
                <shadow type="math_number">
                    <field name="NUM">15</field>
                </shadow>
            </value>
        </block>
        <block type="scene3d_setcamerafov">
            <value name="FOV">
                <shadow type="math_number">
                    <field name="NUM">55</field>
                </shadow>
            </value>
        </block>
        <block type="scene3d_setcamerasmoothingduration">
            <value name="SECONDS">
                <shadow type="math_number">
                    <field name="NUM">0.35</field>
                </shadow>
            </value>
        </block>
        ${blockSeparator}
        <block type="scene3d_followthisactor"/>
        <block type="scene3d_stopfollowing"/>
        <block type="scene3d_setfollowdistance">
            <value name="DISTANCE">
                <shadow type="math_number">
                    <field name="NUM">240</field>
                </shadow>
            </value>
        </block>
        <block type="scene3d_setfollowheight">
            <value name="HEIGHT">
                <shadow type="math_number">
                    <field name="NUM">35</field>
                </shadow>
            </value>
        </block>
        ${categorySeparator}
    </category>
    `;
};

const environment = function (backdropName) {
    const primary = '#2fb86f';
    const tertiary = '#21804e';
    return `
    <category name="Environment" id="environment" colour="${primary}" secondaryColour="${tertiary}">
        <block type="scene3d_setenvironmentpreset">
            <field name="PRESET">sunny</field>
        </block>
        ${blockSeparator}
        <block type="scene3d_setskycolor">
            <value name="COLOR">
                <shadow type="colour_picker">
                    <field name="COLOUR">#8fc6ff</field>
                </shadow>
            </value>
        </block>
        <block type="scene3d_setgroundcolor">
            <value name="COLOR">
                <shadow type="colour_picker">
                    <field name="COLOUR">#d7eef7</field>
                </shadow>
            </value>
        </block>
        <block type="scene3d_setfogamount">
            <value name="AMOUNT">
                <shadow type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
        </block>
        ${blockSeparator}
        <block type="scene3d_setsunangle">
            <value name="AZIMUTH">
                <shadow type="math_number">
                    <field name="NUM">35</field>
                </shadow>
            </value>
            <value name="ELEVATION">
                <shadow type="math_number">
                    <field name="NUM">50</field>
                </shadow>
            </value>
        </block>
        <block type="scene3d_setsuncolor">
            <value name="COLOR">
                <shadow type="colour_picker">
                    <field name="COLOUR">#ffffff</field>
                </shadow>
            </value>
        </block>
        <block type="scene3d_setkeylight">
            <value name="BRIGHTNESS">
                <shadow type="math_number">
                    <field name="NUM">120</field>
                </shadow>
            </value>
        </block>
        <block type="scene3d_setambientlight">
            <value name="BRIGHTNESS">
                <shadow type="math_number">
                    <field name="NUM">160</field>
                </shadow>
            </value>
        </block>
        ${blockSeparator}
        <block type="scene3d_switchbackdrop">
            <value name="BACKDROP">
                <shadow type="looks_backdrops">
                    <field name="BACKDROP">${backdropName}</field>
                </shadow>
            </value>
        </block>
        <block type="scene3d_nextbackdrop"/>
        ${categorySeparator}
    </category>
    `;
};

const mouse = function (colors) {
    const primary = '#00a9a5';
    const tertiary = '#047a77';
    return `
    <category name="Mouse" id="mouse" colour="${primary}" secondaryColour="${tertiary}">
        <block type="mouse_showcursor"/>
        <block type="mouse_hidecursor"/>
        <block type="mouse_setmode">
            <field name="MODE">normal</field>
        </block>
        <block type="mouse_setsensitivity">
            <value name="SENSITIVITY">
                <shadow type="math_number">
                    <field name="NUM">1</field>
                </shadow>
            </value>
        </block>
        <block type="mouse_setthirdpersondistance">
            <value name="DISTANCE">
                <shadow type="math_number">
                    <field name="NUM">240</field>
                </shadow>
            </value>
        </block>
        ${blockSeparator}
        <block type="mouse_lock"/>
        <block type="mouse_unlock"/>
        ${blockSeparator}
        <block type="sensing_mousedown"/>
        <block type="mouse_buttondown">
            <field name="BUTTON">left</field>
        </block>
        <block type="sensing_mousex"/>
        <block type="sensing_mousey"/>
        <block type="sensing_mousez"/>
        ${blockSeparator}
        <block type="mouse_deltax"/>
        <block type="mouse_deltay"/>
        <block type="mouse_mode"/>
        ${categorySeparator}
    </category>
    `;
};

const network = function (colors) {
    const primary = '#0f8f8c';
    const tertiary = '#047a77';
    return `
    <category name="Network" id="network" colour="${primary}" secondaryColour="${tertiary}">
        <label text="Do not listen to anyone who told you to use this."></label>
        <label text="Only use Network if you know what you are doing."></label>
        <block type="network_confirmsafety"/>
        <block type="network_isconfirmed"/>
        ${blockSeparator}
        <block type="network_sendrequest">
            <field name="METHOD">GET</field>
            <value name="URL">
                <shadow type="text">
                    <field name="TEXT">https://example.com</field>
                </shadow>
            </value>
        </block>
        <block type="network_sendapirequest">
            <field name="METHOD">POST</field>
            <value name="URL">
                <shadow type="text">
                    <field name="TEXT">https://example.com/api</field>
                </shadow>
            </value>
            <value name="BODY">
                <shadow type="text">
                    <field name="TEXT">{"hello":"world"}</field>
                </shadow>
            </value>
        </block>
        <block type="network_responsetext"/>
        <block type="network_responsestatus"/>
        <block type="network_responseok"/>
        ${blockSeparator}
        <block type="network_jsonget">
            <value name="PATH">
                <shadow type="text">
                    <field name="TEXT">player.name</field>
                </shadow>
            </value>
            <value name="JSON">
                <shadow type="text">
                    <field name="TEXT">{"player":{"name":"Amethyst"}}</field>
                </shadow>
            </value>
        </block>
        <block type="network_jsonset">
            <value name="PATH">
                <shadow type="text">
                    <field name="TEXT">player.hp</field>
                </shadow>
            </value>
            <value name="VALUE">
                <shadow type="text">
                    <field name="TEXT">10</field>
                </shadow>
            </value>
            <value name="JSON">
                <shadow type="text">
                    <field name="TEXT">{"player":{}}</field>
                </shadow>
            </value>
        </block>
        <block type="network_jsonvalid">
            <value name="JSON">
                <shadow type="text">
                    <field name="TEXT">{"ok":true}</field>
                </shadow>
            </value>
        </block>
        <block type="network_jsonstringify">
            <value name="TEXT">
                <shadow type="text">
                    <field name="TEXT">hello</field>
                </shadow>
            </value>
        </block>
        ${categorySeparator}
    </category>
    `;
};

const mediaDisplay = function (colors) {
    const primary = colors.primary;
    const tertiary = colors.tertiary;
    return `
    <category name="Media Display" id="media" colour="${primary}" secondaryColour="${tertiary}">
        <block type="media_setimageurl">
            <value name="URL">
                <shadow type="text">
                    <field name="TEXT">https://example.com/image.png</field>
                </shadow>
            </value>
        </block>
        <block type="media_setvideourl">
            <value name="URL">
                <shadow type="text">
                    <field name="TEXT">https://example.com/video.mp4</field>
                </shadow>
            </value>
        </block>
        <block type="media_setuploaded">
            <value name="SOURCE">
                <shadow type="text">
                    <field name="TEXT">data:image/png;base64,...</field>
                </shadow>
            </value>
            <value name="NAME">
                <shadow type="text">
                    <field name="TEXT">media</field>
                </shadow>
            </value>
        </block>
        <block type="media_setsize">
            <value name="WIDTH">
                <shadow type="math_number">
                    <field name="NUM">180</field>
                </shadow>
            </value>
            <value name="HEIGHT">
                <shadow type="math_number">
                    <field name="NUM">120</field>
                </shadow>
            </value>
        </block>
        ${blockSeparator}
        <block type="media_play"/>
        <block type="media_pause"/>
        <block type="media_restart"/>
        ${blockSeparator}
        <block type="media_time"/>
        <block type="media_duration"/>
        <block type="media_loaded"/>
        ${categorySeparator}
    </category>
    `;
};

const sound = function (isInitialSetup, isStage, targetId, soundName, colors) {
    // Note: the category's secondaryColour matches up with the blocks' tertiary color, both used for border color.
    return `
    <category name="%{BKY_CATEGORY_SOUND}" id="sound" colour="${colors.primary}" secondaryColour="${colors.tertiary}">
        <block id="${targetId}_sound_playuntildone" type="sound_playuntildone">
            <value name="SOUND_MENU">
                <shadow type="sound_sounds_menu">
                    <field name="SOUND_MENU">${soundName}</field>
                </shadow>
            </value>
        </block>
        <block id="${targetId}_sound_play" type="sound_play">
            <value name="SOUND_MENU">
                <shadow type="sound_sounds_menu">
                    <field name="SOUND_MENU">${soundName}</field>
                </shadow>
            </value>
        </block>
        <block type="sound_stopallsounds"/>
        ${blockSeparator}
        <block type="sound_changeeffectby">
            <value name="VALUE">
                <shadow type="math_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
        </block>
        <block type="sound_seteffectto">
            <value name="VALUE">
                <shadow type="math_number">
                    <field name="NUM">100</field>
                </shadow>
            </value>
        </block>
        <block type="sound_cleareffects"/>
        ${blockSeparator}
        <block type="sound_changevolumeby">
            <value name="VOLUME">
                <shadow type="math_number">
                    <field name="NUM">-10</field>
                </shadow>
            </value>
        </block>
        <block type="sound_setvolumeto">
            <value name="VOLUME">
                <shadow type="math_number">
                    <field name="NUM">100</field>
                </shadow>
            </value>
        </block>
        <block id="${targetId}_volume" type="sound_volume"/>
        ${categorySeparator}
    </category>
    `;
};

const events = function (isInitialSetup, isStage, targetId, colors) {
    // Note: the category's secondaryColour matches up with the blocks' tertiary color, both used for border color.
    return `
    <category name="%{BKY_CATEGORY_EVENTS}" id="events" colour="${colors.primary}" secondaryColour="${colors.tertiary}">
        <block type="event_whenflagclicked"/>
        <block type="event_whenkeypressed">
        </block>
        ${isStage ? `
            <block type="event_whenstageclicked"/>
        ` : `
            <block type="event_whenthisactorclickedinrange">
                <value name="RANGE">
                    <shadow type="math_number">
                        <field name="NUM">300</field>
                    </shadow>
                </value>
            </block>
        `}
        <block type="event_whenbackdropswitchesto"/>
        ${blockSeparator}
        <block type="event_whengreaterthan">
            <value name="VALUE">
                <shadow type="math_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
        </block>
        ${blockSeparator}
        <block type="event_whenbroadcastreceived">
        </block>
        <block type="event_broadcast">
            <value name="BROADCAST_INPUT">
                <shadow type="event_broadcast_menu"></shadow>
            </value>
        </block>
        <block type="event_broadcastandwait">
            <value name="BROADCAST_INPUT">
              <shadow type="event_broadcast_menu"></shadow>
            </value>
        </block>
        ${categorySeparator}
    </category>
    `;
};

const control = function (isInitialSetup, isStage, targetId, colors) {
    // Note: the category's secondaryColour matches up with the blocks' tertiary color, both used for border color.
    return `
    <category
        name="%{BKY_CATEGORY_CONTROL}"
        id="control"
        colour="${colors.primary}"
        secondaryColour="${colors.tertiary}">
        <block type="control_wait">
            <value name="DURATION">
                <shadow type="math_positive_number">
                    <field name="NUM">1</field>
                </shadow>
            </value>
        </block>
        ${blockSeparator}
        <block type="control_repeat">
            <value name="TIMES">
                <shadow type="math_whole_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
        </block>
        <block id="forever" type="control_forever"/>
        ${blockSeparator}
        <block type="control_if"/>
        <block type="control_if_else"/>
        <block id="wait_until" type="control_wait_until"/>
        <block id="repeat_until" type="control_repeat_until"/>
        <block id="while" type="control_while"/>
        ${blockSeparator}
        <block type="control_stop"/>
        ${blockSeparator}
        ${isStage ? `
            <block type="control_create_clone_of">
                <value name="CLONE_OPTION">
                    <shadow type="control_create_clone_of_menu"/>
                </value>
            </block>
        ` : `
            <block type="control_start_as_clone"/>
            <block type="control_create_clone_of">
                <value name="CLONE_OPTION">
                    <shadow type="control_create_clone_of_menu"/>
                </value>
            </block>
            <block type="control_delete_this_clone"/>
        `}
        ${categorySeparator}
    </category>
    `;
};

const sensing = function (isInitialSetup, isStage, targetId, colors) {
    const name = translate('SENSING_ASK_TEXT', 'What\'s your name?');
    // Note: the category's secondaryColour matches up with the blocks' tertiary color, both used for border color.
    return `
    <category
        name="%{BKY_CATEGORY_SENSING}"
        id="sensing"
        colour="${colors.primary}"
        secondaryColour="${colors.tertiary}">
        ${isInitialSetup ? '' : `
            <block id="askandwait" type="sensing_askandwait">
                <value name="QUESTION">
                    <shadow type="text">
                        <field name="TEXT">${name}</field>
                    </shadow>
                </value>
            </block>
        `}
        <block id="answer" type="sensing_answer"/>
        ${blockSeparator}
        <block type="sensing_keypressed">
            <value name="KEY_OPTION">
                <shadow type="sensing_keyoptions"/>
            </value>
        </block>
        <block type="sensing_mousedown"/>
        <block type="sensing_mousex"/>
        <block type="sensing_mousey"/>
        <block type="sensing_mousez"/>
        ${blockSeparator}
        <block id="loudness" type="sensing_loudness"/>
        ${blockSeparator}
        <block id="timer" type="sensing_timer"/>
        <block type="sensing_resettimer"/>
        ${blockSeparator}
        <block id="of" type="sensing_of">
            <value name="OBJECT">
                <shadow id="sensing_of_object_menu" type="sensing_of_object_menu"/>
            </value>
        </block>
        ${blockSeparator}
        <block id="current" type="sensing_current"/>
        <block type="sensing_dayssince2000"/>
        ${blockSeparator}
        <block id="online" type="sensing_online"/>
        <block type="sensing_username"/>
        ${categorySeparator}
    </category>
    `;
};

const operators = function (isInitialSetup, isStage, targetId, colors) {
    const apple = translate('OPERATORS_JOIN_APPLE', 'apple');
    const banana = translate('OPERATORS_JOIN_BANANA', 'banana');
    const letter = translate('OPERATORS_LETTEROF_APPLE', 'a');
    // Note: the category's secondaryColour matches up with the blocks' tertiary color, both used for border color.
    return `
    <category
        name="%{BKY_CATEGORY_OPERATORS}"
        id="operators"
        colour="${colors.primary}"
        secondaryColour="${colors.tertiary}">
        <block type="operator_add">
            <value name="NUM1">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
            <value name="NUM2">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
        </block>
        <block type="operator_subtract">
            <value name="NUM1">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
            <value name="NUM2">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
        </block>
        <block type="operator_multiply">
            <value name="NUM1">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
            <value name="NUM2">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
        </block>
        <block type="operator_divide">
            <value name="NUM1">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
            <value name="NUM2">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
        </block>
        ${blockSeparator}
        <block type="operator_random">
            <value name="FROM">
                <shadow type="math_number">
                    <field name="NUM">1</field>
                </shadow>
            </value>
            <value name="TO">
                <shadow type="math_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
        </block>
        ${blockSeparator}
        <block type="operator_gt">
            <value name="OPERAND1">
                <shadow type="text">
                    <field name="TEXT"/>
                </shadow>
            </value>
            <value name="OPERAND2">
                <shadow type="text">
                    <field name="TEXT">50</field>
                </shadow>
            </value>
        </block>
        <block type="operator_lt">
            <value name="OPERAND1">
                <shadow type="text">
                    <field name="TEXT"/>
                </shadow>
            </value>
            <value name="OPERAND2">
                <shadow type="text">
                    <field name="TEXT">50</field>
                </shadow>
            </value>
        </block>
        <block type="operator_equals">
            <value name="OPERAND1">
                <shadow type="text">
                    <field name="TEXT"/>
                </shadow>
            </value>
            <value name="OPERAND2">
                <shadow type="text">
                    <field name="TEXT">50</field>
                </shadow>
            </value>
        </block>
        ${blockSeparator}
        <block type="operator_and"/>
        <block type="operator_or"/>
        <block type="operator_not"/>
        ${blockSeparator}
        ${isInitialSetup ? '' : `
            <block type="operator_join">
                <value name="STRING1">
                    <shadow type="text">
                        <field name="TEXT">${apple} </field>
                    </shadow>
                </value>
                <value name="STRING2">
                    <shadow type="text">
                        <field name="TEXT">${banana}</field>
                    </shadow>
                </value>
            </block>
            <block type="operator_letter_of">
                <value name="LETTER">
                    <shadow type="math_whole_number">
                        <field name="NUM">1</field>
                    </shadow>
                </value>
                <value name="STRING">
                    <shadow type="text">
                        <field name="TEXT">${apple}</field>
                    </shadow>
                </value>
            </block>
            <block type="operator_length">
                <value name="STRING">
                    <shadow type="text">
                        <field name="TEXT">${apple}</field>
                    </shadow>
                </value>
            </block>
            <block type="operator_contains" id="operator_contains">
              <value name="STRING1">
                <shadow type="text">
                  <field name="TEXT">${apple}</field>
                </shadow>
              </value>
              <value name="STRING2">
                <shadow type="text">
                  <field name="TEXT">${letter}</field>
                </shadow>
              </value>
            </block>
        `}
        ${blockSeparator}
        <block type="operator_mod">
            <value name="NUM1">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
            <value name="NUM2">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
        </block>
        <block type="operator_round">
            <value name="NUM">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
        </block>
        ${blockSeparator}
        <block type="operator_decimaltohex">
            <value name="NUM">
                <shadow type="math_number">
                    <field name="NUM">255</field>
                </shadow>
            </value>
        </block>
        <block type="operator_decimaltobin">
            <value name="NUM">
                <shadow type="math_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
        </block>
        <block type="operator_hextodecimal">
            <value name="VALUE">
                <shadow type="text">
                    <field name="TEXT">FF</field>
                </shadow>
            </value>
        </block>
        <block type="operator_bintodecimal">
            <value name="VALUE">
                <shadow type="text">
                    <field name="TEXT">1010</field>
                </shadow>
            </value>
        </block>
        ${blockSeparator}
        <block type="operator_mathop">
            <value name="NUM">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
        </block>
        ${categorySeparator}
    </category>
    `;
};

const variables = function (isInitialSetup, isStage, targetId, colors) {
    // Note: the category's secondaryColour matches up with the blocks' tertiary color, both used for border color.
    return `
    <category
        name="%{BKY_CATEGORY_VARIABLES}"
        id="variables"
        colour="${colors.primary}"
        secondaryColour="${colors.tertiary}"
        custom="VARIABLE">
    </category>
    `;
};

const myBlocks = function (isInitialSetup, isStage, targetId, colors) {
    // Note: the category's secondaryColour matches up with the blocks' tertiary color, both used for border color.
    return `
    <category
        name="%{BKY_CATEGORY_MYBLOCKS}"
        id="myBlocks"
        colour="${colors.primary}"
        secondaryColour="${colors.tertiary}"
        custom="PROCEDURE">
    </category>
    `;
};

// eslint-disable-next-line max-len
const extraTurboWarpBlocks = `
<block type="argument_reporter_boolean"><field name="VALUE">is compiled?</field></block>
<block type="argument_reporter_boolean"><field name="VALUE">is Amethyst?</field></block>
`;
/* eslint-enable no-unused-vars */

const xmlOpen = '<xml style="display: none">';
const xmlClose = '</xml>';

/**
 * @param {!boolean} isInitialSetup - Whether the toolbox is for initial setup. If the mode is "initial setup",
 * blocks with localized default parameters (e.g. ask and wait) should not be loaded. (LLK/scratch-gui#5445)
 * @param {?boolean} isStage - Whether the toolbox is for a stage-type target. This is always set to true
 * when isInitialSetup is true.
 * @param {?string} targetId - The current editing target
 * @param {?Array.<object>} categoriesXML - optional array of `{id,xml}` for categories. This can include both core
 * and other extensions: core extensions will be placed in the normal Scratch order; others will go at the bottom.
 * @property {string} id - the extension / category ID.
 * @property {string} xml - the `<category>...</category>` XML for this extension / category.
 * @param {?string} costumeName - The name of the default selected costume dropdown.
 * @param {?string} backdropName - The name of the default selected backdrop dropdown.
 * @param {?string} soundName -  The name of the default selected sound dropdown.
 * @param {?object} colors - The colors for the theme.
 * @returns {string} - a ScratchBlocks-style XML document for the contents of the toolbox.
 */
const makeToolboxXML = function (isInitialSetup, isStage = true, targetId, categoriesXML = [],
    costumeName = '', backdropName = '', soundName = '', colors = defaultBlockColors) {
    isStage = isInitialSetup || isStage;
    const gap = [categorySeparator];

    costumeName = xmlEscape(costumeName);
    backdropName = xmlEscape(backdropName);
    soundName = xmlEscape(soundName);

    categoriesXML = categoriesXML.slice();
    const moveCategory = categoryId => {
        const index = categoriesXML.findIndex(categoryInfo => categoryInfo.id === categoryId);
        if (index >= 0) {
            // remove the category from categoriesXML and return its XML
            const [categoryInfo] = categoriesXML.splice(index, 1);
            return categoryInfo.xml;
        }
        // return `undefined`
    };
    const motionXML = moveCategory('motion') || motion(isInitialSetup, isStage, targetId, colors.motion);
    const scene3dXML = moveCategory('scene3d') || scene3d(colors.motion);
    const environmentXML = moveCategory('environment') || environment(backdropName);
    const mouseXML = moveCategory('mouse') || mouse(colors.sensing);
    const looksXML = moveCategory('looks') ||
        looks(isInitialSetup, isStage, targetId, costumeName, backdropName, colors.looks);
    const soundXML = moveCategory('sound') || sound(isInitialSetup, isStage, targetId, soundName, colors.sounds);
    const eventsXML = moveCategory('event') || events(isInitialSetup, isStage, targetId, colors.event);
    const controlXML = moveCategory('control') || control(isInitialSetup, isStage, targetId, colors.control);
    const sensingXML = moveCategory('sensing') || sensing(isInitialSetup, isStage, targetId, colors.sensing);
    const operatorsXML = moveCategory('operators') || operators(isInitialSetup, isStage, targetId, colors.operators);
    const variablesXML = moveCategory('data') || variables(isInitialSetup, isStage, targetId, colors.data);
    const mediaXML = moveCategory('media') || mediaDisplay(colors.looks);
    const networkXML = moveCategory('network') || network(colors.sensing);
    const myBlocksXML = moveCategory('procedures') || myBlocks(isInitialSetup, isStage, targetId, colors.more);

    // Always display TurboWarp blocks as the first extension, if it exists,
    // and also add an "is compiled?" block to the top.
    let turbowarpXML = moveCategory('tw');
    if (turbowarpXML && !turbowarpXML.includes(extraTurboWarpBlocks)) {
        turbowarpXML = turbowarpXML.replace('<block', `${extraTurboWarpBlocks}<block`);
    }

    const everything = [
        xmlOpen,
        motionXML, gap,
        scene3dXML, gap,
        environmentXML, gap,
        mouseXML, gap,
        looksXML, gap,
        soundXML, gap,
        eventsXML, gap,
        controlXML, gap,
        sensingXML, gap,
        operatorsXML, gap,
        variablesXML, gap,
        mediaXML, gap,
        networkXML, gap,
        myBlocksXML
    ];

    if (turbowarpXML) {
        everything.push(gap, turbowarpXML);
    }

    for (const extensionCategory of categoriesXML) {
        everything.push(gap, extensionCategory.xml);
    }

    everything.push(xmlClose);
    return everything.join('\n');
};

export default makeToolboxXML;
