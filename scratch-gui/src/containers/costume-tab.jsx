import PropTypes from 'prop-types';
import React from 'react';
import bindAll from 'lodash.bindall';
import {defineMessages, intlShape, injectIntl} from 'react-intl';
import VM from 'scratch-vm';

import AssetPanel from '../components/asset-panel/asset-panel.jsx';
import Box from '../components/box/box.jsx';
import {connect} from 'react-redux';
import errorBoundaryHOC from '../lib/error-boundary-hoc.jsx';
import DragConstants from '../lib/drag-constants';
import {showStandardAlert, closeAlertWithId} from '../reducers/alerts';
import fileUploadIcon from '../components/action-menu/icon--file-upload.svg';
import backdropIcon from '../components/action-menu/icon--backdrop.svg';
import downloadBlob from '../lib/download-blob';
import ModelPreview from '../components/stage-3d/model-preview.jsx';
import styles from './costume-tab.css';

const messages = defineMessages({
    addFileModelMsg: {
        defaultMessage: 'Upload Model',
        description: 'Button to add a 3D model in the editor tab',
        id: 'gui.costumeTab.addFileModel'
    },
    noModelMsg: {
        defaultMessage: 'No model',
        description: 'Label shown when an actor does not have a 3D model',
        id: 'gui.costumeTab.noModel'
    },
    modelDetailsMsg: {
        defaultMessage: 'GLB or embedded GLTF actor model',
        description: 'Details shown for an actor model asset',
        id: 'gui.costumeTab.modelDetails'
    },
    uploadModelPromptMsg: {
        defaultMessage: 'Upload a GLB model, or an embedded GLTF model',
        description: 'Prompt shown when an actor does not have a model',
        id: 'gui.costumeTab.uploadModelPrompt'
    },
    unsupportedModelMsg: {
        defaultMessage: 'Use .glb, or .gltf with all data embedded. Separate .bin/.png files are not supported yet.',
        description: 'Message shown when a 3D model file cannot be imported in the first model importer',
        id: 'gui.costumeTab.unsupportedModel'
    },
    stageSkyBackgroundMsg: {
        defaultMessage: '3D sky background',
        description: 'Label shown for the current Amethyst scene background',
        id: 'gui.costumeTab.stageSkyBackground'
    }
});

const iconGraphic = icon => {
    const shared = {
        'aria-hidden': true,
        'className': styles.iconSvg,
        'focusable': 'false',
        'viewBox': '0 0 24 24'
    };
    switch (icon) {
    case 'add':
        return (
            <svg {...shared}>
                <path d="M12 5v14M5 12h14" />
            </svg>
        );
    case 'upload':
        return (
            <svg {...shared}>
                <path d="M12 17V5M7 10l5-5 5 5M5 19h14" />
            </svg>
        );
    case 'export':
        return (
            <svg {...shared}>
                <path d="M12 5v12M7 12l5 5 5-5M5 19h14" />
            </svg>
        );
    case 'delete':
        return (
            <svg {...shared}>
                <path d="M8 8l8 8M16 8l-8 8M7 5h10M9 5l1-2h4l1 2M6 5l1 16h10l1-16" />
            </svg>
        );
    case 'sky':
        return (
            <svg {...shared}>
                <path d="M4 16c2-4 4-6 8-6s6 2 8 6M7 17h10M12 3v3M5.5 5.5l2 2M18.5 5.5l-2 2" />
            </svg>
        );
    case 'image':
        return (
            <svg {...shared}>
                <rect
                    height="14"
                    rx="2"
                    width="16"
                    x="4"
                    y="5"
                />
                <path d="M7 16l4-4 3 3 2-2 3 3M8 8h.01" />
            </svg>
        );
    case 'hdri':
        return (
            <svg {...shared}>
                <circle
                    cx="12"
                    cy="12"
                    r="7"
                />
                <path d="M5 12h14M12 5c2 2 3 4.3 3 7s-1 5-3 7M12 5c-2 2-3 4.3-3 7s1 5 3 7" />
            </svg>
        );
    case 'palette':
        return (
            <svg {...shared}>
                <circle
                    cx="12"
                    cy="12"
                    r="8"
                />
                <path d="M16 14a2 2 0 0 0 0 4h1" />
                <path d="M8 10h.01M10 7.5h.01M14 7.5h.01M16 10h.01" />
            </svg>
        );
    case 'ground':
        return (
            <svg {...shared}>
                <path d="M4 16c3-2 5-2 8 0s5 2 8 0M5 19h14M9 12l3-7 3 7" />
            </svg>
        );
    case 'camera':
        return (
            <svg {...shared}>
                <path d="M4 8h4l2-3h4l2 3h4v11H4Z" />
                <circle
                    cx="12"
                    cy="13"
                    r="3"
                />
            </svg>
        );
    case 'target':
        return (
            <svg {...shared}>
                <circle
                    cx="12"
                    cy="12"
                    r="7"
                />
                <circle
                    cx="12"
                    cy="12"
                    r="2"
                />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
            </svg>
        );
    case 'zoom':
        return (
            <svg {...shared}>
                <circle
                    cx="10"
                    cy="10"
                    r="5"
                />
                <path d="M14 14l6 6M10 7v6M7 10h6" />
            </svg>
        );
    case 'ambient':
        return (
            <svg {...shared}>
                <path d="M12 4v16M4 12h16M6.5 6.5l11 11M17.5 6.5l-11 11" />
            </svg>
        );
    case 'sun':
        return (
            <svg {...shared}>
                <circle
                    cx="12"
                    cy="12"
                    r="3"
                />
                <path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1" />
            </svg>
        );
    case 'clear':
        return (
            <svg {...shared}>
                <path d="M5 19 19 5M8 6h8l2 2-9 9H5v-4Z" />
            </svg>
        );
    case 'reset':
        return (
            <svg {...shared}>
                <path d="M8 7H5V4M5.4 7A8 8 0 1 1 4 12" />
            </svg>
        );
    case 'scale':
        return (
            <svg {...shared}>
                <path d="M5 19h6M5 19v-6M5 19l6-6M19 5h-6M19 5v6M19 5l-6 6" />
            </svg>
        );
    case 'yaw':
        return (
            <svg {...shared}>
                <path d="M5 12c0-4 3-7 7-7 2.8 0 5.3 1.7 6.4 4.1M19 5v4h-4" />
                <path d="M19 12c0 4-3 7-7 7-2.8 0-5.3-1.7-6.4-4.1M5 19v-4h4" />
            </svg>
        );
    case 'pivot':
        return (
            <svg {...shared}>
                <circle
                    cx="12"
                    cy="12"
                    r="2"
                />
                <path d="M12 4v6M12 14v6M4 12h6M14 12h6" />
            </svg>
        );
    case 'move':
        return (
            <svg {...shared}>
                <path d="M12 3v18M3 12h18" />
                <path d="M12 3l3 3M12 3 9 6M21 12l-3 3M21 12l-3-3" />
                <path d="M12 21l3-3M12 21l-3-3M3 12l3 3M3 12l3-3" />
            </svg>
        );
    case 'rotate':
        return (
            <svg {...shared}>
                <path d="M17 3v5h-5M16.5 8A7 7 0 1 0 19 13" />
            </svg>
        );
    case 'part':
        return (
            <svg {...shared}>
                <path d="M12 3 4 7v10l8 4 8-4V7Z" />
                <path d="M4 7l8 4 8-4M12 11v10" />
            </svg>
        );
    default:
        return null;
    }
};

