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

            this.props.vm.saveProjectSb3('arraybuffer')
                .then(projectData => buildAmethystExportHTML({
                    projectData,
                    title: this.props.reduxProjectTitle,
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
                })
                .catch(error => {
                    log.error(error);
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
