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
            'handleSkyColorChange',
            'handleDeleteModel',
            'handleExportModel',
            'handleFileUploadClick',
            'handleModelUpload',
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
    handleSelectModel () {
        // AssetPanel expects an item click handler. The selected actor owns exactly one model for now.
    }
    handleDeleteModel () {
        const target = this.props.vm.editingTarget;
        if (!target || target.isStage) return;
        target.modelAssetId = null;
        target.modelAssetName = null;
        target.modelAssetDataUri = null;
        target.attachmentPoints = {};
        target.runtime.requestTargetsUpdate(target);
        this.refreshLocalView();
    }
    handleExportModel () {
        const target = this.props.vm.editingTarget;
        if (!target || !target.modelAssetDataUri) return;
        fetch(target.modelAssetDataUri)
            .then(response => response.blob())
            .then(blob => downloadBlob(target.modelAssetName || 'model.glb', blob));
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
                        gap: '0.75rem',
                        justifyContent: 'flex-start',
                        padding: '2rem',
                        textAlign: 'left'
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
            );
        }

        const modelName = vm.editingTarget.modelAssetName ||
            intl.formatMessage(messages.noModelMsg);
        const modelData = vm.editingTarget.modelAssetId ? [{
            name: modelName,
            details: intl.formatMessage(messages.modelDetailsMsg),
            dragPayload: null
        }] : [];

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
                selectedItemIndex={0}
                onDeleteClick={vm.editingTarget.modelAssetId ? this.handleDeleteModel : null}
                onExportClick={vm.editingTarget.modelAssetId ? this.handleExportModel : null}
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
                        alignItems: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        flexGrow: 1,
                        justifyContent: 'center',
                        padding: '2rem',
                        textAlign: 'center'
                    }}
                >
                    <Box
                        style={{
                            fontSize: '1rem',
                            fontWeight: 700,
                            marginBottom: '0.5rem'
                        }}
                    >
                        {modelName}
                    </Box>
                    <Box
                        style={{
                            color: '#575e75',
                            fontSize: '0.8rem'
                        }}
                    >
                        {vm.editingTarget.modelAssetId ?
                            intl.formatMessage(messages.modelDetailsMsg) :
                            intl.formatMessage(messages.uploadModelPromptMsg)}
                    </Box>
                    <Box
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            marginTop: '1.25rem',
                            minWidth: '14rem',
                            textAlign: 'left'
                        }}
                    >
                        <Box
                            style={{
                                fontSize: '0.85rem',
                                fontWeight: 700
                            }}
                        >
                            {'Simple Model Editor'}
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
