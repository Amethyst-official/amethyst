import PropTypes from 'prop-types';
import React, {useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader.js';
import {clone as cloneGltfScene} from 'three/examples/jsm/utils/SkeletonUtils.js';

import {normalizeModelForStage} from '../../lib/scratch3d/model-normalizer.js';
import {
    applyModelPartTransforms,
    getPartTransform
} from '../../lib/scratch3d/model-parts.js';
import {getLocalDracoDecoderPath} from '../../lib/scratch3d/local-draco-decoder.js';
import {
    findRenderableTarget,
    targetModelCacheKey,
    targetObjectNeedsReplacement
} from '../../lib/scratch3d/stage3d-target-sync.js';
import {
    getScratch3DStageMode,
    onScratch3DStageModeChange,
    setScratch3DStageMode
} from '../../lib/scratch3d/stage-mode.js';
import styles from './stage-3d.css';

const cloneScene = scene => {
    const clone = cloneGltfScene(scene);
    clone.traverse(node => {
        if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
            node.frustumCulled = false;
            if (node.material) {
                const materials = Array.isArray(node.material) ? node.material : [node.material];
                materials.forEach(material => {
                    material.side = THREE.DoubleSide;
                    material.needsUpdate = true;
                });
            }
        }
    });
    const normalized = normalizeModelForStage(clone);
    normalized.userData.scratch3dModelRoot = true;
    return normalized;
};

const getMediaKey = media => `${media && media.type}:${media && media.source}`;

const disposeObject = object => {
    if (!object) return;
    if (object.userData && object.userData.videoElement) {
        object.userData.videoElement.pause();
        object.userData.videoElement.src = '';
        object.userData.videoElement.load();
    }
    object.traverse(node => {
        if (node.geometry) node.geometry.dispose();
        const materials = node.material ? (Array.isArray(node.material) ? node.material : [node.material]) : [];
        materials.forEach(material => {
            if (material.map) material.map.dispose();
            material.dispose();
        });
    });
};

const applyTargetTransform = (object, target) => {
    object.position.set(target.x || 0, target.y || 0, target.z || 0);
    object.visible = target.visible !== false;
    object.rotation.y = THREE.MathUtils.degToRad(90 - (target.direction || 90));
    object.rotation.x = THREE.MathUtils.degToRad(target.pitch || 0);
    object.rotation.z = THREE.MathUtils.degToRad(target.roll || 0);
    object.scale.setScalar((target.size || 100) / 100);
};

const getBlockinumScene = vm => (vm && vm.runtime && vm.runtime.scratch3dScene) || {
    revision: 0,
    camera: {
        position: {x: 260, y: 180, z: 420},
        target: {x: 0, y: 20, z: 0},
        fov: 55,
        smoothingDuration: 0,
        follow: {
            enabled: false,
            targetId: null,
            distance: 240,
            height: 35
        }
    },
    lighting: {
        ambient: 1.6,
        key: 1.2,
        keyColor: '#ffffff',
        keyPosition: {x: 180, y: 320, z: 240}
    },
    background: {
        mode: 'sky',
        skyColor: '#8fc6ff',
        groundColor: '#d7eef7',
        fogAmount: 0,
        imageDataUri: null,
        imageName: null
    }
};

const getMouseState = vm => (vm && vm.runtime && vm.runtime.scratch3dMouse) || {
    visible: true,
    locked: false,
    mode: 'normal',
    sensitivity: 1,
    thirdPersonDistance: 240
};

const getActiveSceneState = sceneState => {
    if (sceneState && Array.isArray(sceneState.backdrops) && sceneState.backdrops.length > 0) {
        const index = Math.max(0, Math.min(sceneState.backdrops.length - 1, sceneState.currentBackdrop || 0));
        const active = sceneState.backdrops[index] || {};
        return {
            ...sceneState,
            background: active.background || sceneState.background,
            camera: active.camera || sceneState.camera
        };
    }
    return sceneState;
};

const vectorFromState = value => new THREE.Vector3(value.x || 0, value.y || 0, value.z || 0);
const pivotFromTarget = target => vectorFromState(target.modelPivot || {x: 0, y: 0, z: 0});
const formatNumber = value => (Number.isFinite(value) ? value.toFixed(1) : '0.0');
const formatVector = value => `${formatNumber(value.x)}, ${formatNumber(value.y)}, ${formatNumber(value.z)}`;
const DEBUG_SETTINGS_STORAGE_KEY = 'amethyst:debug-overlay-settings';
const DEFAULT_DEBUG_SETTINGS = {
    layout: 'compact',
    sections: {
        performance: true,
        camera: true,
        actor: true,
        environment: true,
        input: true
    },
    helpers: {
        grid: true,
        axes: true,
        cameraRay: true,
        targetPoint: true
    }
};
const normalizeDebugSettings = settings => ({
    layout: ['compact', 'full', 'custom'].includes(settings && settings.layout) ?
        settings.layout :
        DEFAULT_DEBUG_SETTINGS.layout,
    sections: {
        ...DEFAULT_DEBUG_SETTINGS.sections,
        ...((settings && settings.sections) || {})
    },
    helpers: {
        ...DEFAULT_DEBUG_SETTINGS.helpers,
        ...((settings && settings.helpers) || {})
    }
});
const readDebugSettings = () => {
    if (typeof window === 'undefined' || !window.localStorage) {
        return DEFAULT_DEBUG_SETTINGS;
    }
    try {
        return normalizeDebugSettings(JSON.parse(window.localStorage.getItem(DEBUG_SETTINGS_STORAGE_KEY)));
    } catch (e) {
        return DEFAULT_DEBUG_SETTINGS;
    }
};
const writeDebugSettings = settings => {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
        window.localStorage.setItem(DEBUG_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
        // Debug settings are nice-to-have, never project-critical.
    }
};
const getAccentColor = element => {
    const fallback = '#855cd6';
    if (!element || !window.getComputedStyle) return new THREE.Color(fallback);
    const value = window.getComputedStyle(element)
        .getPropertyValue('--looks-secondary')
        .trim();
    try {
        return new THREE.Color(value || fallback);
    } catch (e) {
        return new THREE.Color(fallback);
    }
};

