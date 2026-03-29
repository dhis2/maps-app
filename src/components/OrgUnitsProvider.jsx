import { useDataEngine } from '@dhis2/app-runtime'
import PropTypes from 'prop-types'
import React, { useContext, useState, useEffect, createContext } from 'react'

// Fetches the root org units associated with the current user with fallback to data capture org units
const ORG_UNITS_QUERY = {
    roots: {
        resource: 'organisationUnits',
        params: () => ({
            fields: ['id', 'displayName~rename(name)', 'path'], // TODO organisationUnits has shortName
            userDataViewFallback: true,
        }),
    },
    levels: {
        resource: 'organisationUnitLevels',
        params: {
            fields: ['id', 'displayName~rename(name)', 'level'],
            order: 'level:asc',
            paging: false,
        },
    },
}

export const OrgUnitsCtx = createContext({})

const OrgUnitsProvider = ({ children }) => {
    const [orgUnits, setOrgUnits] = useState()
    const [error, setError] = useState()
    const engine = useDataEngine()

    useEffect(() => {
        engine.query(ORG_UNITS_QUERY, {
            onComplete: ({ levels, roots }) =>
                setOrgUnits({
                    levels: levels.organisationUnitLevels,
                    roots: roots.organisationUnits,
                }),
            onError: setError,
        })
    }, [engine])

    return (
        <OrgUnitsCtx.Provider
            value={{
                ...orgUnits,
                loading: !orgUnits && !error,
                error,
            }}
        >
            {children}
        </OrgUnitsCtx.Provider>
    )
}

OrgUnitsProvider.propTypes = {
    children: PropTypes.node,
}

export default OrgUnitsProvider

export const useOrgUnits = () => useContext(OrgUnitsCtx)
