import * as THREE from 'three';

export const getModelPartKey = node => {
    const parts = [];
    let current = node;
    while (current && current.parent && !current.userData.scratch3dModelRoot) {
        const index = current.parent.children.indexOf(current);
        const label = current.name || current.type || 'part';
        parts.unshift(`${label}:${Math.max(0, index)}`);
        current = current.parent;
    }
    return parts.join('/');
};

export const getModelPartLabel = node => node.name || node.type || 'Model part';

export const getPartTransform = (node, transforms) => {
    if (!transforms) return null;
    return transforms[getModelPartKey(node)] || (node.name ? transforms[node.name] : null) || null;
};

const numberOrFallback = (value, fallback) => {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : fallback;
};

const vectorFrom = (value, fallback) => new THREE.Vector3(
    numberOrFallback(value && value.x, fallback.x),
    numberOrFallback(value && value.y, fallback.y),
    numberOrFallback(value && value.z, fallback.z)
);

const ensureBaseTransform = node => {
    if (!node.userData.scratch3dBasePosition) {
        node.userData.scratch3dBasePosition = node.position.clone();
        node.userData.scratch3dBaseQuaternion = node.quaternion.clone();
        node.userData.scratch3dBaseScale = node.scale.clone();
    }
};

const resetNodeTransform = node => {
    node.matrixAutoUpdate = true;
    node.position.copy(node.userData.scratch3dBasePosition);
    node.quaternion.copy(node.userData.scratch3dBaseQuaternion);
    node.scale.copy(node.userData.scratch3dBaseScale);
    node.updateMatrix();
};

export const applyModelPartTransforms = (root, transforms) => {
    if (!root) return;
    root.traverse(node => {
        ensureBaseTransform(node);
        const transform = getPartTransform(node, transforms);
        if (!transform) {
            resetNodeTransform(node);
            return;
        }

        const offset = vectorFrom(transform.offset, {x: 0, y: 0, z: 0});
        const rotation = vectorFrom(transform.rotation, {x: 0, y: 0, z: 0});
        const scale = vectorFrom(transform.scale, {x: 1, y: 1, z: 1});
        const pivot = vectorFrom(transform.pivot, {x: 0, y: 0, z: 0});
        const basePosition = node.userData.scratch3dBasePosition.clone().add(offset);
        const baseMatrix = new THREE.Matrix4().compose(
            basePosition,
            node.userData.scratch3dBaseQuaternion,
            node.userData.scratch3dBaseScale
        );
        const pivotToOrigin = new THREE.Matrix4().makeTranslation(-pivot.x, -pivot.y, -pivot.z);
        const pivotBack = new THREE.Matrix4().makeTranslation(pivot.x, pivot.y, pivot.z);
        const rotationMatrix = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(
            THREE.MathUtils.degToRad(rotation.x),
            THREE.MathUtils.degToRad(rotation.y),
            THREE.MathUtils.degToRad(rotation.z),
            'XYZ'
        ));
        const scaleMatrix = new THREE.Matrix4().makeScale(scale.x, scale.y, scale.z);

        node.matrixAutoUpdate = false;
        node.matrix.copy(baseMatrix)
            .multiply(pivotBack)
            .multiply(rotationMatrix)
            .multiply(scaleMatrix)
            .multiply(pivotToOrigin);
        node.matrixWorldNeedsUpdate = true;
    });
    root.updateMatrixWorld(true);
};
