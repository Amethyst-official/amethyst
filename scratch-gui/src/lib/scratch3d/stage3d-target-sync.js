const targetModelCacheKey = target => {
    if (!target || !target.modelAssetId || !target.modelAssetDataUri) return null;
    return `${target.modelAssetId}:${target.modelAssetDataUri}`;
};

const findRenderableTarget = (vm, targetId, modelAssetId, modelAssetDataUri) => {
    const targets = (vm && vm.runtime && vm.runtime.targets) || [];
    const target = targets.find(candidate => candidate && candidate.id === targetId);

    if (!target || target.isStage) return null;
    if (target.modelAssetId !== modelAssetId) return null;
    if (!target.modelAssetDataUri) return null;
    if (modelAssetDataUri && target.modelAssetDataUri !== modelAssetDataUri) return null;

    return target;
};

const targetObjectNeedsReplacement = (object, target) => (
    Boolean(object && target && object.userData && (
        object.userData.modelAssetId !== target.modelAssetId ||
        object.userData.modelCacheKey !== targetModelCacheKey(target)
    ))
);

export {
    findRenderableTarget,
    targetModelCacheKey,
    targetObjectNeedsReplacement
};
