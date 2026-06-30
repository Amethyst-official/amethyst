const STAGE_MODE_EVENT = 'scratch3d-stage-mode-change';
const VALID_STAGE_MODES = ['view', 'debug'];

let stageMode = 'view';

const normalizeStageMode = mode => (VALID_STAGE_MODES.includes(mode) ? mode : 'view');

const emitStageModeChange = () => {
    if (typeof window === 'undefined' || !window.dispatchEvent) return;
    window.dispatchEvent(new CustomEvent(STAGE_MODE_EVENT, {
        detail: {stageMode}
    }));
};

const getScratch3DStageMode = () => stageMode;

const setScratch3DStageMode = mode => {
    const nextMode = normalizeStageMode(mode);
    if (stageMode === nextMode) return;
    stageMode = nextMode;
    emitStageModeChange();
};

const onScratch3DStageModeChange = listener => {
    if (typeof window === 'undefined' || !window.addEventListener) return () => {};
    const handleStageModeChange = event => {
        listener(normalizeStageMode(event.detail && event.detail.stageMode));
    };
    window.addEventListener(STAGE_MODE_EVENT, handleStageModeChange);
    return () => window.removeEventListener(STAGE_MODE_EVENT, handleStageModeChange);
};

export {
    getScratch3DStageMode,
    onScratch3DStageModeChange,
    setScratch3DStageMode
};
