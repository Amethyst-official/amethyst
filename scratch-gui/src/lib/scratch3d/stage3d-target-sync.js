const findRenderableTarget = (vm, targetId, modelAssetId) => {
    const targets = (vm && vm.runtime && vm.runtime.targets) || [];
    const target = targets.find(candidate => candidate && candidate.id === targetId);

    if (!target || target.isStage) return null;
    if (target.modelAssetId !== modelAssetId) return null;
    if (!target.modelAssetDataUri) return null;

    return target;
};

const targetObjectNeedsReplacement = (object, target) => (
    Boolean(object && target && object.userData && object.userData.modelAssetId !== target.modelAssetId)
);

export {
    findRenderableTarget,
    targetObjectNeedsReplacement
};
