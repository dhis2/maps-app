export const getNodeCheckState = (node, selectedPrefixes) => {
    if (
        selectedPrefixes.some(
            (prefix) => node.prefix === prefix || node.prefix.startsWith(prefix)
        )
    ) {
        return 'checked'
    }
    if (selectedPrefixes.some((prefix) => prefix.startsWith(node.prefix))) {
        return 'indeterminate'
    }
    return 'unchecked'
}

export const togglePrefix = (selectedPrefixes, node) => {
    const state = getNodeCheckState(node, selectedPrefixes)
    if (state === 'checked') {
        return selectedPrefixes.includes(node.prefix)
            ? selectedPrefixes.filter((prefix) => prefix !== node.prefix)
            : selectedPrefixes
    }
    return [
        ...selectedPrefixes.filter((prefix) => !prefix.startsWith(node.prefix)),
        node.prefix,
    ]
}

export const flattenVisibleNodes = (tree, expandedKeys) => {
    const result = []
    const walk = (nodes, depth) => {
        nodes.forEach((node) => {
            result.push({ node, depth })
            if (node.children.length && expandedKeys.has(node.key)) {
                walk(node.children, depth + 1)
            }
        })
    }
    walk(tree, 0)
    return result
}

const collectMatches = (nodes, ancestors, options) => {
    const { normalizedSearch, result } = options
    nodes.forEach((node) => {
        const isMatch = node.prefix.toLowerCase().includes(normalizedSearch)
        if (isMatch) {
            result.matchedKeys.add(node.key)
            ancestors.forEach((key) => result.expandedAncestorKeys.add(key))
        }
        if (node.children.length) {
            collectMatches(node.children, [...ancestors, node.key], options)
        }
    })
}

export const getSearchMatches = (tree, normalizedSearch) => {
    const result = { matchedKeys: new Set(), expandedAncestorKeys: new Set() }
    collectMatches(tree, [], { normalizedSearch, result })
    return result
}

export const nodeMatchesOrHasMatch = (node, matchedKeys) =>
    matchedKeys.has(node.key) ||
    node.children.some((child) => nodeMatchesOrHasMatch(child, matchedKeys))

export const flattenAllNodes = (tree) => {
    const result = []
    const walk = (nodes) => {
        nodes.forEach((node) => {
            result.push(node)
            if (node.children.length) {
                walk(node.children)
            }
        })
    }
    walk(tree)
    return result
}
