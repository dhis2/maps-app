import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import AddCircleIcon from '@material-ui/icons/AddCircleOutline';
import AddLayerPopover from './AddLayerPopover';
import { openLayersDialog } from '../../../actions/layers';
import { LAYERS_PANEL_WIDTH } from '../../../constants/layout';

const styles = {
    button: {
        boxSizing: 'border-box',
        width: LAYERS_PANEL_WIDTH + 1,
        paddingLeft: 18,
        justifyContent: 'flex-start',
    },
    label: {
        textTransform: 'none',
        fontSize: 16,
        fontWeight: 'normal',
        justifyContent: 'initial',
    },
    icon: {
        marginRight: 8,
    },
};

export class AddLayer extends Component {
    static propTypes = {
        openLayersDialog: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
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
        const { classes } = this.props;

        return [
            <Button
                key="button"
                onClick={event => this.handleClick(event)}
                classes={{
                    root: classes.button,
                    label: classes.label,
                }}
            >
                <AddCircleIcon className={classes.icon} /> {i18n.t('Add layer')}
            </Button>,
            <AddLayerPopover key="popover" anchorEl={this.state.anchorEl} />,
        ];
    }
}

export default connect(
    null,
    { openLayersDialog }
)(withStyles(styles)(AddLayer));
