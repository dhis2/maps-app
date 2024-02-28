import i18n from '@dhis2/d2-i18n'
import { Button } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setFeatureProfile } from '../../actions/feature.js'
import styles from './styles/FeatureButton.module.css'

/*
 *  Displays a button to open the feature profile
 */
const FeatureButton = ({ name, data }) => {
    const dispatch = useDispatch()
    const featureProfile = useSelector((state) => state.featureProfile)

    const setFeature = () =>
        dispatch(
            setFeatureProfile({
                name,
                data,
            })
        )

    return (
        <div className={styles.featureButton}>
            <Button
                small={true}
                disabled={data.id === featureProfile?.data.id}
                onClick={setFeature}
            >
                {i18n.t('View all feature data')}
            </Button>
        </div>
    )
}

FeatureButton.propTypes = {
    data: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
}

export default FeatureButton
