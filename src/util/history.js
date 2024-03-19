import { createHashHistory } from 'history'
import queryString from 'query-string'

const history = createHashHistory()
export default history

const defaultHashUrlParams = {
    mapId: '',
    isDownload: false,
    interpretationId: null,
}

const DOWNLOAD = 'download'

const getHashUrlParams = (loc) => {
    const params = queryString.parse(loc.search || '', {
        parseBooleans: true,
    })

    const pathParts = loc.pathname.slice(1).split('/')
    if (pathParts.length > 0) {
        if (pathParts[0] === DOWNLOAD) {
            params.mapId = ''
            params.isDownload = true
        } else {
            params.mapId = pathParts[0]

            if (pathParts[1] === DOWNLOAD) {
                params.isDownload = true
            }
        }
    }

    return params
}

const getHashUrlParam = (key) => {
    const params = getHashUrlParams(history.location)
    return params[key]
}

const openDownloadMode = () => {
    if (history.location.pathname === '/') {
        history.push(`/${DOWNLOAD}`)
    } else {
        history.push(`${history.location.pathname}/${DOWNLOAD}`)
    }
}

const closeDownloadMode = () => {
    if (history.location.pathname === `/${DOWNLOAD}`) {
        history.push('/')
    } else {
        const rootPath = history.location.pathname.split(`/${DOWNLOAD}`)[0]
        history.push(rootPath)
    }
}

export {
    getHashUrlParams,
    getHashUrlParam,
    defaultHashUrlParams,
    openDownloadMode,
    closeDownloadMode,
}
