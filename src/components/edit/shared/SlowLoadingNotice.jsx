import i18n from '@dhis2/d2-i18n'
import { NoticeBox } from '@dhis2/ui'
import React from 'react'
import styles from './styles/SlowLoadingNotice.module.css'

// Shown next to an option that makes the layer load more slowly
const SlowLoadingNotice = () => (
    <div className={styles.notice}>
        <NoticeBox warning>{i18n.t('May cause slow layer loading.')}</NoticeBox>
    </div>
)

export default SlowLoadingNotice
