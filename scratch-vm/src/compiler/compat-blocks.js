// @ts-check

/**
 * @fileoverview List of blocks to be supported in the compiler compatibility layer.
 * This is only for native blocks. Extensions should not be listed here.
 */

// Please keep these lists alphabetical.

const stacked = [
    'looks_changestretchby',
    'looks_hideallsprites',
    'looks_sayforsecs',
    'looks_setstretchto',
    'looks_switchbackdroptoandwait',
    'looks_thinkforsecs',
    'media_duration',
    'media_loaded',
    'media_pause',
    'media_play',
    'media_restart',
    'media_setimageurl',
    'media_setsize',
    'media_setuploaded',
    'media_setvideourl',
    'media_time',
    'motion_align_scene',
    'motion_glidesecstoxy',
    'motion_glideto',
    'motion_goto',
    'motion_pointtowards',
    'motion_scroll_right',
    'motion_scroll_up',
    'network_confirmsafety',
    'network_isconfirmed',
    'network_jsonget',
    'network_jsonset',
    'network_jsonstringify',
    'network_jsonvalid',
    'network_responseok',
    'network_responsestatus',
    'network_responsetext',
    'network_sendapirequest',
    'network_sendrequest',
    'scene3d_addbackdrop',
    'scene3d_followthisactor',
    'scene3d_nextbackdrop',
    'scene3d_pointcameraat',
    'scene3d_setambientlight',
    'scene3d_setcamerafov',
    'scene3d_setcameraposition',
    'scene3d_setcamerasmoothingduration',
    'scene3d_setenvironmentpreset',
    'scene3d_setfollowdistance',
    'scene3d_setfollowheight',
    'scene3d_setfogamount',
    'scene3d_setgroundcolor',
    'scene3d_setkeylight',
    'scene3d_setkeylightposition',
    'scene3d_setskycolor',
    'scene3d_setsunangle',
    'scene3d_setsuncolor',
    'scene3d_stopfollowing',
    'scene3d_switchbackdrop',
    'scene3d_turncameraleftrightby',
    'scene3d_turncameraupdownby',
    'sensing_askandwait',
    'sensing_setdragmode',
    'sound_changeeffectby',
    'sound_changevolumeby',
    'sound_cleareffects',
    'sound_play',
    'sound_playuntildone',
    'sound_seteffectto',
    'sound_setvolumeto',
    'sound_stopallsounds'
];

const inputs = [
    'media_duration',
    'media_loaded',
    'media_time',
    'motion_xscroll',
    'motion_yscroll',
    'network_isconfirmed',
    'network_jsonget',
    'network_jsonset',
    'network_jsonstringify',
    'network_jsonvalid',
    'network_responseok',
    'network_responsestatus',
    'network_responsetext',
    'sensing_loud',
    'sensing_loudness',
    'sensing_online',
    'sensing_userid',
    'sound_volume'
];

module.exports = {
    stacked,
    inputs
};
