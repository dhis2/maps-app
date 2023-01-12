import { useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { CenteredContent, CircularLoader, IconCross24 } from '@dhis2/ui'
import React, { useState, useEffect } from 'react'
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

/*
 *  Loads an org unit profile and displays it in a right drawer component
 */
const OrgUnitProfile = () => {
    const [profile, setProfile] = useState(null)
    const id = useSelector((state) => state.orgUnitProfile)
    const dispatch = useDispatch()
    const engine = useDataEngine()

    useEffect(() => {
        if (id) {
            const query = {
                orgUnitProfile: {
                    resource: `organisationUnitProfile/${id}/data`,
                    params: {
                        period: defaultPeriod.id,
                    },
                },
            }

            const fetchOrgUnitProfile = async () => {
                const res = await engine.query(query)
                console.log('res', res)
                const { orgUnitProfile } = res
                setProfile(orgUnitProfile)
            }
            setProfile(null)
            fetchOrgUnitProfile()
        }
    }, [id, engine])

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
                {profile ? (
                    <>
                        <OrgUnitInfo
                            {...profile.info}
                            groupSets={profile.groupSets}
                            attributes={profile.attributes}
                        />
                        <OrgUnitData
                            id={id}
                            periodType={periodType}
                            defaultPeriod={defaultPeriod}
                            defaultItems={profile.dataItems}
                        />
                    </>
                ) : (
                    <CenteredContent>
                        <CircularLoader />
                    </CenteredContent>
                )}
            </div>
        </Drawer>
    )
}

export default OrgUnitProfile
