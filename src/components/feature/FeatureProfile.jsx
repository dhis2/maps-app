import i18n from '@dhis2/d2-i18n'
import { IconCross24 } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { closeFeatureProfile } from '../../actions/feature.js'
import Drawer from '../core/Drawer.jsx'
import styles from './styles/FeatureProfile.module.css'

const DrawerContent = ({ data }) => {
    if (Object.keys(data).length === 0) {
        return (
            <div className={styles.noData}>
                {i18n.t('No data to show for this feature.')}
            </div>
        )
    }

    return (
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
    )
}

DrawerContent.propTypes = {
    data: PropTypes.object.isRequired,
}

const FeatureProfile = () => {
    const featureProfile = useSelector((state) => state.featureProfile)
    const dispatch = useDispatch()

    const { name, data } = featureProfile

    return (
        <Drawer className={styles.drawer}>
            <div data-test="feature-profile-header" className={styles.header}>
                {name || i18n.t('Feature profile')}
                <span
                    className={styles.close}
                    onClick={() => dispatch(closeFeatureProfile())}
                >
                    <IconCross24 />
                </span>
            </div>
            <div className={styles.content}>
                <DrawerContent data={data} />
            </div>
        </Drawer>
    )
}

export default FeatureProfile
