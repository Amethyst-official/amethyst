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
    findRenderableTarget,
    targetObjectNeedsReplacement
} from '../../lib/scratch3d/stage3d-target-sync.js';
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
    return normalizeModelForStage(clone);
};

const getBlockinumScene = vm => (vm && vm.runtime && vm.runtime.scratch3dScene) || {
    revision: 0,
    camera: {
        position: {x: 260, y: 180, z: 420},
        target: {x: 0, y: 20, z: 0},
        fov: 55
    },
    lighting: {
        ambient: 1.6,
        key: 1.2,
        keyPosition: {x: 180, y: 320, z: 240}
    },
    background: {
        mode: 'sky',
        skyColor: '#8fc6ff',
        groundColor: '#d7eef7',
        imageDataUri: null,
        imageName: null
    }
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

const Stage3D = ({height, vm, width}) => {
    const mountRef = useRef(null);
    const rendererRef = useRef(null);
    const cameraRef = useRef(null);
    const [loadError, setLoadError] = useState(null);

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

        const grid = new THREE.GridHelper(480, 12, 0x445f72, 0x8da1ad);
        grid.position.y = -1;
        scene.add(grid);

        const loader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
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
        };

        const postMouseDown = e => {
            if (!vm || !vm.postIOData) return;
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
                deltaX: e.deltaX,
                deltaY: e.deltaY
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
            targetObjects.delete(targetId);
        };

        const loadModel = target => {
            const assetId = target.modelAssetId;
            if (!assetId || !target.modelAssetDataUri) return;
            if (modelCache.has(assetId)) return;

            const promise = loader.loadAsync(target.modelAssetDataUri)
                .then(gltf => {
                    setLoadError(null);
                    return gltf.scene;
                })
                .catch(error => {
                    // eslint-disable-next-line no-console
                    console.warn(`blockinum3D failed to load ${target.modelAssetName || assetId}`, error);
                    setLoadError(target.modelAssetName || 'model');
                    modelCache.delete(assetId);
                    return null;
                });
            modelCache.set(assetId, promise);
        };

        const attachLoadedModel = (targetId, assetId, modelScene) => {
            if (disposed || !modelScene || targetObjects.has(targetId)) return;
            const currentTarget = findRenderableTarget(vm, targetId, assetId);
            if (!currentTarget) return;

            setLoadError(null);
            const object = new THREE.Group();
            const modelObject = cloneScene(modelScene);
            object.add(modelObject);
            object.userData.targetId = targetId;
            object.userData.modelAssetId = assetId;
            object.userData.modelObject = modelObject;
            scene.add(object);
            targetObjects.set(targetId, object);
        };

        const queueModelAttach = (targetId, assetId, cached) => {
            cached.then(modelScene => attachLoadedModel(targetId, assetId, modelScene));
        };

        const syncTargets = () => {
            const targets = (vm && vm.runtime && vm.runtime.targets) || [];
            const seen = new Set();

            for (const target of targets) {
                if (!target || target.isStage || !target.modelAssetId || !target.modelAssetDataUri) continue;
                seen.add(target.id);
                loadModel(target);

                if (targetObjectNeedsReplacement(targetObjects.get(target.id), target)) {
                    removeTargetObject(target.id);
                }

                if (!targetObjects.has(target.id)) {
                    const targetId = target.id;
                    const assetId = target.modelAssetId;
                    const cached = modelCache.get(target.modelAssetId);
                    if (cached) {
                        queueModelAttach(targetId, assetId, cached);
                    }
                }

                const object = targetObjects.get(target.id);
                if (object) {
                    object.position.set(target.x || 0, target.y || 0, target.z || 0);
                    object.visible = target.visible !== false;
                    object.rotation.y = THREE.MathUtils.degToRad(90 - (target.direction || 90));
                    object.rotation.x = THREE.MathUtils.degToRad(target.pitch || 0);
                    object.rotation.z = THREE.MathUtils.degToRad(target.roll || 0);
                    const scale = (target.size || 100) / 100;
                    object.scale.setScalar(scale);
                    if (object.userData.modelObject) {
                        object.userData.modelObject.position.copy(pivotFromTarget(target).multiplyScalar(-1));
                        object.userData.modelObject.traverse(node => {
                            if (!node.isMesh || !node.material) return;
                            const materials = Array.isArray(node.material) ? node.material : [node.material];
                            materials.forEach(material => {
                                if (!material.color) return;
                                if (!material.userData.scratch3dBaseColor) {
                                    material.userData.scratch3dBaseColor = material.color.clone();
                                }
                                if (target.modelColor) {
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

        const syncSceneControls = () => {
            const blockinumScene = getActiveSceneState(getBlockinumScene(vm));
            const cameraState = blockinumScene.camera || {};
            const lightingState = blockinumScene.lighting || {};
            const backgroundState = blockinumScene.background || {};

            ambientLight.intensity = typeof lightingState.ambient === 'number' ? lightingState.ambient : 1.6;
            keyLight.intensity = typeof lightingState.key === 'number' ? lightingState.key : 1.2;
            fillLight.intensity = Math.max(0.2, keyLight.intensity * 0.35);
            keyLight.position.copy(vectorFromState(lightingState.keyPosition || {x: 180, y: 320, z: 240}));

            if (lastSceneRevision === blockinumScene.revision) return;
            lastSceneRevision = blockinumScene.revision;

            const backgroundKey = [
                backgroundState.mode,
                backgroundState.skyColor,
                backgroundState.groundColor,
                backgroundState.imageDataUri
            ].join('|');
            if (backgroundKey !== lastBackgroundKey) {
                lastBackgroundKey = backgroundKey;
                if (activeBackgroundTexture) {
                    activeBackgroundTexture.dispose();
                    activeBackgroundTexture = null;
                }
                scene.environment = null;
                grid.visible = true;
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
                        grid.visible = false;
                        activeBackgroundTexture = texture;
                    };
                    const onError = error => {
                        if (disposed || backgroundKey !== lastBackgroundKey) return;
                        // eslint-disable-next-line no-console
                        console.warn('blockinum3D failed to load scene background', error);
                        scene.background = new THREE.Color(backgroundState.skyColor || '#8fc6ff');
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

            const cameraPosition = vectorFromState(cameraState.position || {x: 260, y: 180, z: 420});
            const cameraTarget = vectorFromState(cameraState.target || {x: 0, y: 20, z: 0});
            camera.position.copy(cameraPosition);
            camera.fov = typeof cameraState.fov === 'number' ? cameraState.fov : 55;
            camera.updateProjectionMatrix();
            controls.target.copy(cameraTarget);
            controls.update();
        };

        let frameId = null;
        const animate = () => {
            syncSceneControls();
            syncTargets();
            controls.update();
            renderer.render(scene, camera);
            frameId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            disposed = true;
            if (frameId !== null) cancelAnimationFrame(frameId);
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

    return (
        <div
            aria-label="blockinum3D stage"
            className={styles.stage3d}
            ref={mountRef}
            style={{height, width}}
        >
            {loadError ? (
                <div className={styles.modelLoadError}>
                    {`Could not load ${loadError}. Use GLB, or embedded GLTF.`}
                </div>
            ) : null}
        </div>
    );
};

Stage3D.propTypes = {
    height: PropTypes.number.isRequired,
    vm: PropTypes.shape({
        postIOData: PropTypes.func,
        runtime: PropTypes.shape({
            startHats: PropTypes.func,
            targets: PropTypes.array
        })
    }).isRequired,
    width: PropTypes.number.isRequired
};

export default Stage3D;
