import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import Box from '../box/box.jsx';
import styles from './stage-selector.css';

const StageSelector = props => {
    const {
        backdropCount,
        containerRef,
        dragOver,
        selected,
        raised,
        receivedBlocks,
        url,
        onClick,
        onMouseEnter,
        onMouseLeave
    } = props;
    return (
        <Box
            className={classNames(styles.stageSelector, {
                [styles.isSelected]: selected,
                [styles.raised]: raised || dragOver,
                [styles.receivedBlocks]: receivedBlocks
            })}
            componentRef={containerRef}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    <FormattedMessage
                        defaultMessage="Scene"
                        description="Label for the 3D scene in the stage selector"
                        id="gui.stageSelector.stage"
                    />
                </div>
            </div>
            {url ? (
                <img
                    className={styles.costumeCanvas}
                    src={url}
                    draggable={false}
                />
            ) : null}
            <div className={styles.label}>
                <FormattedMessage
                    defaultMessage="3D Backgrounds"
                    description="Label for the 3D backgrounds in the scene selector"
                    id="gui.stageSelector.backdrops"
                />
            </div>
            <div className={styles.count}>{backdropCount}</div>
        </Box>
    );
};

StageSelector.propTypes = {
    backdropCount: PropTypes.number.isRequired,
    containerRef: PropTypes.func,
    dragOver: PropTypes.bool,
    onClick: PropTypes.func,
    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,
    raised: PropTypes.bool.isRequired,
    receivedBlocks: PropTypes.bool.isRequired,
    selected: PropTypes.bool.isRequired,
    url: PropTypes.string
};

export default StageSelector;
