import PropTypes from 'prop-types';
import React, {useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {clone as cloneGltfScene} from 'three/examples/jsm/utils/SkeletonUtils.js';

import {normalizeModelForStage} from '../../lib/scratch3d/model-normalizer.js';
import styles from './model-preview.css';

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
    return normalizeModelForStage(clone);
};

const ModelPreview = ({modelDataUri, modelName}) => {
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
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
        loader.setDRACOLoader(dracoLoader);

        let frameId = null;
        let disposed = false;
        let model = null;
        const render = () => {
            controls.update();
            renderer.render(scene, camera);
            frameId = requestAnimationFrame(render);
        };
        render();

        setError(null);
        loader.loadAsync(modelDataUri)
            .then(gltf => {
                if (disposed) return;
                model = prepareModel(gltf.scene);
                scene.add(model);
            })
            .catch(() => {
                if (!disposed) {
                    setError(modelName || 'model');
                }
            });

        return () => {
            disposed = true;
            if (frameId !== null) cancelAnimationFrame(frameId);
            if (model) scene.remove(model);
            controls.dispose();
            dracoLoader.dispose();
            renderer.dispose();
            if (renderer.domElement.parentNode === mount) {
                mount.removeChild(renderer.domElement);
            }
        };
    }, [modelDataUri, modelName]);

    return (
        <div
            className={styles.preview}
            ref={mountRef}
        >
            {modelDataUri ? null : (
                <div className={styles.empty}>{'Upload a GLB or embedded GLTF model'}</div>
            )}
            {error ? (
                <div className={styles.error}>{`Could not preview ${error}`}</div>
            ) : null}
        </div>
    );
};

ModelPreview.propTypes = {
    modelDataUri: PropTypes.string,
    modelName: PropTypes.string
};

export default ModelPreview;
