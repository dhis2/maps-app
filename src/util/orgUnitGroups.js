const getOrCreateNode = (childMap, { key, prefix, ouLevel }) => {
    let node = childMap.get(key)
    if (!node) {
        node = { key, prefix, ouLevel, name: null, childMap: new Map() }
        childMap.set(key, node)
    }
    return node
}

// Preserves encounter order rather than re-sorting: buildOrgUnitGroupTree's
// caller (OrgUnitGroupFilterInput.jsx) always receives pathValues already
// ordered to match the column's current sort direction (see useTableData.js's
// columnOptions) - walking them in that order naturally reproduces the same
// ascending/descending order at every level of the tree, so the popover's
// checkbox order stays consistent with the column header's sort, just like
// every other filter popover's option list already does.
const sortedNodes = (childMap) =>
    Array.from(childMap.values()).map((node) => ({
        key: node.key,
        prefix: node.prefix,
        ouLevel: node.ouLevel,
        name: node.name,
        children: sortedNodes(node.childMap),
    }))

// Builds an ancestor-path tree (Country -> Region -> District -> Facility,
// or however many levels a given path has) from a column's flat distinct
// full-path values (e.g. '/ImspTQPwCqd/O6uvpzGd5pu/lc3eMKXaEfw'). Unlike
// dateGroups.js's tree, an org unit's own id is naturally the tree's leaf -
// no separate terminal "value" node is needed, since the path's last
// segment already is the selectable unit. `name` starts null on every node;
// callers resolve it asynchronously and re-render (see
// src/hooks/useOrgUnitAncestorNames.js), falling back to the raw id label
// until then.
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
    const leafId = String(path).split('/').filter(Boolean).pop()
    return formatOrgUnitNodeLabel({ key: leafId }, idToName)
}

const collectOrgUnitMatches = (nodes, ancestors, options) => {
    const { normalizedSearch, idToName, result } = options
    nodes.forEach((node) => {
        const name = idToName?.get(node.key)
        const isMatch =
            node.prefix.toLowerCase().includes(normalizedSearch) ||
            (name && name.toLowerCase().includes(normalizedSearch))
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
