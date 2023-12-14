import queryString from 'query-string'
import { useState, useEffect } from 'react'
import history from './history.js'

const options = { parseBooleans: true }

const useInterpretationQueryParams = () => {
    const [params, setParams] = useState(
        queryString.parse(history.location.search, options)
    )
    useEffect(() => {
        const unlisten = history.listen(({ location }) => {
            if (location.state?.isModalOpening) {
                setParams(queryString.parse(history.location.search, options))
            }
            if (location.state?.isModalClosing) {
                setParams(queryString.parse(history.location.search, options))
            }
        })
        return unlisten
    }, [])

    return params
}

const removeInterpretationQueryParams = () => {
    const parsed = queryString.parse(history.location.search, {
        parseBooleans: true,
    })
    // Keep all other query params in tact
    const parsedWithoutInterpretationId = Object.entries(parsed).reduce(
        (acc, [key, value]) => {
            if (
                key !== 'interpretationId' &&
                key !== 'interpretationid' &&
                key !== 'initialFocus'
            ) {
                acc[key] = value
            }
            return acc
        },
        {}
    )
    const search = queryString.stringify(parsedWithoutInterpretationId)

    history.push(
        {
            ...history.location,
            search,
        },
        {
            isModalClosing: true,
        }
    )
}

export { useInterpretationQueryParams, removeInterpretationQueryParams }