const buildDebugSnapshot = (camera, controls, renderer, vm, targetObjects, mouseState, sceneState, frameStats) => {
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    const targets = (vm && vm.runtime && vm.runtime.targets) || [];
    const selectedTarget = vm && vm.editingTarget && !vm.editingTarget.isStage ? vm.editingTarget : null;
    const cameraState = (sceneState && sceneState.camera) || {};
    const backgroundState = (sceneState && sceneState.background) || {};
    const lightingState = (sceneState && sceneState.lighting) || {};
    const renderInfo = renderer.info && renderer.info.render ? renderer.info.render : {};
    return {
        actorCount: Array.from(targetObjects.values()).filter(object => object.visible).length,
        cameraFov: camera.fov,
        cameraPosition: camera.position.clone(),
        cameraTarget: controls.target.clone(),
        direction,
        followEnabled: Boolean(cameraState.follow && cameraState.follow.enabled),
        environment: {
            ambient: lightingState.ambient,
            fogAmount: backgroundState.fogAmount || 0,
            groundColor: backgroundState.groundColor || '#d7eef7',
            key: lightingState.key,
            skyColor: backgroundState.skyColor || '#8fc6ff',
            skyMode: backgroundState.mode || 'sky',
            sunColor: lightingState.keyColor || '#ffffff'
        },
        performance: {
            calls: renderInfo.calls || 0,
            frameTime: frameStats.frameTime,
            fps: frameStats.fps,
            triangles: renderInfo.triangles || 0
        },
        mouseMode: mouseState.mode || 'normal',
        mouseLocked: Boolean(mouseState.locked),
        mouseVisible: mouseState.visible !== false,
        mouseSensitivity: mouseState.sensitivity || 1,
        targetCount: targets.filter(target => target && !target.isStage).length,
        selectedTarget: selectedTarget ? {
            costume: selectedTarget.modelAssetName || selectedTarget.modelAssetId || 'None',
            name: selectedTarget.sprite && selectedTarget.sprite.name,
            pivot: pivotFromTarget(selectedTarget),
            position: new THREE.Vector3(
                selectedTarget.x || 0,
                selectedTarget.y || 0,
                selectedTarget.z || 0
            ),
            rotation: {
                yaw: selectedTarget.direction || 90,
                pitch: selectedTarget.pitch || 0,
                roll: selectedTarget.roll || 0
            },
            scale: selectedTarget.size || 100,
            visible: selectedTarget.visible !== false
        } : null
    };
};

