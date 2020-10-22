import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { SplitButton } from '@dhis2/ui';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import AddLayerPopover from './AddLayerPopover';
import { openLayersDialog } from '../../../actions/layers';
import styles from './styles/AddLayerButton.module.css';

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

        /*
        return [
            <Button
                key="button"
                onClick={event => this.handleClick(event)}
                classes={{
                    root: styles.button,
                    label: styles.label,
                }}
                data-test="addlayerbutton"
            >
                <AddIcon className={styles.icon} /> {i18n.t('Add layer')}
            </Button>,
            <AddLayerPopover key="popover" anchorEl={this.state.anchorEl} />,
        ];
        */
    }
}

export default connect(null, { openLayersDialog })(AddLayerButton);
