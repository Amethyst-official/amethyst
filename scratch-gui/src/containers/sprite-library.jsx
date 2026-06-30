import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {injectIntl, intlShape, defineMessages} from 'react-intl';
import VM from 'scratch-vm';

import {amethystActorLibrary} from '../lib/libraries/amethyst-actor-library';
import actorTagsMessages from '../lib/libraries/amethyst-actor-tags';
import createAmethystActor from '../lib/create-amethyst-actor';

import LibraryComponent from '../components/library/library.jsx';

const messages = defineMessages({
    libraryTitle: {
        defaultMessage: 'Choose an Actor',
        description: 'Heading for the sprite library',
        id: 'gui.spriteLibrary.chooseASprite'
    }
});

const actorTags = [
    {tag: 'basics', intlLabel: actorTagsMessages.basics},
    {tag: 'shapes', intlLabel: actorTagsMessages.shapes},
    {tag: 'blank', intlLabel: actorTagsMessages.blank}
];

class SpriteLibrary extends React.PureComponent {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleItemSelect'
        ]);
        this.state = {
            data: amethystActorLibrary
        };
    }
    handleItemSelect (item) {
        createAmethystActor(this.props.vm, item, this.props.intl.formatMessage)
            .then(() => {
                this.props.onActivateBlocksTab();
            })
            .catch(error => {
                // eslint-disable-next-line no-console
                console.error(error);
                // eslint-disable-next-line no-alert
                window.alert('Could not load that actor model.');
            });
    }
    render () {
        return (
            <LibraryComponent
                data={this.state.data.then ? null : this.state.data}
                id="spriteLibrary"
                tags={actorTags}
                title={this.props.intl.formatMessage(messages.libraryTitle)}
                onItemSelected={this.handleItemSelect}
                onRequestClose={this.props.onRequestClose}
            />
        );
    }
}

SpriteLibrary.propTypes = {
    intl: intlShape.isRequired,
    onActivateBlocksTab: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func,
    vm: PropTypes.instanceOf(VM).isRequired
};

export default injectIntl(SpriteLibrary);