const Stage3D = ({height, vm, width}) => {
    const mountRef = useRef(null);
    const rendererRef = useRef(null);
    const cameraRef = useRef(null);
    const [loadError, setLoadError] = useState(null);
    const [needsMouseClick, setNeedsMouseClick] = useState(false);
    const [stageMode, setStageMode] = useState(getScratch3DStageMode());
    const [debugSnapshot, setDebugSnapshot] = useState(null);
    const [debugSettings, setDebugSettings] = useState(readDebugSettings);
    const [debugSettingsOpen, setDebugSettingsOpen] = useState(false);
    const stageModeRef = useRef(stageMode);
    const debugSettingsRef = useRef(debugSettings);
    useEffect(() => {
        stageModeRef.current = stageMode;
    }, [stageMode]);
    useEffect(() => {
        const normalized = normalizeDebugSettings(debugSettings);
        debugSettingsRef.current = normalized;
        writeDebugSettings(normalized);
    }, [debugSettings]);
    useEffect(() => {
        const unsubscribe = onScratch3DStageModeChange(setStageMode);
        return unsubscribe;
    }, []);
    useEffect(() => {
        const handleKeyDown = event => {
            if (event.key !== 'F3') return;
            event.preventDefault();
            if (event.shiftKey) {
                setScratch3DStageMode('debug');
                setDebugSettingsOpen(open => !open);
                return;
            }
            setScratch3DStageMode(stageModeRef.current === 'debug' ? 'view' : 'debug');
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x8fc6ff);

        const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 5000);
        camera.position.set(260, 180, 420);
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({antialias: true, alpha: false});
        renderer.setPixelRatio(window.devicePixelRatio || 1);
        renderer.setSize(width, height);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;
        mount.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.enablePan = false;
        controls.target.set(0, 20, 0);

        const ambientLight = new THREE.HemisphereLight(0xffffff, 0x9bc5dd, 1.6);
        scene.add(ambientLight);
        const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
        keyLight.position.set(180, 320, 240);
        scene.add(keyLight);
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.45);
        fillLight.position.set(-220, 160, -160);
        scene.add(fillLight);

        const groundMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color('#d7eef7'),
            depthWrite: false
        });
        const groundMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(40000, 40000),
            groundMaterial
        );
        groundMesh.rotation.x = -Math.PI / 2;
        groundMesh.position.y = -1.5;
        scene.add(groundMesh);

        const debugGrid = new THREE.GridHelper(40000, 80, 0x8169ff, 0x8f9aa8);
        debugGrid.position.y = -1.45;
        debugGrid.visible = false;
        scene.add(debugGrid);
        const debugAxes = new THREE.AxesHelper(220);
        debugAxes.visible = false;
        scene.add(debugAxes);

        const debugGroup = new THREE.Group();
        debugGroup.visible = false;
        scene.add(debugGroup);
        const debugAccentMaterial = new THREE.MeshBasicMaterial({
            color: getAccentColor(mount),
            depthTest: false
        });
        const debugLineMaterial = new THREE.LineBasicMaterial({
            color: getAccentColor(mount),
            depthTest: false,
            transparent: true,
            opacity: 0.78
        });
        let lastDebugAccent = '';
        const syncDebugAccent = () => {
            const value = window.getComputedStyle(mount)
                .getPropertyValue('--looks-secondary')
                .trim();
            if (value === lastDebugAccent) return;
            lastDebugAccent = value;
            const color = getAccentColor(mount);
            debugAccentMaterial.color.copy(color);
            debugLineMaterial.color.copy(color);
        };
        const debugTargetMarker = new THREE.Group();
        debugTargetMarker.add(new THREE.Mesh(
            new THREE.TorusGeometry(18, 1.5, 12, 48),
            debugAccentMaterial
        ));
        debugTargetMarker.add(new THREE.Mesh(
            new THREE.SphereGeometry(4, 16, 12),
            new THREE.MeshBasicMaterial({
                color: 0xffffff,
                depthTest: false
            })
        ));
        debugTargetMarker.renderOrder = 40;
        debugGroup.add(debugTargetMarker);
        const debugLineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(),
            new THREE.Vector3()
        ]);
        const debugLookLine = new THREE.Line(
            debugLineGeometry,
            debugLineMaterial
        );
        debugLookLine.renderOrder = 39;
        debugGroup.add(debugLookLine);

        const loader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath(getLocalDracoDecoderPath());
        loader.setDRACOLoader(dracoLoader);
        const textureLoader = new THREE.TextureLoader();
        const rgbeLoader = new RGBELoader();
        const raycaster = new THREE.Raycaster();
        const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const ignoreProgress = () => {};
        const modelCache = new Map();
        const targetObjects = new Map();
        let lastSceneRevision = null;
        let lastBackgroundKey = null;
        let activeBackgroundTexture = null;
        let disposed = false;
        let pointerLockWasRequested = false;
        let lastDebugSnapshotAt = 0;
        let lastCameraSmoothAt = performance.now();
        let lastFrameAt = performance.now();
        let smoothedFrameTime = 16.7;
        let isApplyingStoredCamera = false;
        const firstPersonEuler = new THREE.Euler(0, 0, 0, 'YXZ');
        let thirdPersonYaw = Math.atan2(camera.position.x, camera.position.z);
        let thirdPersonPitch = 0.25;

        const vectorToState = value => ({
            x: Number(value.x.toFixed(3)),
            y: Number(value.y.toFixed(3)),
            z: Number(value.z.toFixed(3))
        });

        const commitLiveCameraState = () => {
            if (isApplyingStoredCamera || !vm || !vm.runtime) return;
            const sceneState = vm.runtime.scratch3dScene;
            if (!sceneState || !sceneState.camera) return;
            const cameraFollow = sceneState.camera.follow || {};
            const mouseState = getMouseState(vm);
            if (cameraFollow.enabled || mouseState.mode !== 'normal') return;

            sceneState.camera.position = vectorToState(camera.position);
            sceneState.camera.target = vectorToState(controls.target);
            if (Array.isArray(sceneState.backdrops) && sceneState.backdrops[sceneState.currentBackdrop]) {
                sceneState.backdrops[sceneState.currentBackdrop].camera = sceneState.camera;
            }
        };
        controls.addEventListener('change', commitLiveCameraState);

        const getFollowTarget = targetId => {
            const targets = (vm && vm.runtime && vm.runtime.targets) || [];
            if (targetId) {
                const target = targets.find(candidate => candidate && candidate.id === targetId);
                if (target && !target.isStage) return target;
            }
            const editingTarget = vm && vm.editingTarget;
            if (editingTarget && !editingTarget.isStage) return editingTarget;
            return targets.find(target => target && !target.isStage && target.modelAssetId) ||
                targets.find(target => target && !target.isStage);
        };

        const getFollowPoint = (targetId, heightOffset = 35) => {
            const target = getFollowTarget(targetId);
            if (!target) return new THREE.Vector3(0, 20, 0);
            return new THREE.Vector3(target.x || 0, (target.y || 0) + heightOffset, target.z || 0);
        };

        const requestPointerLock = () => {
            if (document.pointerLockElement === renderer.domElement || !renderer.domElement.requestPointerLock) return;
            pointerLockWasRequested = true;
            try {
                const result = renderer.domElement.requestPointerLock();
                if (result && result.catch) result.catch(() => {});
            } catch (e) {
                // Pointer lock normally requires a user gesture; the next stage click will try again.
            }
        };

        const releasePointerLock = () => {
            pointerLockWasRequested = false;
            if (document.pointerLockElement === renderer.domElement && document.exitPointerLock) {
                document.exitPointerLock();
            }
        };

        const applyFirstPersonLook = e => {
            const mouseState = getMouseState(vm);
            if (mouseState.mode !== 'first person') return;
            const sensitivity = mouseState.sensitivity || 1;
            firstPersonEuler.setFromQuaternion(camera.quaternion);
            firstPersonEuler.y -= (e.movementX || 0) * 0.002 * sensitivity;
            firstPersonEuler.x -= (e.movementY || 0) * 0.002 * sensitivity;
            firstPersonEuler.x = THREE.MathUtils.clamp(
                firstPersonEuler.x,
                -Math.PI / 2,
                Math.PI / 2
            );
            camera.quaternion.setFromEuler(firstPersonEuler);
            const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
            controls.target.copy(camera.position).add(forward.multiplyScalar(120));
        };

        const positionFollowCamera = (followState = {}) => {
            const target = getFollowPoint(followState.targetId, followState.height);
            const distance = followState.distance || 240;
            const horizontalDistance = Math.cos(thirdPersonPitch) * distance;
            camera.position.set(
                target.x + (Math.sin(thirdPersonYaw) * horizontalDistance),
                target.y + (Math.sin(thirdPersonPitch) * distance),
                target.z + (Math.cos(thirdPersonYaw) * horizontalDistance)
            );
            controls.target.copy(target);
            camera.lookAt(target);
        };

        const positionThirdPersonCamera = () => {
            const mouseState = getMouseState(vm);
            positionFollowCamera({
                distance: mouseState.thirdPersonDistance || 240,
                height: 35
            });
        };

        const applyThirdPersonOrbit = e => {
            const mouseState = getMouseState(vm);
            if (mouseState.mode !== 'third person') return;
            const sensitivity = mouseState.sensitivity || 1;
            thirdPersonYaw -= (e.movementX || 0) * 0.004 * sensitivity;
            thirdPersonPitch = THREE.MathUtils.clamp(
                thirdPersonPitch - ((e.movementY || 0) * 0.003 * sensitivity),
                -0.9,
                1.15
            );
            positionThirdPersonCamera();
        };

        const syncMouseControls = () => {
            const mouseState = getMouseState(vm);
            const wantsPointerLock = mouseState.locked || mouseState.mode === 'first person';
            const blockinumScene = getActiveSceneState(getBlockinumScene(vm));
            const cameraFollow = (blockinumScene.camera && blockinumScene.camera.follow) || {};
            renderer.domElement.style.cursor = mouseState.visible && !wantsPointerLock ? 'default' : 'none';
            controls.enabled = mouseState.mode === 'normal' && !cameraFollow.enabled;
            setNeedsMouseClick(wantsPointerLock && document.pointerLockElement !== renderer.domElement);

            if (!wantsPointerLock) {
                releasePointerLock();
            } else if (document.pointerLockElement !== renderer.domElement) {
                pointerLockWasRequested = false;
            }

            if (mouseState.mode === 'third person') {
                positionThirdPersonCamera();
            }
        };

        const getMouseData = e => {
            const rect = renderer.domElement.getBoundingClientRect();
            const pointerX = (((e.clientX - rect.left) / rect.width) * 2) - 1;
            const pointerY = 1 - (((e.clientY - rect.top) / rect.height) * 2);
            const pointer = new THREE.Vector2(pointerX, pointerY);
            raycaster.setFromCamera(pointer, camera);
            const worldPoint = new THREE.Vector3();
            const hasWorldPoint = raycaster.ray.intersectPlane(groundPlane, worldPoint);
            return {
                button: e.button,
                movementX: e.movementX || 0,
                movementY: e.movementY || 0,
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                z: hasWorldPoint ? worldPoint.z : 0,
                canvasWidth: rect.width,
                canvasHeight: rect.height
            };
        };

        const pickTarget = e => {
            const rect = renderer.domElement.getBoundingClientRect();
            const pointerX = (((e.clientX - rect.left) / rect.width) * 2) - 1;
            const pointerY = 1 - (((e.clientY - rect.top) / rect.height) * 2);
            const pointer = new THREE.Vector2(pointerX, pointerY);
            raycaster.setFromCamera(pointer, camera);
            const objects = Array.from(targetObjects.values());
            const hits = raycaster.intersectObjects(objects, true);
            if (!hits.length) return null;
            let object = hits[0].object;
            while (object && !object.userData.targetId) {
                object = object.parent;
            }
            const targetId = object && object.userData.targetId;
            return targetId && vm.runtime.targets.find(target => target.id === targetId);
        };

        const postMouseMove = e => {
            if (!vm || !vm.postIOData) return;
            vm.postIOData('mouse', getMouseData(e));
            applyFirstPersonLook(e);
            applyThirdPersonOrbit(e);
        };

        const postMouseDown = e => {
            if (!vm || !vm.postIOData) return;
            const mouseState = getMouseState(vm);
            if ((mouseState.locked || mouseState.mode === 'first person') && !pointerLockWasRequested) {
                requestPointerLock();
            }
            vm.postIOData('mouse', {
                ...getMouseData(e),
                isDown: true
            });
            const target = pickTarget(e);
            if (target && vm.runtime && vm.runtime.startHats) {
                vm.runtime.startHats('event_whenthisspriteclicked', null, target);
                vm.runtime.startHats('event_whenthisactorclickedinrange', null, target);
            }
        };

        const postMouseUp = e => {
            if (!vm || !vm.postIOData) return;
            vm.postIOData('mouse', {
                ...getMouseData(e),
                isDown: false
            });
        };

        const postMouseWheel = e => {
            if (!vm || !vm.postIOData) return;
            vm.postIOData('mouseWheel', {
                deltaY: e.deltaY || 0
            });
        };

        renderer.domElement.addEventListener('mousemove', postMouseMove);
        renderer.domElement.addEventListener('mousedown', postMouseDown);
        renderer.domElement.addEventListener('mouseup', postMouseUp);
        renderer.domElement.addEventListener('wheel', postMouseWheel);

        const removeTargetObject = targetId => {
            const object = targetObjects.get(targetId);
            if (!object) return;
            scene.remove(object);
            disposeObject(object);
            targetObjects.delete(targetId);
        };

        const attachMediaPlane = target => {
            const media = target.mediaDisplay;
            if (!media || !media.source) return null;
            const object = new THREE.Group();
            const width = Math.max(1, media.width || 180);
            const height = Math.max(1, media.height || 120);
            const geometry = new THREE.PlaneGeometry(width, height);
            const material = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                side: THREE.DoubleSide,
                transparent: true
            });
            const mesh = new THREE.Mesh(geometry, material);
            object.add(mesh);
            object.userData.targetId = target.id;
            object.userData.kind = 'media';
            object.userData.mediaKey = getMediaKey(media);
            object.userData.mediaRevision = media.revision || 0;
            object.userData.mediaMesh = mesh;
            object.userData.mediaMaterial = material;

            if (media.type === 'video') {
                const video = document.createElement('video');
                video.src = media.source;
                video.crossOrigin = 'anonymous';
                video.loop = true;
                video.muted = true;
                video.playsInline = true;
                video.preload = 'metadata';
                const texture = new THREE.VideoTexture(video);
                texture.colorSpace = THREE.SRGBColorSpace;
                material.map = texture;
                material.needsUpdate = true;
                object.userData.videoElement = video;
                object.userData.mediaTexture = texture;
            } else {
                const texture = new THREE.TextureLoader();
                texture.crossOrigin = 'anonymous';
                texture.load(media.source, loadedTexture => {
                    if (object.userData.mediaTexture) object.userData.mediaTexture.dispose();
                    loadedTexture.colorSpace = THREE.SRGBColorSpace;
                    material.map = loadedTexture;
                    material.needsUpdate = true;
                    object.userData.mediaTexture = loadedTexture;
                    media.loaded = true;
                }, undefined, () => {
                    media.loaded = false;
                });
            }

            scene.add(object);
            targetObjects.set(target.id, object);
            return object;
        };

        const syncMediaObject = (object, target) => {
            const media = target.mediaDisplay;
            if (!media || !object) return;
            applyTargetTransform(object, target);
            if (object.userData.mediaMesh) {
                const width = Math.max(1, media.width || 180);
                const height = Math.max(1, media.height || 120);
                const current = object.userData.mediaMesh.geometry.parameters || {};
                if (current.width !== width || current.height !== height) {
                    object.userData.mediaMesh.geometry.dispose();
                    object.userData.mediaMesh.geometry = new THREE.PlaneGeometry(width, height);
                }
            }
            const video = object.userData.videoElement;
            if (video) {
                media.loaded = video.readyState >= 2;
                media.currentTime = video.currentTime || 0;
                media.duration = Number.isFinite(video.duration) ? video.duration : 0;
                if (object.userData.lastRestartToken !== media.restartToken) {
                    video.currentTime = 0;
                    object.userData.lastRestartToken = media.restartToken;
                }
                if (media.playing && video.paused) {
                    video.play().catch(() => {});
                } else if (!media.playing && !video.paused) {
                    video.pause();
                }
            }
        };

        const loadModel = target => {
            const assetId = target.modelAssetId;
            const cacheKey = targetModelCacheKey(target);
            if (!assetId || !target.modelAssetDataUri || !cacheKey) return;
            if (modelCache.has(cacheKey)) return;

            const promise = loader.loadAsync(target.modelAssetDataUri)
                .then(gltf => {
                    setLoadError(null);
                    return gltf.scene;
                })
                .catch(error => {
                    // eslint-disable-next-line no-console
                    console.warn(`Amethyst failed to load ${target.modelAssetName || assetId}`, error);
                    setLoadError(target.modelAssetName || 'model');
                    modelCache.delete(cacheKey);
                    return null;
                });
            modelCache.set(cacheKey, promise);
        };

        const attachLoadedModel = (targetId, assetId, dataUri, cacheKey, modelScene) => {
            if (disposed || !modelScene || targetObjects.has(targetId)) return;
            const currentTarget = findRenderableTarget(vm, targetId, assetId, dataUri);
            if (!currentTarget) return;

            setLoadError(null);
            const object = new THREE.Group();
            const modelObject = cloneScene(modelScene);
            object.add(modelObject);
            object.userData.targetId = targetId;
            object.userData.modelAssetId = assetId;
            object.userData.modelCacheKey = cacheKey;
            object.userData.modelObject = modelObject;
            scene.add(object);
            targetObjects.set(targetId, object);
        };

        const queueModelAttach = (targetId, assetId, dataUri, cacheKey, cached) => {
            cached.then(modelScene => attachLoadedModel(targetId, assetId, dataUri, cacheKey, modelScene));
        };

        const syncTargets = () => {
            const targets = (vm && vm.runtime && vm.runtime.targets) || [];
            const seen = new Set();

            for (const target of targets) {
                if (!target || target.isStage) continue;
                const media = target.mediaDisplay;
                if (media && media.source) {
                    seen.add(target.id);
                    const existing = targetObjects.get(target.id);
                    if (!existing || existing.userData.kind !== 'media' || existing.userData.mediaKey !== getMediaKey(media)) {
                        removeTargetObject(target.id);
                        attachMediaPlane(target);
                    }
                    syncMediaObject(targetObjects.get(target.id), target);
                    continue;
                }
                if (!target.modelAssetId || !target.modelAssetDataUri) continue;
                seen.add(target.id);
                loadModel(target);

                if (targetObjectNeedsReplacement(targetObjects.get(target.id), target)) {
                    removeTargetObject(target.id);
                }

                if (!targetObjects.has(target.id)) {
                    const targetId = target.id;
                    const assetId = target.modelAssetId;
                    const dataUri = target.modelAssetDataUri;
                    const cacheKey = targetModelCacheKey(target);
                    const cached = modelCache.get(cacheKey);
                    if (cached) {
                        queueModelAttach(targetId, assetId, dataUri, cacheKey, cached);
                    }
                }

                const object = targetObjects.get(target.id);
                if (object) {
                    applyTargetTransform(object, target);
                    if (object.userData.modelObject) {
                        object.userData.modelObject.position.copy(pivotFromTarget(target).multiplyScalar(-1));
                        applyModelPartTransforms(object.userData.modelObject, target.modelPartTransforms || {});
                        object.userData.modelObject.traverse(node => {
                            if (!node.isMesh || !node.material) return;
                            const partTransform = getPartTransform(node, target.modelPartTransforms || {});
                            const materials = Array.isArray(node.material) ? node.material : [node.material];
                            materials.forEach(material => {
                                if (!material.color) return;
                                if (!material.userData.scratch3dBaseColor) {
                                    material.userData.scratch3dBaseColor = material.color.clone();
                                }
                                if (partTransform && partTransform.color) {
                                    material.color.set(partTransform.color);
                                } else if (target.modelColor) {
                                    material.color.set(target.modelColor);
                                } else {
                                    material.color.copy(material.userData.scratch3dBaseColor);
                                }
                            });
                        });
                    }
                }
            }

            Array.from(targetObjects.keys()).forEach(targetId => {
                if (!seen.has(targetId)) removeTargetObject(targetId);
            });
        };

        const applyCameraState = (cameraState, forceInstant = false) => {
            const cameraPosition = vectorFromState(cameraState.position || {x: 260, y: 180, z: 420});
            const cameraTarget = vectorFromState(cameraState.target || {x: 0, y: 20, z: 0});
            const smoothingDuration = Math.max(0, cameraState.smoothingDuration || 0);
            const now = performance.now();
            const elapsed = now - lastCameraSmoothAt;
            lastCameraSmoothAt = now;
            const alpha = forceInstant || smoothingDuration <= 0 ?
                1 :
                THREE.MathUtils.clamp(elapsed / (smoothingDuration * 1000), 0.02, 1);

            isApplyingStoredCamera = true;
            camera.position.lerp(cameraPosition, alpha);
            controls.target.lerp(cameraTarget, alpha);
            camera.fov = typeof cameraState.fov === 'number' ? cameraState.fov : 55;
            camera.updateProjectionMatrix();
            controls.update();
            isApplyingStoredCamera = false;
        };

        const syncSceneControls = () => {
            const blockinumScene = getActiveSceneState(getBlockinumScene(vm));
            const cameraState = blockinumScene.camera || {};
            const lightingState = blockinumScene.lighting || {};
            const backgroundState = blockinumScene.background || {};

            ambientLight.intensity = typeof lightingState.ambient === 'number' ? lightingState.ambient : 1.6;
            keyLight.intensity = typeof lightingState.key === 'number' ? lightingState.key : 1.2;
            fillLight.intensity = Math.max(0.2, keyLight.intensity * 0.35);
            keyLight.color.set(lightingState.keyColor || '#ffffff');
            fillLight.color.set(lightingState.keyColor || '#ffffff');
            keyLight.position.copy(vectorFromState(lightingState.keyPosition || {x: 180, y: 320, z: 240}));

            if (lastSceneRevision === blockinumScene.revision) {
                if (cameraState.follow && cameraState.follow.enabled) {
                    positionFollowCamera(cameraState.follow);
                    camera.fov = typeof cameraState.fov === 'number' ? cameraState.fov : 55;
                    camera.updateProjectionMatrix();
                    controls.update();
                    lastCameraSmoothAt = performance.now();
                } else {
                    applyCameraState(cameraState);
                }
                return;
            }
            lastSceneRevision = blockinumScene.revision;

            const backgroundKey = [
                backgroundState.mode,
                backgroundState.skyColor,
                backgroundState.groundColor,
                backgroundState.fogAmount,
                backgroundState.imageDataUri
            ].join('|');
            if (backgroundKey !== lastBackgroundKey) {
                lastBackgroundKey = backgroundKey;
                if (activeBackgroundTexture) {
                    activeBackgroundTexture.dispose();
                    activeBackgroundTexture = null;
                }
                scene.environment = null;
                groundMesh.visible = true;
                groundMaterial.color.set(backgroundState.groundColor || '#d7eef7');
                const fogAmount = Math.max(0, Math.min(100, backgroundState.fogAmount || 0));
                scene.fog = fogAmount > 0 ?
                    new THREE.FogExp2(backgroundState.skyColor || '#8fc6ff', fogAmount * 0.00022) :
                    null;
                if ((backgroundState.mode === 'image' || backgroundState.mode === 'hdri') &&
                    backgroundState.imageDataUri) {
                    const applyTexture = texture => {
                        if (disposed || backgroundKey !== lastBackgroundKey) {
                            texture.dispose();
                            return;
                        }
                        texture.mapping = THREE.EquirectangularReflectionMapping;
                        if (backgroundState.mode !== 'hdri') {
                            texture.colorSpace = THREE.SRGBColorSpace;
                        }
                        scene.background = texture;
                        scene.environment = texture;
                        groundMesh.visible = false;
                        activeBackgroundTexture = texture;
                    };
                    const onError = error => {
                        if (disposed || backgroundKey !== lastBackgroundKey) return;
                        // eslint-disable-next-line no-console
                        console.warn('Amethyst failed to load scene background', error);
                        scene.background = new THREE.Color(backgroundState.skyColor || '#8fc6ff');
                        groundMesh.visible = true;
                    };
                    if (backgroundState.mode === 'hdri') {
                        rgbeLoader.load(backgroundState.imageDataUri, applyTexture, ignoreProgress, onError);
                    } else {
                        textureLoader.load(backgroundState.imageDataUri, applyTexture, ignoreProgress, onError);
                    }
                } else {
                    scene.background = new THREE.Color(backgroundState.skyColor || '#8fc6ff');
                }
            }

            if (cameraState.follow && cameraState.follow.enabled) {
                positionFollowCamera(cameraState.follow);
                camera.fov = typeof cameraState.fov === 'number' ? cameraState.fov : 55;
                camera.updateProjectionMatrix();
                controls.update();
                lastCameraSmoothAt = performance.now();
                return;
            }
            applyCameraState(cameraState, (cameraState.smoothingDuration || 0) <= 0);
        };

        let frameId = null;
        const animate = () => {
            const frameNow = performance.now();
            const frameTime = Math.max(0.1, frameNow - lastFrameAt);
            lastFrameAt = frameNow;
            smoothedFrameTime = (smoothedFrameTime * 0.9) + (frameTime * 0.1);
            syncSceneControls();
            syncMouseControls();
            syncTargets();
            syncDebugAccent();
            const debugMode = stageModeRef.current === 'debug';
            const debugHelpers = debugSettingsRef.current.helpers || DEFAULT_DEBUG_SETTINGS.helpers;
            debugGrid.visible = debugMode && Boolean(debugHelpers.grid);
            debugAxes.visible = debugMode && Boolean(debugHelpers.axes);
            debugGroup.visible = debugMode && (Boolean(debugHelpers.cameraRay) || Boolean(debugHelpers.targetPoint));
            debugLookLine.visible = Boolean(debugHelpers.cameraRay);
            debugTargetMarker.visible = Boolean(debugHelpers.targetPoint);
            if (debugMode) {
                const debugStart = camera.position.clone();
                const debugEnd = controls.target.clone();
                const linePositions = debugLineGeometry.attributes.position;
                linePositions.setXYZ(0, debugStart.x, debugStart.y, debugStart.z);
                linePositions.setXYZ(1, debugEnd.x, debugEnd.y, debugEnd.z);
                linePositions.needsUpdate = true;
                debugTargetMarker.position.copy(debugEnd);
                debugTargetMarker.lookAt(camera.position);
                const now = performance.now();
                if (now - lastDebugSnapshotAt > 120) {
                    lastDebugSnapshotAt = now;
                    setDebugSnapshot(buildDebugSnapshot(
                        camera,
                        controls,
                        renderer,
                        vm,
                        targetObjects,
                        getMouseState(vm),
                        getActiveSceneState(getBlockinumScene(vm)),
                        {
                            fps: 1000 / smoothedFrameTime,
                            frameTime: smoothedFrameTime
                        }
                    ));
                }
            }
            controls.update();
            renderer.render(scene, camera);
            frameId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            disposed = true;
            if (frameId !== null) cancelAnimationFrame(frameId);
            controls.removeEventListener('change', commitLiveCameraState);
            controls.dispose();
            dracoLoader.dispose();
            renderer.domElement.removeEventListener('mousemove', postMouseMove);
            renderer.domElement.removeEventListener('mousedown', postMouseDown);
            renderer.domElement.removeEventListener('mouseup', postMouseUp);
            renderer.domElement.removeEventListener('wheel', postMouseWheel);
            targetObjects.forEach(object => scene.remove(object));
            targetObjects.clear();
            if (activeBackgroundTexture) {
                activeBackgroundTexture.dispose();
            }
            debugGrid.geometry.dispose();
            const debugGridMaterials = Array.isArray(debugGrid.material) ? debugGrid.material : [debugGrid.material];
            debugGridMaterials.forEach(material => material.dispose());
            debugAxes.dispose();
            groundMesh.geometry.dispose();
            groundMaterial.dispose();
            scene.remove(debugGroup);
            renderer.dispose();
            if (renderer.domElement.parentNode === mount) {
                mount.removeChild(renderer.domElement);
            }
            rendererRef.current = null;
            cameraRef.current = null;
        };
    }, [height, vm, width]);

    useEffect(() => {
        const renderer = rendererRef.current;
        const camera = cameraRef.current;
        if (!renderer || !camera) return;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }, [height, width]);

    const updateDebugLayout = layout => {
        setDebugSettings(settings => normalizeDebugSettings({
            ...settings,
            layout
        }));
    };
    const toggleDebugSetting = (group, id) => {
        setDebugSettings(settings => normalizeDebugSettings({
            ...settings,
            [group]: {
                ...settings[group],
                [id]: !settings[group][id]
            }
        }));
    };
    const handleDebugSettingsButtonClick = () => {
        setDebugSettingsOpen(!debugSettingsOpen);
    };
    const handleDebugLayoutClick = event => {
        updateDebugLayout(event.currentTarget.dataset.layout);
    };
    const handleDebugToggleChange = event => {
        toggleDebugSetting(event.currentTarget.dataset.group, event.currentTarget.dataset.id);
    };
    const renderDebugRow = (label, value) => (
        <React.Fragment key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
        </React.Fragment>
    );
    const renderDebugSection = (id, title, badge, rows) => {
        if (debugSettings.layout === 'compact') return null;
        if (debugSettings.layout === 'custom' && !debugSettings.sections[id]) return null;
        return (
            <div className={styles.debugSection}>
                <div className={styles.debugHeader}>
                    <span>{title}</span>
                    <strong>{badge}</strong>
                </div>
                <dl>
                    {rows.map(row => renderDebugRow(row[0], row[1]))}
                </dl>
            </div>
        );
    };
    const renderDebugToggle = (group, id, label) => (
        <label
            className={styles.debugToggle}
            key={`${group}-${id}`}
            title={label}
        >
            <input
                checked={Boolean(debugSettings[group][id])}
                data-group={group}
                data-id={id}
                onChange={handleDebugToggleChange}
                type="checkbox"
            />
            <span>{label}</span>
        </label>
    );
    const activeSections = debugSettings.layout === 'full' ?
        DEFAULT_DEBUG_SETTINGS.sections :
        debugSettings.sections;

    return (
        <div
            aria-label="Amethyst stage"
            className={styles.stage3d}
            ref={mountRef}
            style={{height, width}}
        >
            {stageMode === 'debug' && debugSnapshot ? (
                <div
                    className={styles.debugOverlay}
                    title="Amethyst debug values"
                >
                    <div className={styles.debugHeader}>
                        <span>{'Amethyst Debug'}</span>
                        <button
                            className={styles.debugSettingsButton}
                            onClick={handleDebugSettingsButtonClick}
                            title="Customize debug overlay"
                            type="button"
                        >
                            {'F3'}
                        </button>
                    </div>
                    <div className={styles.debugCompact}>
                        <span>{`FPS ${formatNumber(debugSnapshot.performance.fps)}`}</span>
                        <span>{`Actors ${debugSnapshot.actorCount}/${debugSnapshot.targetCount}`}</span>
                        <span>{`Cam ${formatVector(debugSnapshot.cameraPosition)}`}</span>
                        <span>{debugSnapshot.selectedTarget ?
                            `Actor ${debugSnapshot.selectedTarget.name || 'Selected'}` :
                            'Actor none'}</span>
                    </div>
                    {debugSettingsOpen ? (
                        <div className={styles.debugSettingsPanel}>
                            <div className={styles.debugSegmented}>
                                {['compact', 'full', 'custom'].map(layout => (
                                    <button
                                        className={debugSettings.layout === layout ? styles.activeDebugLayout : ''}
                                        data-layout={layout}
                                        key={layout}
                                        onClick={handleDebugLayoutClick}
                                        type="button"
                                    >
                                        {layout}
                                    </button>
                                ))}
                            </div>
                            <div className={styles.debugSettingsGrid}>
                                {Object.keys(DEFAULT_DEBUG_SETTINGS.sections).map(id => renderDebugToggle(
                                    'sections',
                                    id,
                                    id
                                ))}
                            </div>
                            <div className={styles.debugSettingsGrid}>
                                {Object.keys(DEFAULT_DEBUG_SETTINGS.helpers).map(id => renderDebugToggle(
                                    'helpers',
                                    id,
                                    id
                                ))}
                            </div>
                        </div>
                    ) : null}
                    {activeSections.performance ? renderDebugSection('performance', 'Performance', 'F3', [
                        ['fps', formatNumber(debugSnapshot.performance.fps)],
                        ['frame', `${formatNumber(debugSnapshot.performance.frameTime)} ms`],
                        ['draws', debugSnapshot.performance.calls],
                        ['tris', debugSnapshot.performance.triangles]
                    ]) : null}
                    {activeSections.camera ? renderDebugSection(
                        'camera',
                        'Camera',
                        debugSnapshot.followEnabled ? 'Follow' : 'Free',
                        [
                            ['pos', formatVector(debugSnapshot.cameraPosition)],
                            ['at', formatVector(debugSnapshot.cameraTarget)],
                            ['dir', formatVector(debugSnapshot.direction)],
                            ['fov', formatNumber(debugSnapshot.cameraFov)]
                        ]
                    ) : null}
                    {activeSections.actor && debugSnapshot.selectedTarget ? renderDebugSection(
                        'actor',
                        debugSnapshot.selectedTarget.name || 'Actor',
                        debugSnapshot.selectedTarget.visible ? 'Visible' : 'Hidden',
                        [
                            ['pos', formatVector(debugSnapshot.selectedTarget.position)],
                            ['rot', [
                                formatNumber(debugSnapshot.selectedTarget.rotation.yaw),
                                formatNumber(debugSnapshot.selectedTarget.rotation.pitch),
                                formatNumber(debugSnapshot.selectedTarget.rotation.roll)
                            ].join(', ')],
                            ['scale', formatNumber(debugSnapshot.selectedTarget.scale)],
                            ['pivot', formatVector(debugSnapshot.selectedTarget.pivot)],
                            ['model', debugSnapshot.selectedTarget.costume]
                        ]
                    ) : null}
                    {activeSections.environment ? renderDebugSection(
                        'environment',
                        'Environment',
                        debugSnapshot.environment.skyMode,
                        [
                            ['sky', debugSnapshot.environment.skyColor],
                            ['ground', debugSnapshot.environment.groundColor],
                            ['fog', formatNumber(debugSnapshot.environment.fogAmount)],
                            ['ambient', formatNumber(debugSnapshot.environment.ambient)],
                            ['sun', debugSnapshot.environment.sunColor]
                        ]
                    ) : null}
                    {activeSections.input ? renderDebugSection(
                        'input',
                        'Input',
                        debugSnapshot.mouseLocked ? 'Locked' : 'Free',
                        [
                            ['mouse', debugSnapshot.mouseMode],
                            ['visible', debugSnapshot.mouseVisible ? 'yes' : 'no'],
                            ['sens', formatNumber(debugSnapshot.mouseSensitivity)]
                        ]
                    ) : null}
                </div>
            ) : null}
            {loadError ? (
                <div className={styles.modelLoadError}>
                    {`Could not load ${loadError}. Use GLB, or embedded GLTF.`}
                </div>
            ) : null}
            {needsMouseClick ? (
                <div className={styles.pointerLockHint}>
                    {'Click the stage to use mouse control'}
                </div>
            ) : null}
        </div>
    );
};

Stage3D.propTypes = {
    height: PropTypes.number.isRequired,
    vm: PropTypes.shape({
        editingTarget: PropTypes.shape({
            isStage: PropTypes.bool,
            modelAssetId: PropTypes.string,
            x: PropTypes.number,
            y: PropTypes.number,
            z: PropTypes.number
        }),
        postIOData: PropTypes.func,
        runtime: PropTypes.shape({
            startHats: PropTypes.func,
            targets: PropTypes.array
        })
    }).isRequired,
    width: PropTypes.number.isRequired
};

export default Stage3D;
