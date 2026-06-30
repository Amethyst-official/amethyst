import PropTypes from 'prop-types';
import React, {useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {clone as cloneGltfScene} from 'three/examples/jsm/utils/SkeletonUtils.js';

import {getLocalDracoDecoderPath} from '../../lib/scratch3d/local-draco-decoder.js';
import {normalizeModelForStage} from '../../lib/scratch3d/model-normalizer.js';
import {
    applyModelPartTransforms,
    getModelPartKey,
    getModelPartLabel,
    getPartTransform
} from '../../lib/scratch3d/model-parts.js';
import styles from './model-preview.css';

const SCRATCH_ACCENT = 0x855cd6;

const addIcon = (
    <svg
        aria-hidden
        className={styles.iconSvg}
        focusable="false"
        viewBox="0 0 24 24"
    >
        <path d="M12 5v14M5 12h14" />
    </svg>
);

const prepareModel = scene => {
    const clone = cloneGltfScene(scene);
    clone.traverse(node => {
        if (node.isMesh && node.material) {
            const materials = Array.isArray(node.material) ? node.material : [node.material];
            materials.forEach(material => {
                material.side = THREE.DoubleSide;
                material.needsUpdate = true;
            });
        }
    });
    const normalized = normalizeModelForStage(clone);
    normalized.userData.scratch3dModelRoot = true;
    return normalized;
};

const vectorFrom = value => new THREE.Vector3(
    Number(value && value.x) || 0,
    Number(value && value.y) || 0,
    Number(value && value.z) || 0
);

const findPartNode = (model, selectedPartKey) => {
    if (!model || !selectedPartKey) return null;
    let selected = null;
    model.traverse(node => {
        if (!selected && getModelPartKey(node) === selectedPartKey) {
            selected = node;
        }
    });
    return selected;
};

const addPivotGizmo = (scene, model, selectedPartKey, transforms) => {
    const selectedNode = findPartNode(model, selectedPartKey);
    if (!selectedNode) return null;
    const transform = getPartTransform(selectedNode, transforms || {}) || {};
    const pivot = vectorFrom(transform.pivot);
    model.updateMatrixWorld(true);
    const worldPivot = selectedNode.localToWorld(pivot.clone());
    const gizmo = new THREE.Group();
    gizmo.name = 'Amethyst part pivot gizmo';
    gizmo.position.copy(worldPivot);
    gizmo.userData.scratch3dMarker = true;

    const ring = new THREE.Mesh(
        new THREE.TorusGeometry(10, 1.2, 12, 40),
        new THREE.MeshBasicMaterial({
            color: SCRATCH_ACCENT,
            depthTest: false
        })
    );
    ring.renderOrder = 30;
    gizmo.add(ring);

    const axes = [
        {direction: new THREE.Vector3(1, 0, 0), color: 0xff4d4d},
        {direction: new THREE.Vector3(0, 1, 0), color: 0x4c97ff},
        {direction: new THREE.Vector3(0, 0, 1), color: 0x59c059}
    ];
    axes.forEach(axis => {
        const arrow = new THREE.ArrowHelper(axis.direction, new THREE.Vector3(0, 0, 0), 44, axis.color, 11, 6);
        arrow.renderOrder = 31;
        gizmo.add(arrow);
    });
    scene.add(gizmo);
    return gizmo;
};

const applyPreviewMaterials = (model, modelColor, partTransforms) => {
    model.traverse(node => {
        if (!node.isMesh || !node.material) return;
        const partTransform = getPartTransform(node, partTransforms || {});
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        materials.forEach(material => {
            if (!material.color) return;
            if (!material.userData.scratch3dBaseColor) {
                material.userData.scratch3dBaseColor = material.color.clone();
            }
            if (partTransform && partTransform.color) {
                material.color.set(partTransform.color);
            } else if (modelColor) {
                material.color.set(modelColor);
            } else {
                material.color.copy(material.userData.scratch3dBaseColor);
            }
        });
    });
};

const ModelPreview = ({
    modelColor,
    modelDataUri,
    modelName,
    modelPartTransforms,
    onPartSelected,
    selectedPartLabel,
    selectedPartKey
}) => {
    const mountRef = useRef(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount || !modelDataUri) return;

        const width = Math.max(260, mount.clientWidth || 360);
        const height = Math.max(220, mount.clientHeight || 240);
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x202733);

        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 3000);
        camera.position.set(180, 130, 240);
        camera.lookAt(0, 20, 0);

        const renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setPixelRatio(window.devicePixelRatio || 1);
        renderer.setSize(width, height);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        mount.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.enablePan = false;
        controls.target.set(0, 20, 0);

        scene.add(new THREE.HemisphereLight(0xffffff, 0x7d8ca0, 1.8));
        const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
        keyLight.position.set(160, 240, 180);
        scene.add(keyLight);
        const grid = new THREE.GridHelper(260, 10, 0x4f6173, 0x394756);
        grid.position.y = -62;
        scene.add(grid);

        const loader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath(getLocalDracoDecoderPath());
        loader.setDRACOLoader(dracoLoader);

        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
        let frameId = null;
        let disposed = false;
        let model = null;
        let gizmo = null;
        let pointerStart = null;

        const render = () => {
            controls.update();
            renderer.render(scene, camera);
            frameId = requestAnimationFrame(render);
        };
        render();

        const pickModelSurface = e => {
            if (!model) return null;
            const rect = renderer.domElement.getBoundingClientRect();
            pointer.x = (((e.clientX - rect.left) / rect.width) * 2) - 1;
            pointer.y = 1 - (((e.clientY - rect.top) / rect.height) * 2);
            raycaster.setFromCamera(pointer, camera);
            return raycaster.intersectObjects(model.children, true)
                .find(hit => !hit.object.userData.scratch3dMarker);
        };

        const handlePointerDown = e => {
            pointerStart = {x: e.clientX, y: e.clientY};
        };

        const handlePointerUp = e => {
            if (!pointerStart) return;
            const moved = Math.abs(e.clientX - pointerStart.x) + Math.abs(e.clientY - pointerStart.y);
            pointerStart = null;
            if (moved > 6) return;
            const hit = pickModelSurface(e);
            if (!hit || !onPartSelected) return;
            onPartSelected({
                key: getModelPartKey(hit.object),
                label: getModelPartLabel(hit.object)
            });
        };

        renderer.domElement.addEventListener('pointerdown', handlePointerDown);
        renderer.domElement.addEventListener('pointerup', handlePointerUp);

        setError(null);
        loader.loadAsync(modelDataUri)
            .then(gltf => {
                if (disposed) return;
                model = prepareModel(gltf.scene);
                applyModelPartTransforms(model, modelPartTransforms || {});
                applyPreviewMaterials(model, modelColor, modelPartTransforms || {});
                scene.add(model);
                gizmo = addPivotGizmo(scene, model, selectedPartKey, modelPartTransforms || {});
            })
            .catch(() => {
                if (!disposed) {
                    setError(modelName || 'model');
                }
            });

        return () => {
            disposed = true;
            renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
            renderer.domElement.removeEventListener('pointerup', handlePointerUp);
            if (frameId !== null) cancelAnimationFrame(frameId);
            if (gizmo) scene.remove(gizmo);
            if (model) scene.remove(model);
            controls.dispose();
            dracoLoader.dispose();
            renderer.dispose();
            if (renderer.domElement.parentNode === mount) {
                mount.removeChild(renderer.domElement);
            }
        };
    }, [
        modelColor,
        modelDataUri,
        modelName,
        modelPartTransforms,
        onPartSelected,
        selectedPartKey
    ]);

    return (
        <div
            className={styles.preview}
            ref={mountRef}
        >
            {modelDataUri ? (
                <div
                    className={styles.hint}
                    title="Click a model part to edit it"
                >
                    {addIcon}
                </div>
            ) : (
                <div
                    className={styles.empty}
                    title="Upload a GLB or embedded GLTF model"
                >
                    {addIcon}
                </div>
            )}
            {selectedPartLabel ? (
                <div
                    className={styles.selectedOverlay}
                    title="Selected model part"
                >
                    <span className={styles.selectedDot} />
                    <span>{selectedPartLabel}</span>
                </div>
            ) : null}
            {error ? (
                <div className={styles.error}>{`Could not preview ${error}`}</div>
            ) : null}
        </div>
    );
};

ModelPreview.propTypes = {
    modelColor: PropTypes.string,
    modelDataUri: PropTypes.string,
    modelName: PropTypes.string,
    modelPartTransforms: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onPartSelected: PropTypes.func,
    selectedPartLabel: PropTypes.string,
    selectedPartKey: PropTypes.string
};

export default ModelPreview;
