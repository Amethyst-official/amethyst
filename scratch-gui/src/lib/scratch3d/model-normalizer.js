import * as THREE from 'three';

const TARGET_MODEL_SIZE = 120;

const hasUsableBox = (box, size) => (
    Number.isFinite(box.min.x) &&
    Number.isFinite(box.min.y) &&
    Number.isFinite(box.min.z) &&
    Number.isFinite(box.max.x) &&
    Number.isFinite(box.max.y) &&
    Number.isFinite(box.max.z) &&
    Number.isFinite(size.x) &&
    Number.isFinite(size.y) &&
    Number.isFinite(size.z)
);

const normalizeModelForStage = model => {
    const actor = new THREE.Group();

    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    if (!hasUsableBox(box, size)) {
        actor.add(model);
        return actor;
    }

    const largestDimension = Math.max(size.x, size.y, size.z);
    if (largestDimension <= 0) {
        actor.add(model);
        return actor;
    }

    const normalized = new THREE.Group();
    const scale = TARGET_MODEL_SIZE / largestDimension;
    model.position.sub(center);
    normalized.scale.setScalar(scale);
    normalized.add(model);
    actor.add(normalized);

    return actor;
};

export {
    normalizeModelForStage,
    TARGET_MODEL_SIZE
};
