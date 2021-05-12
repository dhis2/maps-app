import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { MenuButton } from '../core';
import DownloadDialog from './DownloadDialog';
import { toggleDownloadDialog } from '../../actions/download';

export class DownloadButton extends Component {
    static propTypes = {
        toggleDownloadDialog: PropTypes.func.isRequired,
    };

    render() {
        return (
            <Fragment>
                <MenuButton onClick={this.onClick}>
                    {i18n.t('Download')}
                </MenuButton>
                <DownloadDialog />
            </Fragment>
        );
    }

    onClick = () => this.props.toggleDownloadDialog(true);
}

export default connect(null, { toggleDownloadDialog })(DownloadButton);