class CostumeTab extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleActorDirectionChange',
            'handleActorSizeChange',
            'handleBackgroundFileUpload',
            'handleBackgroundModeChange',
            'handleBackgroundUploadClick',
            'handleCameraFovChange',
            'handleCameraVectorInput',
            'handleCameraVectorChange',
            'handleVectorScrubEnd',
            'handleVectorScrubMove',
            'handleVectorScrubStart',
            'handleAmbientLightChange',
            'handleDeleteSceneBackdrop',
            'handleGroundColorChange',
            'handleKeyLightChange',
            'handleNewSceneBackdrop',
            'handleModelColorChange',
            'handleModelColorClear',
            'handlePartColorChange',
            'handlePartColorClear',
            'handlePartTransformInput',
            'handlePartTransformReset',
            'handleRenameSceneBackdrop',
            'handleSelectSceneBackdrop',
            'handleSkyColorChange',
            'handleDeleteModel',
            'handleExportModel',
            'handleFileUploadClick',
            'handleModelUpload',
            'handlePivotChange',
            'handlePivotInput',
            'handlePreviewPartSelected',
            'handleSelectModel',
            'refreshLocalView',
            'setBackgroundFileInput',
            'setFileInput'
        ]);
        this.state = {
            revision: 0,
            selectedPart: null,
            scrubbingVector: null
        };
        this.vectorScrub = null;
    }
    componentWillUnmount () {
        this.handleVectorScrubEnd();
    }
    refreshLocalView () {
        this.setState(state => ({
            revision: state.revision + 1
        }));
    }
    getScene3D () {
        const runtime = this.props.vm && this.props.vm.runtime;
        if (!runtime) return null;
        if (!runtime.scratch3dScene) {
            runtime.scratch3dScene = {};
        }
        if (!runtime.scratch3dScene.background) {
            runtime.scratch3dScene.background = {
                mode: 'sky',
                skyColor: '#8fc6ff',
                groundColor: '#d7eef7',
                imageDataUri: null,
                imageName: null
            };
        }
        if (!runtime.scratch3dScene.camera) {
            runtime.scratch3dScene.camera = {
                position: {x: 260, y: 180, z: 420},
                target: {x: 0, y: 20, z: 0},
                fov: 55
            };
        }
        if (!runtime.scratch3dScene.lighting) {
            runtime.scratch3dScene.lighting = {
                ambient: 1.6,
                key: 1.2,
                keyPosition: {x: 180, y: 320, z: 240}
            };
        }
        if (!Array.isArray(runtime.scratch3dScene.backdrops) ||
            runtime.scratch3dScene.backdrops.length === 0) {
            runtime.scratch3dScene.backdrops = [{
                id: `scene-${Date.now()}`,
                name: 'Scene 1',
                background: {...runtime.scratch3dScene.background},
                camera: JSON.parse(JSON.stringify(runtime.scratch3dScene.camera))
            }];
            runtime.scratch3dScene.currentBackdrop = 0;
        }
        runtime.scratch3dScene.currentBackdrop = Math.max(0, Math.min(
            runtime.scratch3dScene.backdrops.length - 1,
            runtime.scratch3dScene.currentBackdrop || 0
        ));
        const active = runtime.scratch3dScene.backdrops[runtime.scratch3dScene.currentBackdrop];
        active.background = active.background || {...runtime.scratch3dScene.background};
        active.camera = active.camera || JSON.parse(JSON.stringify(runtime.scratch3dScene.camera));
        runtime.scratch3dScene.background = active.background;
        runtime.scratch3dScene.camera = active.camera;
        return runtime.scratch3dScene;
    }
    updateScene3D (updater) {
        const scene = this.getScene3D();
        if (!scene) return;
        const active = scene.backdrops[scene.currentBackdrop];
        updater(scene, active);
        active.background = scene.background;
        active.camera = scene.camera;
        scene.revision = (scene.revision || 0) + 1;
        if (this.props.vm.runtime.requestRedraw) {
            this.props.vm.runtime.requestRedraw();
        }
        this.refreshLocalView();
    }
    handleNewSceneBackdrop () {
        this.updateScene3D(scene => {
            const nextNumber = scene.backdrops.length + 1;
            scene.backdrops.push({
                id: `scene-${Date.now()}-${Math.random().toString(36)
                    .slice(2)}`,
                name: `Scene ${nextNumber}`,
                background: {...scene.background},
                camera: JSON.parse(JSON.stringify(scene.camera))
            });
            scene.currentBackdrop = scene.backdrops.length - 1;
            scene.background = scene.backdrops[scene.currentBackdrop].background;
            scene.camera = scene.backdrops[scene.currentBackdrop].camera;
        });
    }
    handleSelectSceneBackdrop (index) {
        this.updateScene3D(scene => {
            scene.currentBackdrop = index;
            scene.background = scene.backdrops[index].background;
            scene.camera = scene.backdrops[index].camera;
        });
    }
    handleDeleteSceneBackdrop (index) {
        this.updateScene3D(scene => {
            if (scene.backdrops.length <= 1) return;
            scene.backdrops.splice(index, 1);
            scene.currentBackdrop = Math.max(0, Math.min(scene.currentBackdrop, scene.backdrops.length - 1));
            scene.background = scene.backdrops[scene.currentBackdrop].background;
            scene.camera = scene.backdrops[scene.currentBackdrop].camera;
        });
    }
    handleRenameSceneBackdrop (e) {
        const name = e.target.value;
        this.updateScene3D((scene, active) => {
            active.name = name;
        });
    }
    handleBackgroundModeChange (e) {
        const mode = e.target.value;
        this.updateScene3D(scene => {
            scene.background.mode = mode;
        });
    }
    handleSkyColorChange (e) {
        const color = e.target.value;
        this.updateScene3D(scene => {
            scene.background.mode = 'sky';
            scene.background.skyColor = color;
        });
    }
    handleGroundColorChange (e) {
        const color = e.target.value;
        this.updateScene3D(scene => {
            scene.background.mode = 'sky';
            scene.background.groundColor = color;
        });
    }
    handleAmbientLightChange (e) {
        const value = Number(e.target.value);
        this.updateScene3D(scene => {
            scene.lighting = {
                ...(scene.lighting || {}),
                ambient: value
            };
        });
    }
    handleKeyLightChange (e) {
        const value = Number(e.target.value);
        this.updateScene3D(scene => {
            scene.lighting = {
                ...(scene.lighting || {}),
                key: value
            };
        });
    }
    handleCameraVectorChange (field, axis, e) {
        const value = Number(e.target.value);
        this.updateScene3D(scene => {
            scene.camera[field] = {
                ...(scene.camera[field] || {}),
                [axis]: value
            };
        });
    }
    handleCameraVectorInput (e) {
        this.handleCameraVectorChange(e.currentTarget.dataset.field, e.currentTarget.dataset.axis, e);
    }
    handleVectorScrubStart (e) {
        if (e.currentTarget.dataset.disabled === 'true' || e.button !== 0) return;
        e.preventDefault();
        const input = e.currentTarget.parentNode.querySelector('input');
        if (!input) return;
        const step = Number(e.currentTarget.dataset.step) || 1;
        this.vectorScrub = {
            axis: input.dataset.axis,
            field: input.dataset.field,
            input,
            onChange: input.__scratch3dVectorChange,
            startClientX: e.clientX,
            startValue: Number(input.value) || 0,
            step
        };
        this.setState({scrubbingVector: `${input.dataset.field}:${input.dataset.axis}`});
        window.addEventListener('pointermove', this.handleVectorScrubMove);
        window.addEventListener('pointerup', this.handleVectorScrubEnd);
        window.addEventListener('pointercancel', this.handleVectorScrubEnd);
        if (e.currentTarget.setPointerCapture) {
            e.currentTarget.setPointerCapture(e.pointerId);
        }
    }
    handleVectorScrubMove (e) {
        if (!this.vectorScrub) return;
        e.preventDefault();
        const speed = e.shiftKey ? 5 : (e.altKey ? 0.1 : 1);
        const rawValue = this.vectorScrub.startValue +
            ((e.clientX - this.vectorScrub.startClientX) * this.vectorScrub.step * speed);
        const precision = this.vectorScrub.step < 1 ? 2 : 0;
        const nextValue = Number(rawValue.toFixed(precision));
        this.vectorScrub.onChange({
            currentTarget: {
                dataset: {
                    axis: this.vectorScrub.axis,
                    field: this.vectorScrub.field
                }
            },
            target: {
                value: nextValue
            }
        });
    }
    handleVectorScrubEnd () {
        if (!this.vectorScrub) return;
        this.vectorScrub = null;
        this.setState({scrubbingVector: null});
        window.removeEventListener('pointermove', this.handleVectorScrubMove);
        window.removeEventListener('pointerup', this.handleVectorScrubEnd);
        window.removeEventListener('pointercancel', this.handleVectorScrubEnd);
    }
    handleCameraFovChange (e) {
        const value = Number(e.target.value);
        this.updateScene3D(scene => {
            scene.camera.fov = Math.min(120, Math.max(15, value));
        });
    }
    handleBackgroundUploadClick () {
        if (this.backgroundFileInput) {
            this.backgroundFileInput.click();
        }
    }
    handleBackgroundFileUpload (e) {
        const file = e.target.files && e.target.files[0];
        e.target.value = '';
        if (!file) return;
        const lowerName = file.name.toLowerCase();
        const isHDRI = lowerName.endsWith('.hdr');
        const isImage = lowerName.endsWith('.png') || lowerName.endsWith('.jpg') ||
            lowerName.endsWith('.jpeg') || lowerName.endsWith('.webp');
        if (!isHDRI && !isImage) {
            // eslint-disable-next-line no-alert
            window.alert('Use .hdr, .png, .jpg, .jpeg, or .webp for scene backgrounds.');
            return;
        }
        this.props.onShowImporting();
        const reader = new FileReader();
        reader.onload = () => {
            this.updateScene3D(scene => {
                scene.background.mode = isHDRI ? 'hdri' : 'image';
                scene.background.imageDataUri = reader.result;
                scene.background.imageName = file.name;
            });
            this.props.onCloseImporting();
        };
        reader.onerror = this.props.onCloseImporting;
        reader.readAsDataURL(file);
    }
    handleActorSizeChange (e) {
        const target = this.props.vm.editingTarget;
        if (!target || target.isStage) return;
        target.setSize(Number(e.target.value));
        target.runtime.requestTargetsUpdate(target);
        this.refreshLocalView();
    }
    handleActorDirectionChange (e) {
        const target = this.props.vm.editingTarget;
        if (!target || target.isStage) return;
        target.setDirection(Number(e.target.value));
        target.runtime.requestTargetsUpdate(target);
        this.refreshLocalView();
    }
    handlePivotChange (axis, e) {
        const target = this.props.vm.editingTarget;
        if (!target || target.isStage) return;
        const pivot = {
            ...(target.modelPivot || {x: 0, y: 0, z: 0}),
            [axis]: Number(e.target.value)
        };
        target.setModelPivot(pivot);
        this.refreshLocalView();
    }
    handlePivotInput (e) {
        this.handlePivotChange(e.currentTarget.dataset.axis, e);
    }
    handlePreviewPartSelected (part) {
        this.setState({selectedPart: part});
    }
    handleModelColorChange (e) {
        const target = this.props.vm.editingTarget;
        if (!target || target.isStage || typeof target.setModelColor !== 'function') return;
        target.setModelColor(e.target.value);
        this.refreshLocalView();
    }
    handleModelColorClear () {
        const target = this.props.vm.editingTarget;
        if (!target || target.isStage || typeof target.setModelColor !== 'function') return;
        target.setModelColor(null);
        this.refreshLocalView();
    }
    getSelectedPartTransform () {
        const target = this.props.vm.editingTarget;
        const selectedPart = this.state.selectedPart;
        if (!target || target.isStage || !selectedPart) return null;
        return (target.modelPartTransforms && target.modelPartTransforms[selectedPart.key]) || {};
    }
    handlePartTransformInput (e) {
        const target = this.props.vm.editingTarget;
        const selectedPart = this.state.selectedPart;
        if (!target || target.isStage || !selectedPart || typeof target.setModelPartTransform !== 'function') return;
        const existing = this.getSelectedPartTransform() || {};
        const field = e.currentTarget.dataset.field;
        const axis = e.currentTarget.dataset.axis;
        const fallback = field === 'scale' ? {x: 1, y: 1, z: 1} : {x: 0, y: 0, z: 0};
        const nextVector = {
            ...fallback,
            ...(existing[field] || {}),
            [e.currentTarget.dataset.axis]: Number(e.target.value)
        };
        target.setModelPartTransform(selectedPart.key, {
            ...existing,
            [field]: {
                ...nextVector,
                [axis]: Number(e.target.value)
            }
        });
        this.refreshLocalView();
    }
    handlePartTransformReset () {
        const target = this.props.vm.editingTarget;
        const selectedPart = this.state.selectedPart;
        if (!target || target.isStage || !selectedPart || typeof target.deleteModelPartTransform !== 'function') return;
        target.deleteModelPartTransform(selectedPart.key);
        this.refreshLocalView();
    }
    handlePartColorChange (e) {
        const target = this.props.vm.editingTarget;
        const selectedPart = this.state.selectedPart;
        if (!target || target.isStage || !selectedPart || typeof target.setModelPartTransform !== 'function') return;
        const existing = this.getSelectedPartTransform() || {};
        target.setModelPartTransform(selectedPart.key, {
            ...existing,
            color: e.target.value
        });
        this.refreshLocalView();
    }
    handlePartColorClear () {
        const target = this.props.vm.editingTarget;
        const selectedPart = this.state.selectedPart;
        if (!target || target.isStage || !selectedPart || typeof target.setModelPartTransform !== 'function') return;
        const existing = this.getSelectedPartTransform() || {};
        target.setModelPartTransform(selectedPart.key, {
            ...existing,
            color: null
        });
        this.refreshLocalView();
    }
    handleModelUpload (e) {
        const file = e.target.files && e.target.files[0];
        e.target.value = '';
        if (!file || !this.props.vm.editingTarget || this.props.vm.editingTarget.isStage) return;
        const lowerName = file.name.toLowerCase();
        if (!lowerName.endsWith('.glb') && !lowerName.endsWith('.gltf')) {
            // eslint-disable-next-line no-alert
            window.alert(this.props.intl.formatMessage(messages.unsupportedModelMsg));
            return;
        }

        this.props.onShowImporting();
        const reader = new FileReader();
        reader.onload = () => {
            const model3D = {
                id: `scratch3d-${Date.now()}-${Math.random().toString(36)
                    .slice(2)}`,
                name: file.name,
                dataUri: reader.result
            };
            this.props.vm.editingTarget.setModel3D(model3D);
            this.refreshLocalView();
            this.props.onCloseImporting();
        };
        reader.onerror = () => {
            this.props.onCloseImporting();
            // eslint-disable-next-line no-alert
            window.alert(this.props.intl.formatMessage(messages.unsupportedModelMsg));
        };
        reader.readAsDataURL(file);
    }
    handleSelectModel (index) {
        const target = this.props.vm.editingTarget;
        if (!target || target.isStage || !target.setModelCostume) return;
        target.setModelCostume(index);
        this.refreshLocalView();
    }
    handleDeleteModel (index) {
        const target = this.props.vm.editingTarget;
        if (!target || target.isStage) return;
        if (target.deleteModelCostume) {
            target.deleteModelCostume(index);
        } else {
            target.modelAssetId = null;
            target.modelAssetName = null;
            target.modelAssetDataUri = null;
            target.modelPartTransforms = {};
            target.runtime.requestTargetsUpdate(target);
        }
        this.refreshLocalView();
    }
    handleExportModel (index) {
        const target = this.props.vm.editingTarget;
        const models = (target && target.modelCostumes && target.modelCostumes.length) ?
            target.modelCostumes : [];
        const model = models[index] || models[target.currentModelCostume || 0] || {
            name: target && target.modelAssetName,
            dataUri: target && target.modelAssetDataUri
        };
        if (!model || !model.dataUri) return;
        fetch(model.dataUri)
            .then(response => response.blob())
            .then(blob => downloadBlob(model.name || 'model.glb', blob));
    }
    handleFileUploadClick () {
        if (this.fileInput) {
            this.fileInput.click();
        }
    }
    setFileInput (input) {
        this.fileInput = input;
    }
    setBackgroundFileInput (input) {
        this.backgroundFileInput = input;
    }
    render () {
        const {
            editingTarget,
            intl,
            isRtl,
            vm
        } = this.props;

        if (!vm.editingTarget) {
            return null;
        }

        const axes = ['x', 'y', 'z'];
        const iconButton = (title, icon, onClick, active, disabled) => (
            <button
                aria-label={title}
                className={`${styles.iconButton} ${active ? styles.iconButtonActive : ''}`}
                disabled={disabled}
                title={title}
                type="button"
                onClick={onClick}
            >
                {iconGraphic(icon)}
            </button>
        );
        const iconColor = (title, icon, value, onChange, disabled) => (
            <label
                className={`${styles.iconButton} ${styles.iconColorButton} ${disabled ? styles.iconDisabled : ''}`}
                title={title}
            >
                {iconGraphic(icon)}
                <span
                    className={styles.colorSwatch}
                    style={{backgroundColor: value}}
                />
                <input
                    aria-label={title}
                    disabled={disabled}
                    type="color"
                    value={value}
                    onChange={onChange}
                />
            </label>
        );
        const axisVectorInputs = (title, icon, field, values, onChange, disabled, step) => (
            <Box
                className={`${styles.overlayVector} ${disabled ? styles.overlayDisabled : ''}`}
                title={title}
            >
                <span className={styles.vectorIcon}>{iconGraphic(icon)}</span>
                {axes.map(axis => {
                    const value = values[axis] || (field === 'scale' ? 1 : 0);
                    const scrubId = `${field}:${axis}`;
                    const scrubbing = this.state.scrubbingVector === scrubId;
                    return (
                        <label
                            className={styles.overlayAxis}
                            key={axis}
                        >
                            <span
                                className={`${styles.axisScrubHandle} ${scrubbing ? styles.axisScrubbing : ''}`}
                                data-disabled={disabled ? 'true' : 'false'}
                                data-step={step || '1'}
                                title={`Drag ${axis.toUpperCase()} to change`}
                                onPointerDown={this.handleVectorScrubStart}
                            >
                                {axis.toUpperCase()}
                            </span>
                            <input
                                data-axis={axis}
                                data-field={field}
                                disabled={disabled}
                                step={step}
                                type="number"
                                value={value}
                                ref={input => {
                                    if (input) {
                                        input.__scratch3dVectorChange = onChange;
                                    }
                                }}
                                onChange={onChange}
                            />
                        </label>
                    );
                })}
            </Box>
        );

        if (vm.editingTarget.isStage) {
            const scene = this.getScene3D();
            const sceneBackdrops = scene.backdrops || [];
            const selectedBackdropIndex = scene.currentBackdrop || 0;
            const selectedBackdrop = sceneBackdrops[selectedBackdropIndex] || {};
            const background = scene.background || {};
            const camera = scene.camera || {};
            const lighting = scene.lighting || {};
            const cameraPosition = camera.position || {x: 260, y: 180, z: 420};
            const cameraTarget = camera.target || {x: 0, y: 20, z: 0};
            const ambientLightValue = typeof lighting.ambient === 'number' ? lighting.ambient : 1.6;
            const keyLightValue = typeof lighting.key === 'number' ? lighting.key : 1.2;
            const backgroundMode = background.mode || 'sky';
            const scenePreviewStyle = background.imageDataUri && backgroundMode !== 'sky' ? {
                backgroundImage: `url("${background.imageDataUri}")`
            } : {
                backgroundImage: `linear-gradient(
                    180deg,
                    ${background.skyColor || '#8fc6ff'} 0%,
                    ${background.skyColor || '#8fc6ff'} 56%,
                    ${background.groundColor || '#d7eef7'} 57%,
                    ${background.groundColor || '#d7eef7'} 100%
                )`
            };
            return (
                <AssetPanel
                    buttons={[
                        {
                            title: 'New Scene',
                            img: backdropIcon,
                            onClick: this.handleNewSceneBackdrop
                        },
                        {
                            title: 'Upload Background / HDRI',
                            img: fileUploadIcon,
                            onClick: this.handleBackgroundUploadClick
                        }
                    ]}
                    dragType={DragConstants.COSTUME}
                    isRtl={isRtl}
                    items={sceneBackdrops.map((backdrop, index) => ({
                        name: backdrop.name || `Scene ${index + 1}`,
                        details: `${(backdrop.background && backdrop.background.mode) || 'sky'} background`,
                        dragPayload: null
                    }))}
                    selectedItemIndex={selectedBackdropIndex}
                    onDeleteClick={sceneBackdrops.length > 1 ? this.handleDeleteSceneBackdrop : null}
                    onItemClick={this.handleSelectSceneBackdrop}
                >
                    <input
                        accept=".hdr,.png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                        ref={this.setBackgroundFileInput}
                        style={{display: 'none'}}
                        type="file"
                        onChange={this.handleBackgroundFileUpload}
                    />
                    <Box
                        className={styles.editorPane}
                    >
                        <Box className={styles.visualWorkspace}>
                            <Box
                                className={styles.scenePreview}
                                style={scenePreviewStyle}
                                title={intl.formatMessage(messages.stageSkyBackgroundMsg)}
                            >
                                <Box className={styles.visualTopBar}>
                                    <input
                                        aria-label="Scene name"
                                        className={styles.overlayNameInput}
                                        title="Scene name"
                                        type="text"
                                        value={selectedBackdrop.name || ''}
                                        onChange={this.handleRenameSceneBackdrop}
                                    />
                                    <Box className={styles.iconStrip}>
                                        {iconButton('New Scene', 'add', this.handleNewSceneBackdrop)}
                                        {iconButton(
                                            'Upload Background / HDRI',
                                            'upload',
                                            this.handleBackgroundUploadClick
                                        )}
                                    </Box>
                                </Box>
                                <Box className={styles.visualToolbar}>
                                    {iconButton('Generated sky', 'sky', () => {
                                        this.updateScene3D(sceneState => {
                                            sceneState.background.mode = 'sky';
                                        });
                                    }, backgroundMode === 'sky')}
                                    {iconButton('Drawn / panorama image', 'image', () => {
                                        this.updateScene3D(sceneState => {
                                            sceneState.background.mode = 'image';
                                        });
                                    }, backgroundMode === 'image')}
                                    {iconButton('HDRI lighting', 'hdri', () => {
                                        this.updateScene3D(sceneState => {
                                            sceneState.background.mode = 'hdri';
                                        });
                                    }, backgroundMode === 'hdri')}
                                    {iconColor(
                                        'Sky color',
                                        'palette',
                                        background.skyColor || '#8fc6ff',
                                        this.handleSkyColorChange
                                    )}
                                    {iconColor(
                                        'Ground color',
                                        'ground',
                                        background.groundColor || '#d7eef7',
                                        this.handleGroundColorChange
                                    )}
                                </Box>
                                <Box
                                    className={styles.visualSelectionChip}
                                    title="Selected backdrop"
                                >
                                    <span className={styles.selectionDot} />
                                    <span>{selectedBackdrop.name || `Scene ${selectedBackdropIndex + 1}`}</span>
                                </Box>
                                <Box className={styles.sceneHorizon} />
                            </Box>
                            <Box className={styles.overlayDock}>
                                {axisVectorInputs(
                                    'Camera position',
                                    'camera',
                                    'position',
                                    cameraPosition,
                                    this.handleCameraVectorInput,
                                    false
                                )}
                                {axisVectorInputs(
                                    'Camera target',
                                    'target',
                                    'target',
                                    cameraTarget,
                                    this.handleCameraVectorInput,
                                    false
                                )}
                                <Box
                                    className={styles.overlaySlider}
                                    title="Camera zoom"
                                >
                                    <span>{iconGraphic('zoom')}</span>
                                    <input
                                        max="120"
                                        min="15"
                                        type="range"
                                        value={camera.fov || 55}
                                        onChange={this.handleCameraFovChange}
                                    />
                                    <strong>{Math.round(camera.fov || 55)}</strong>
                                </Box>
                                <Box
                                    className={styles.overlaySlider}
                                    title="World light"
                                >
                                    <span>{iconGraphic('ambient')}</span>
                                    <input
                                        max="4"
                                        min="0"
                                        step="0.1"
                                        type="range"
                                        value={ambientLightValue}
                                        onChange={this.handleAmbientLightChange}
                                    />
                                    <strong>{Number(ambientLightValue).toFixed(1)}</strong>
                                </Box>
                                <Box
                                    className={styles.overlaySlider}
                                    title="Sun light"
                                >
                                    <span>{iconGraphic('sun')}</span>
                                    <input
                                        max="4"
                                        min="0"
                                        step="0.1"
                                        type="range"
                                        value={keyLightValue}
                                        onChange={this.handleKeyLightChange}
                                    />
                                    <strong>{Number(keyLightValue).toFixed(1)}</strong>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </AssetPanel>
            );
        }

        const targetModels = (vm.editingTarget.modelCostumes && vm.editingTarget.modelCostumes.length) ?
            vm.editingTarget.modelCostumes : (vm.editingTarget.modelAssetId ? [{
                id: vm.editingTarget.modelAssetId,
                name: vm.editingTarget.modelAssetName,
                dataUri: vm.editingTarget.modelAssetDataUri
            }] : []);
        const selectedModelIndex = Math.min(
            targetModels.length - 1,
            Math.max(0, vm.editingTarget.currentModelCostume || 0)
        );
        const selectedModel = targetModels[selectedModelIndex] || null;
        const modelPivot = vm.editingTarget.modelPivot || {x: 0, y: 0, z: 0};
        const selectedPart = this.state.selectedPart;
        const selectedPartTransform = selectedPart && vm.editingTarget.modelPartTransforms ?
            vm.editingTarget.modelPartTransforms[selectedPart.key] :
            null;
        const selectedPartOffset = (selectedPartTransform && selectedPartTransform.offset) ||
            {x: 0, y: 0, z: 0};
        const selectedPartRotation = (selectedPartTransform && selectedPartTransform.rotation) ||
            {x: 0, y: 0, z: 0};
        const selectedPartScale = (selectedPartTransform && selectedPartTransform.scale) ||
            {x: 1, y: 1, z: 1};
        const selectedPartPivot = (selectedPartTransform && selectedPartTransform.pivot) ||
            {x: 0, y: 0, z: 0};
        const modelName = (selectedModel && selectedModel.name) ||
            intl.formatMessage(messages.noModelMsg);
        const modelData = targetModels.map((model, index) => ({
            name: model.name || `Model ${index + 1}`,
            details: intl.formatMessage(messages.modelDetailsMsg),
            dragPayload: null
        }));

        return (
            <AssetPanel
                buttons={[
                    {
                        title: intl.formatMessage(messages.addFileModelMsg),
                        img: fileUploadIcon,
                        onClick: this.handleFileUploadClick
                    }
                ]}
                dragType={DragConstants.COSTUME}
                isRtl={isRtl}
                items={modelData}
                key={editingTarget}
                selectedItemIndex={selectedModelIndex}
                onDeleteClick={targetModels.length ? this.handleDeleteModel : null}
                onExportClick={targetModels.length ? this.handleExportModel : null}
                onItemClick={this.handleSelectModel}
            >
                <input
                    accept=".glb,.gltf,model/gltf-binary,model/gltf+json"
                    ref={this.setFileInput}
                    style={{display: 'none'}}
                    type="file"
                    onChange={this.handleModelUpload}
                />
                <Box
                    className={styles.editorPane}
                >
                    <Box className={styles.visualWorkspace}>
                        <Box className={styles.modelVisualSurface}>
                            <ModelPreview
                                modelColor={vm.editingTarget.modelColor || null}
                                modelDataUri={selectedModel && selectedModel.dataUri}
                                modelName={modelName}
                                modelPartTransforms={vm.editingTarget.modelPartTransforms || {}}
                                selectedPartKey={selectedPart && selectedPart.key}
                                selectedPartLabel={selectedPart && selectedPart.label}
                                onPartSelected={this.handlePreviewPartSelected}
                            />
                            <Box className={styles.visualTopBar}>
                                <Box
                                    className={styles.visualNameChip}
                                    title={selectedModel ?
                                        intl.formatMessage(messages.modelDetailsMsg) :
                                        intl.formatMessage(messages.uploadModelPromptMsg)}
                                >
                                    <span className={styles.selectionDot} />
                                    <span>{modelName}</span>
                                </Box>
                                <Box className={styles.iconStrip}>
                                    {iconButton(
                                        intl.formatMessage(messages.addFileModelMsg),
                                        'upload',
                                        this.handleFileUploadClick
                                    )}
                                    {iconButton(
                                        'Export model',
                                        'export',
                                        () => this.handleExportModel(selectedModelIndex),
                                        false,
                                        !selectedModel
                                    )}
                                    {iconButton(
                                        'Delete model',
                                        'delete',
                                        () => this.handleDeleteModel(selectedModelIndex),
                                        false,
                                        !selectedModel
                                    )}
                                </Box>
                            </Box>
                            <Box className={styles.visualToolbar}>
                                {iconColor(
                                    'Model color',
                                    'palette',
                                    vm.editingTarget.modelColor || '#855cd6',
                                    this.handleModelColorChange,
                                    !selectedModel
                                )}
                                {iconButton(
                                    'Clear model color',
                                    'clear',
                                    this.handleModelColorClear,
                                    false,
                                    !selectedModel
                                )}
                                {iconColor(
                                    'Part color',
                                    'part',
                                    (selectedPartTransform && selectedPartTransform.color) || '#855cd6',
                                    this.handlePartColorChange,
                                    !selectedPart
                                )}
                                {iconButton(
                                    'Clear part color',
                                    'clear',
                                    this.handlePartColorClear,
                                    false,
                                    !selectedPart
                                )}
                                {iconButton(
                                    'Reset selected part',
                                    'reset',
                                    this.handlePartTransformReset,
                                    false,
                                    !selectedPart
                                )}
                            </Box>
                        </Box>
                        <Box className={styles.overlayDock}>
                            <Box
                                className={styles.overlaySlider}
                                title="Actor scale"
                            >
                                <span>{iconGraphic('scale')}</span>
                                <input
                                    max="300"
                                    min="10"
                                    type="range"
                                    value={vm.editingTarget.size || 100}
                                    onChange={this.handleActorSizeChange}
                                />
                                <strong>{Math.round(vm.editingTarget.size || 100)}</strong>
                            </Box>
                            <Box
                                className={styles.overlaySlider}
                                title="Actor yaw"
                            >
                                <span>{iconGraphic('yaw')}</span>
                                <input
                                    max="180"
                                    min="-179"
                                    type="range"
                                    value={vm.editingTarget.direction || 90}
                                    onChange={this.handleActorDirectionChange}
                                />
                                <strong>{Math.round(vm.editingTarget.direction || 90)}</strong>
                            </Box>
                            {axisVectorInputs(
                                'Actor pivot',
                                'pivot',
                                'pivot',
                                modelPivot,
                                this.handlePivotInput,
                                !selectedModel
                            )}
                            {axisVectorInputs(
                                'Move selected part',
                                'move',
                                'offset',
                                selectedPartOffset,
                                this.handlePartTransformInput,
                                !selectedPart
                            )}
                            {axisVectorInputs(
                                'Rotate selected part',
                                'rotate',
                                'rotation',
                                selectedPartRotation,
                                this.handlePartTransformInput,
                                !selectedPart
                            )}
                            {axisVectorInputs(
                                'Scale selected part',
                                'scale',
                                'scale',
                                selectedPartScale,
                                this.handlePartTransformInput,
                                !selectedPart,
                                '0.05'
                            )}
                            {axisVectorInputs(
                                'Part pivot',
                                'pivot',
                                'pivot',
                                selectedPartPivot,
                                this.handlePartTransformInput,
                                !selectedPart
                            )}
                        </Box>
                    </Box>
                </Box>
            </AssetPanel>
        );
    }
}

CostumeTab.propTypes = {
    editingTarget: PropTypes.string,
    intl: intlShape,
    isRtl: PropTypes.bool,
    onCloseImporting: PropTypes.func.isRequired,
    onShowImporting: PropTypes.func.isRequired,
    vm: PropTypes.instanceOf(VM)
};

const mapStateToProps = state => ({
    editingTarget: state.scratchGui.targets.editingTarget,
    isRtl: state.locales.isRtl
});

const mapDispatchToProps = dispatch => ({
    onCloseImporting: () => dispatch(closeAlertWithId('importingAsset')),
    onShowImporting: () => dispatch(showStandardAlert('importingAsset'))
});

export default errorBoundaryHOC('Models Tab')(
    injectIntl(connect(
        mapStateToProps,
        mapDispatchToProps
    )(CostumeTab))
);
