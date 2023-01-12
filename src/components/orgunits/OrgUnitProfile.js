import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { CenteredContent, CircularLoader, IconCross24 } from '@dhis2/ui'
import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { closeOrgUnitProfile } from '../../actions/orgUnits.js'
import {
    getFixedPeriodsByType,
    filterFuturePeriods,
} from '../../util/periods.js'
import Drawer from '../core/Drawer.js'
import OrgUnitData from './OrgUnitData.js'
import OrgUnitInfo from './OrgUnitInfo.js'
import styles from './styles/OrgUnitProfile.module.css'

// Only YEARLY period type is supported in first version
const periodType = 'YEARLY'
const currentYear = String(new Date().getFullYear())
const periods = getFixedPeriodsByType(periodType, currentYear)
const defaultPeriod = filterFuturePeriods(periods)[0] || periods[0]

const ORGUNIT_PROFILE_QUERY = {
    profile: {
        resource: 'organisationUnitProfile',
        id: ({ id }) => `${id}/data`,
        params: ({ period }) => ({
            period,
        }),
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
                period: defaultPeriod.id,
            })
        }
    }, [id, refetch])

    if (!id) {
        return null
    }

    return (
        <Drawer className={styles.drawer}>
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
                        <OrgUnitData
                            id={id}
                            periodType={periodType}
                            defaultPeriod={defaultPeriod}
                        />
                    </>
                )}
            </div>
        </Drawer>
    )
}

export default OrgUnitProfile
