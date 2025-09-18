import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { CenteredContent, CircularLoader, IconCross24 } from '@dhis2/ui'
import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { closeOrgUnitProfile } from '../../actions/orgUnits.js'
import useKeyDown from '../../hooks/useKeyDown.js'
import Drawer from '../core/Drawer.jsx'
import OrgUnitData from './OrgUnitData.jsx'
import OrgUnitInfo from './OrgUnitInfo.jsx'
import styles from './styles/OrgUnitProfile.module.css'

const ORGUNIT_PROFILE_QUERY = {
    profile: {
        resource: 'organisationUnitProfile',
        id: ({ id }) => `${id}/data`,
    },
}

/*
 *  Loads an org unit profile and displays it in a right drawer component
 */
const OrgUnitProfile = () => {
    const id = useSelector((state) => state.orgUnitProfile)
    const dispatch = useDispatch()
    const { loading, data, refetch } = useDataQuery(ORGUNIT_PROFILE_QUERY, {
        lazy: true,
    })

    useEffect(() => {
        if (id) {
            refetch({
                id,
            })
        }
    }, [id, refetch])

    useKeyDown('Escape', () => dispatch(closeOrgUnitProfile()), true)

    if (!id) {
        return null
    }

    return (
        <Drawer className={styles.drawer} dataTest="org-unit-profile">
            <div className={styles.header}>
                {i18n.t('Organisation unit profile')}
                <span
                    role="button"
                    aria-label={i18n.t('Close')}
                    className={styles.close}
                    onClick={() => dispatch(closeOrgUnitProfile())}
                >
                    <IconCross24 />
                </span>
            </div>
            <div className={styles.content}>
                {loading && (
                    <CenteredContent>
                        <CircularLoader />
                    </CenteredContent>
                )}
                {!loading && data?.profile && (
                    <>
                        <OrgUnitInfo
                            {...data.profile.info}
                            groupSets={data.profile.groupSets}
                            attributes={data.profile.attributes}
                        />
                        <OrgUnitData id={id} />
                    </>
                )}
            </div>
        </Drawer>
    )
}

export default OrgUnitProfile
