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
import downloadBlob from '../lib/download-blob';
import ModelPreview from '../components/stage-3d/model-preview.jsx';

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
        description: 'Label shown for the current blockinum3D scene background',
        id: 'gui.costumeTab.stageSkyBackground'
    }
});

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
            'handleSkyColorChange',
            'handleDeleteModel',
            'handleExportModel',
            'handleFileUploadClick',
            'handleModelUpload',
            'handlePivotChange',
            'handlePivotInput',
            'handleSelectModel',
            'refreshLocalView',
            'setBackgroundFileInput',
            'setFileInput'
        ]);
        this.state = {
            revision: 0
        };
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
        return runtime.scratch3dScene;
    }
    updateScene3D (updater) {
        const scene = this.getScene3D();
        if (!scene) return;
        updater(scene);
        scene.revision = (scene.revision || 0) + 1;
        if (this.props.vm.runtime.requestRedraw) {
            this.props.vm.runtime.requestRedraw();
        }
        this.refreshLocalView();
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
            target.attachmentPoints = {};
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

        if (vm.editingTarget.isStage) {
            const scene = this.getScene3D();
            const background = scene.background || {};
            const camera = scene.camera || {};
            const cameraPosition = camera.position || {x: 260, y: 180, z: 420};
            const cameraTarget = camera.target || {x: 0, y: 20, z: 0};
            const cameraInput = (label, field, axis, value) => (
                <label
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.2rem'
                    }}
                >
                    {label}
                    <input
                        style={{
                            border: '1px solid #c9ccd8',
                            borderRadius: '0.25rem',
                            padding: '0.35rem'
                        }}
                        data-axis={axis}
                        data-field={field}
                        type="number"
                        value={value}
                        onChange={this.handleCameraVectorInput}
                    />
                </label>
            );
            return (
                <Box
                    style={{
                        alignItems: 'stretch',
                        color: '#575e75',
                        display: 'flex',
                        flexDirection: 'column',
                        flexGrow: 1,
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        gap: '1rem',
                        justifyContent: 'flex-start',
                        overflow: 'auto',
                        padding: '1.5rem',
                        textAlign: 'left'
                    }}
                >
                    <Box
                        style={{
                            display: 'grid',
                            gap: '1rem',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))'
                        }}
                    >
                        <Box
                            style={{
                                border: '1px solid #d9dce8',
                                borderRadius: '0.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.75rem',
                                padding: '1rem'
                            }}
                        >
                            <Box>{intl.formatMessage(messages.stageSkyBackgroundMsg)}</Box>
                            <label>
                                {'Mode '}
                                <select
                                    value={background.mode || 'sky'}
                                    onChange={this.handleBackgroundModeChange}
                                >
                                    <option value="sky">{'Generated sky'}</option>
                                    <option value="image">{'Drawn / panorama image'}</option>
                                    <option value="hdri">{'HDRI lighting'}</option>
                                </select>
                            </label>
                            <label>
                                {'Sky color '}
                                <input
                                    type="color"
                                    value={background.skyColor || '#8fc6ff'}
                                    onChange={this.handleSkyColorChange}
                                />
                            </label>
                            <button
                                type="button"
                                onClick={this.handleBackgroundUploadClick}
                            >
                                {'Upload Background / HDRI'}
                            </button>
                            <input
                                accept=".hdr,.png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                                ref={this.setBackgroundFileInput}
                                style={{display: 'none'}}
                                type="file"
                                onChange={this.handleBackgroundFileUpload}
                            />
                            <Box
                                style={{
                                    color: '#6b7280',
                                    fontSize: '0.78rem',
                                    fontWeight: 500
                                }}
                            >
                                {background.imageName || 'No custom background uploaded'}
                            </Box>
                        </Box>
                        <Box
                            style={{
                                border: '1px solid #d9dce8',
                                borderRadius: '0.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.75rem',
                                padding: '1rem'
                            }}
                        >
                            <Box>{'Camera'}</Box>
                            <Box
                                style={{
                                    display: 'grid',
                                    gap: '0.55rem',
                                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))'
                                }}
                            >
                                {cameraInput('X', 'position', 'x', cameraPosition.x)}
                                {cameraInput('Y', 'position', 'y', cameraPosition.y)}
                                {cameraInput('Z', 'position', 'z', cameraPosition.z)}
                            </Box>
                            <Box
                                style={{
                                    color: '#6b7280',
                                    fontSize: '0.78rem'
                                }}
                            >
                                {'Camera target'}
                            </Box>
                            <Box
                                style={{
                                    display: 'grid',
                                    gap: '0.55rem',
                                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))'
                                }}
                            >
                                {cameraInput('X', 'target', 'x', cameraTarget.x)}
                                {cameraInput('Y', 'target', 'y', cameraTarget.y)}
                                {cameraInput('Z', 'target', 'z', cameraTarget.z)}
                            </Box>
                            <label>
                                {'Field of view '}
                                <input
                                    max="120"
                                    min="15"
                                    type="range"
                                    value={camera.fov || 55}
                                    onChange={this.handleCameraFovChange}
                                />
                                {` ${Math.round(camera.fov || 55)} deg`}
                            </label>
                        </Box>
                    </Box>
                </Box>
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
                    style={{
                        alignItems: 'stretch',
                        display: 'flex',
                        flexDirection: 'column',
                        flexGrow: 1,
                        gap: '1rem',
                        justifyContent: 'flex-start',
                        overflow: 'auto',
                        padding: '1rem',
                        textAlign: 'left'
                    }}
                >
                    <ModelPreview
                        modelDataUri={selectedModel && selectedModel.dataUri}
                        modelName={modelName}
                    />
                    <Box
                        style={{
                            fontSize: '1rem',
                            fontWeight: 700,
                            textAlign: 'center'
                        }}
                    >
                        {modelName}
                    </Box>
                    <Box
                        style={{
                            color: '#575e75',
                            fontSize: '0.8rem',
                            textAlign: 'center'
                        }}
                    >
                        {selectedModel ?
                            intl.formatMessage(messages.modelDetailsMsg) :
                            intl.formatMessage(messages.uploadModelPromptMsg)}
                    </Box>
                    <Box
                        style={{
                            border: '1px solid #d9dce8',
                            borderRadius: '0.5rem',
                            display: 'grid',
                            gap: '0.75rem',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))',
                            padding: '1rem'
                        }}
                    >
                        <Box
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem'
                            }}
                        >
                            <Box
                                style={{
                                    fontSize: '0.85rem',
                                    fontWeight: 700
                                }}
                            >
                                {'Transform'}
                            </Box>
                            <label>
                                {'Scale '}
                                <input
                                    max="300"
                                    min="10"
                                    type="range"
                                    value={vm.editingTarget.size || 100}
                                    onChange={this.handleActorSizeChange}
                                />
                                {` ${Math.round(vm.editingTarget.size || 100)}%`}
                            </label>
                            <label>
                                {'Yaw '}
                                <input
                                    max="180"
                                    min="-179"
                                    type="range"
                                    value={vm.editingTarget.direction || 90}
                                    onChange={this.handleActorDirectionChange}
                                />
                                {` ${Math.round(vm.editingTarget.direction || 90)} deg`}
                            </label>
                        </Box>
                        <Box
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem'
                            }}
                        >
                            <Box
                                style={{
                                    fontSize: '0.85rem',
                                    fontWeight: 700
                                }}
                            >
                                {'Pivot point'}
                            </Box>
                            {['x', 'y', 'z'].map(axis => (
                                <label key={axis}>
                                    {`${axis.toUpperCase()} `}
                                    <input
                                        style={{maxWidth: '7rem'}}
                                        data-axis={axis}
                                        type="number"
                                        value={modelPivot[axis] || 0}
                                        onChange={this.handlePivotInput}
                                    />
                                </label>
                            ))}
                        </Box>
                    </Box>
                    <Box
                        style={{
                            color: '#6b7280',
                            fontSize: '0.78rem',
                            fontWeight: 500,
                            textAlign: 'center'
                        }}
                    >
                        {targetModels.length ?
                            `${targetModels.length} model ${
                                targetModels.length === 1 ? 'costume' : 'costumes'
                            } on this actor` :
                            'No model costumes yet'}
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
