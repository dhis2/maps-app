import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { Layer, CenteredContent, CircularLoader, NoticeBox } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { createContext, useContext, useEffect, useState } from 'react'

const CachedDataCtx = createContext({})

const CachedDataProvider = ({
    query,
    dataTransformation,
    children,
    translucent = true,
}) => {
    const { data: rawData, error, loading } = useDataQuery(query)
    const [transformedData, setTransformedData] = useState(undefined)
    const [transformLoading, setTransformLoading] = useState(
        Boolean(dataTransformation)
    )
    const [transformError, setTransformError] = useState(null)

    useEffect(() => {
        let isMounted = true

        const runTransformation = async () => {
            if (!rawData || !dataTransformation) {
                isMounted && setTransformedData(rawData)
                return
            }

            try {
                setTransformLoading(true)
                const result = await Promise.resolve(
                    dataTransformation(rawData)
                )
                isMounted && setTransformedData(result)
                setTransformError(null)
            } catch (err) {
                isMounted && setTransformError(err)
            } finally {
                isMounted && setTransformLoading(false)
            }
        }

        runTransformation()

        return () => {
            isMounted = false
        }
    }, [rawData, dataTransformation])

    if (loading || transformLoading) {
        return (
            <Layer translucent={translucent}>
                <CenteredContent>
                    <CircularLoader />
                </CenteredContent>
            </Layer>
        )
    }

    if (error || transformError) {
        const fallbackMsg = i18n.t('This app could not retrieve required data.')
        return (
            <NoticeBox error title={i18n.t('Network error')}>
                {error?.message || transformError?.message || fallbackMsg}
            </NoticeBox>
        )
    }

    return (
        <CachedDataCtx.Provider value={transformedData}>
            {children}
        </CachedDataCtx.Provider>
    )
}

CachedDataProvider.propTypes = {
    children: PropTypes.node.isRequired,
    query: PropTypes.object.isRequired,
    dataTransformation: PropTypes.func,
    translucent: PropTypes.bool,
}

const useCachedData = () => useContext(CachedDataCtx)

export { CachedDataProvider, useCachedData }
