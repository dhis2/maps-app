import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { SplitButton } from '@dhis2/ui';
import AddLayerPopover from './AddLayerPopover';
import { openLayersDialog } from '../../../actions/layers';

export class AddLayerButton extends Component {
    static propTypes = {
        openLayersDialog: PropTypes.func.isRequired,
    };

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
        return (
            <SplitButton
                secondary
                component={<AddLayerPopover />}
                dataTest="addlayerbutton"
            >
                {i18n.t('Add layer')}
            </SplitButton>
        );
    }
}

export default connect(null, { openLayersDialog })(AddLayerButton);
