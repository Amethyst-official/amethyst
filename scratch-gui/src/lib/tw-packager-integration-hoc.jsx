import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import log from './log';
import {getIsShowingProject} from '../reducers/project-state';
import downloadBlob from './download-blob';
import {
    buildAmethystExportHTML,
    getHTMLExportFilename
} from './amethyst-html-exporter';

const getRuntimeUrl = () => {
    if (location.protocol === 'http:' || location.protocol === 'https:') {
        return new URL(`${process.env.ROOT}embed.html`, location.href).href;
    }
    return undefined;
};

const getAmethystVersion = () => {
    if (typeof process !== 'undefined' && process.env && process.env.npm_package_version) {
        return process.env.npm_package_version;
    }
    return 'unknown';
};

const alertExportError = error => {
    const message = error && error.message ? error.message : String(error || 'Unknown error');
    window.alert(`Could not export HTML game.\n\n${message}`);
};

const PackagerIntegrationHOC = function (WrappedComponent) {
    class PackagerIntegrationComponent extends React.Component {
        constructor (props) {
            super(props);
            this.handleClickPackager = this.handleClickPackager.bind(this);
        }
        handleClickPackager () {
            if (!this.props.canOpenPackager) {
                return;
            }

            Promise.all([
                this.props.vm.saveProjectSb3('arraybuffer'),
                this.props.getOfflineHTMLRuntime ? this.props.getOfflineHTMLRuntime() : Promise.resolve(null)
            ])
                .then(([projectData, offlineRuntime]) => buildAmethystExportHTML({
                    projectData,
                    title: this.props.reduxProjectTitle,
                    amethystVersion: getAmethystVersion(),
                    offlineRuntime,
                    runtimeUrl: this.props.htmlExportRuntimeUrl || getRuntimeUrl()
                }))
                .then(html => {
                    const filename = getHTMLExportFilename(this.props.reduxProjectTitle);
                    if (this.props.exportHTMLFile) {
                        return this.props.exportHTMLFile(filename, html);
                    }
                    downloadBlob(filename, new Blob([html], {
                        type: 'text/html'
                    }));
                    window.alert('Exported HTML game.');
                })
                .catch(error => {
                    log.error(error);
                    alertExportError(error);
                });
        }
        render () {
            const {
                /* eslint-disable no-unused-vars */
                canOpenPackager,
                exportHTMLFile,
                htmlExportRuntimeUrl,
                /* eslint-enable no-unused-vars */
                ...props
            } = this.props;
            return (
                <WrappedComponent
                    onClickPackager={this.handleClickPackager}
                    {...props}
                />
            );
        }
    }
    PackagerIntegrationComponent.propTypes = {
        canOpenPackager: PropTypes.bool,
        exportHTMLFile: PropTypes.func,
        getOfflineHTMLRuntime: PropTypes.func,
        htmlExportRuntimeUrl: PropTypes.string,
        reduxProjectTitle: PropTypes.string,
        vm: PropTypes.shape({
            saveProjectSb3: PropTypes.func
        })
    };
    const mapStateToProps = state => ({
        canOpenPackager: getIsShowingProject(state.scratchGui.projectState.loadingState),
        reduxProjectTitle: state.scratchGui.projectTitle,
        vm: state.scratchGui.vm
    });
    const mapDispatchToProps = () => ({});
    return connect(
        mapStateToProps,
        mapDispatchToProps
    )(PackagerIntegrationComponent);
};

export {
    PackagerIntegrationHOC as default
};
