export const formatOrgUnitPathBreadcrumb = (path, idToName) =>
    String(path)
        .split('/')
        .filter(Boolean)
        .map((id) => idToName?.get(id) ?? id)
        .join(' / ')

export const formatOrgUnitOwnName = (path, idToName) => {
    const leafId = String(path).split('/').findLast(Boolean)
    return idToName?.get(leafId) ?? leafId
}
