import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import Button from 'material-ui/FlatButton';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import {
    openLayersPanel,
    closeLayersPanel,
    openInterpretationsPanel,
    closeInterpretationsPanel,
} from '../../actions/ui';

export class ViewMenu extends Component {
    static propTypes = {
        layersOpen: PropTypes.bool.isRequired,
        interpretationsOpen: PropTypes.bool.isRequired,
        interpretationsEnabled: PropTypes.bool.isRequired,
        openLayersPanel: PropTypes.func.isRequired,
        closeLayersPanel: PropTypes.func.isRequired,
        openInterpretationsPanel: PropTypes.func.isRequired,
        closeInterpretationsPanel: PropTypes.func.isRequired,
    };

    state = {
        open: false,
        anchorEl: null,
    };

    render() {
        const {
            layersOpen,
            interpretationsOpen,
            interpretationsEnabled,
        } = this.props;
        const { open, anchorEl } = this.state;
        return (
            <div>
                <Button onClick={this.onMenuToggle}>{i18n.t('View')}</Button>
                <Popover
                    open={open}
                    anchorEl={anchorEl}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    onRequestClose={this.onClose}
                >
                    <Menu>
                        <MenuItem
                            checked={layersOpen}
                            onClick={this.onLayersToggle}
                        >
                            {i18n.t('Show layer list')}
                        </MenuItem>
                        <MenuItem
                            checked={interpretationsOpen}
                            onClick={this.onInterpretationsToggle}
                            disabled={!interpretationsEnabled}
                        >
                            {i18n.t('Show interpretations')}
                        </MenuItem>
                    </Menu>
                </Popover>
            </div>
        );
    }

    onMenuToggle = event => {
        event.preventDefault();
        this.setState({
            open: !this.state.open,
            anchorEl: event.currentTarget,
        });
    };

    onLayersToggle = event => {
        event.preventDefault();
        const { layersOpen, openLayersPanel, closeLayersPanel } = this.props;

        layersOpen ? closeLayersPanel() : openLayersPanel();
    };

    onInterpretationsToggle = event => {
        event.preventDefault();
        const {
            interpretationsOpen,
            openInterpretationsPanel,
            closeInterpretationsPanel,
        } = this.props;

        interpretationsOpen
            ? closeInterpretationsPanel()
            : openInterpretationsPanel();
    };

    onClose = () => {
        this.setState({
            open: false,
        });
    };
}

export default connect(
    state => ({
        layersOpen: state.ui.layersPanelOpen,
        interpretationsOpen: state.ui.interpretationsPanelOpen,
        interpretationsEnabled: Boolean(state.map.id),
    }),
    {
        openLayersPanel,
        closeLayersPanel,
        openInterpretationsPanel,
        closeInterpretationsPanel,
    }
)(ViewMenu);
