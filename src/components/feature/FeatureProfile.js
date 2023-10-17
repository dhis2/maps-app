import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import i18n from '@dhis2/d2-i18n'
import { IconCross24 } from '@dhis2/ui'
import Drawer from '../core/Drawer'
import { closeFeatureProfile } from '../../actions/feature'
import styles from './styles/FeatureProfile.module.css'

export const FeatureProfile = () => {
    const featureProfile = useSelector((state) => state.featureProfile)
    const dispatch = useDispatch()

    const { name, fields, data } = featureProfile

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
                <div className={styles.orgUnitData}>
                    <div className={styles.dataTable}>
                        <table>
                            <tbody>
                                {fields.map(({ name }) => (
                                    <tr key={name}>
                                        <th>{name}</th>
                                        <td>{data[name]}</td>
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
