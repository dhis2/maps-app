import i18n from '@dhis2/d2-i18n'
import { NoticeBox } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import styles from './styles/TrackerDataNotice.module.css'

// Shown next to options that load from the tracker API instead of analytics,
// which applies other access rules
const TrackerDataNotice = ({ className }) => (
    <div className={cx(styles.notice, className)}>
        <NoticeBox info>
            {i18n.t(
                'With this option, tracked entities are loaded directly from captured data, not from analytics tables. Your data capture permissions apply instead of your analytics permissions.'
            )}
        </NoticeBox>
    </div>
)

TrackerDataNotice.propTypes = {
    className: PropTypes.string,
}

export default TrackerDataNotice
