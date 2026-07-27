const getOrCreateNode = (childMap, { key, prefix, ouLevel }) => {
    let node = childMap.get(key)
    if (!node) {
        node = { key, prefix, ouLevel, name: null, childMap: new Map() }
        childMap.set(key, node)
    }
    return node
}

const sortedNodes = (childMap) =>
    Array.from(childMap.values()).map((node) => ({
        key: node.key,
        prefix: node.prefix,
        ouLevel: node.ouLevel,
        name: node.name,
        children: sortedNodes(node.childMap),
    }))

export const buildOrgUnitGroupTree = (pathValues) => {
    const rootMap = new Map()

    pathValues.forEach((path) => {
        const ids = String(path).split('/').filter(Boolean)
        let map = rootMap
        let prefix = ''
        ids.forEach((id, depth) => {
            prefix += `/${id}`
            const node = getOrCreateNode(map, {
                key: id,
                prefix,
                ouLevel: depth + 1,
            })
            map = node.childMap
        })
    })

    return sortedNodes(rootMap)
}

export const formatOrgUnitNodeLabel = (node, idToName) =>
    idToName?.get(node.key) ?? node.key

export const formatOrgUnitPathBreadcrumb = (path, idToName) =>
    String(path)
        .split('/')
        .filter(Boolean)
        .map((id) => idToName?.get(id) ?? id)
        .join(' / ')

export const formatOrgUnitOwnName = (path, idToName) => {
    const leafId = String(path).split('/').findLast(Boolean)
    return formatOrgUnitNodeLabel({ key: leafId }, idToName)
}

const collectOrgUnitMatches = (nodes, ancestors, options) => {
    const { normalizedSearch, idToName, result } = options
    nodes.forEach((node) => {
        const name = idToName?.get(node.key)
        const isMatch =
            node.prefix.toLowerCase().includes(normalizedSearch) ||
            name?.toLowerCase().includes(normalizedSearch)
        if (isMatch) {
            result.matchedKeys.add(node.key)
            ancestors.forEach((key) => result.expandedAncestorKeys.add(key))
        }
        if (node.children.length) {
            collectOrgUnitMatches(
                node.children,
                [...ancestors, node.key],
                options
            )
        }
    })
}

export const getOrgUnitSearchMatches = (tree, normalizedSearch, idToName) => {
    const result = { matchedKeys: new Set(), expandedAncestorKeys: new Set() }
    collectOrgUnitMatches(tree, [], { normalizedSearch, idToName, result })
    return result
}
