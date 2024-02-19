import i18n from '@dhis2/d2-i18n'
import { IconCross24 } from '@dhis2/ui'
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { closeFeatureProfile } from '../../actions/feature.js'
import Drawer from '../core/Drawer.js'
import styles from './styles/FeatureProfile.module.css'

const FeatureProfile = () => {
    const featureProfile = useSelector((state) => state.featureProfile)
    const dispatch = useDispatch()

    const { name, data } = featureProfile

    return (
        <Drawer className={styles.drawer}>
            <div className={styles.header}>
                {name || i18n.t('Feature profile')}
                <span
                    className={styles.close}
                    onClick={() => dispatch(closeFeatureProfile())}
                >
                    <IconCross24 />
                </span>
            </div>
            <div className={styles.content}>
                <div className={styles.featureData}>
                    <div className={styles.dataTable}>
                        <table>
                            <tbody>
                                {Object.keys(data).map((key) => (
                                    <tr key={key}>
                                        <th>{key}</th>
                                        <td>{data[key]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Drawer>
    )
}

export default FeatureProfile
