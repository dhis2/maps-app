import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { toggleDownloadDialog } from '../../actions/download.js'
import { MenuButton } from '../core/index.js'
import DownloadDialog from './DownloadDialog.js'

export class DownloadButton extends Component {
    static propTypes = {
        toggleDownloadDialog: PropTypes.func.isRequired,
    }

    render() {
        return (
            <Fragment>
                <MenuButton onClick={this.onClick}>
                    {i18n.t('Download')}
                </MenuButton>
                <DownloadDialog />
            </Fragment>
        )
    }

    onClick = () => this.props.toggleDownloadDialog(true)
}

export default connect(null, { toggleDownloadDialog })(DownloadButton)
