import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import Button from 'material-ui/FlatButton'; // TODO: Support buttons with uppercase in d2-ui
import AddCircle from 'material-ui/svg-icons/content/add-circle-outline';
import AddLayerPopover from './AddLayerPopover';
import { openLayersDialog } from '../../../actions/layers';
import { LAYERS_PANEL_WIDTH } from '../../../constants/layout';

const styles = {
    button: {
        color: '#333',
        height: 40,
        margin: 0,
        padding: '4px 16px 0 16px',
        minWidth: 50,
    },
    addLayer: {
        position: 'relative',
        boxSizing: 'border-box',
        width: LAYERS_PANEL_WIDTH + 1,
        borderRight: '1px solid #ddd',
        textAlign: 'left',
        paddingLeft: 48,
    },
    addCircle: {
        position: 'absolute',
        top: 8,
        left: 18,
        fill: '#333',
    },
    dropDown: {
        position: 'absolute',
        top: 8,
        right: 8,
        fill: '#333',
    },
};

export class AddLayer extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    handleClick = event => {
        event.preventDefault(); // This prevents ghost click.
        this.setState({
            anchorEl: event.currentTarget,
        });
        this.props.openLayersDialog();
    };

    render() {
        return [
            <Button
                key="button"
                onClick={event => this.handleClick(event)}
                style={{ ...styles.button, ...styles.addLayer }}
            >
                <AddCircle style={styles.addCircle} /> {i18n.t('Add layer')}
            </Button>,
            <AddLayerPopover key="popover" anchorEl={this.state.anchorEl} />,
        ];
    }
}

export default connect(null, { openLayersDialog })(AddLayer);
