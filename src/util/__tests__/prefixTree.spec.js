import { TYPE_DATETIME } from '../../constants/dataTable.js'
import { buildDateGroupTree } from '../dateGroups.js'
import {
    getNodeCheckState,
    togglePrefix,
    flattenVisibleNodes,
    getSearchMatches,
    nodeMatchesOrHasMatch,
} from '../prefixTree.js'

describe('getNodeCheckState', () => {
    const dayNode = { prefix: '2023-05-15' }

    it('is checked when the node itself is selected', () => {
        expect(getNodeCheckState(dayNode, ['2023-05-15'])).toBe('checked')
    })

    it('is checked when an ancestor prefix is selected', () => {
        expect(getNodeCheckState(dayNode, ['2023'])).toBe('checked')
    })

    it('is indeterminate when only a descendant prefix is selected', () => {
        expect(getNodeCheckState(dayNode, ['2023-05-15 09'])).toBe(
            'indeterminate'
        )
    })

    it('is unchecked otherwise', () => {
        expect(getNodeCheckState(dayNode, ['2023-06-01'])).toBe('unchecked')
        expect(getNodeCheckState(dayNode, [])).toBe('unchecked')
    })
})

describe('togglePrefix', () => {
    it('selects an unchecked node', () => {
        expect(togglePrefix([], { prefix: '2023' })).toEqual(['2023'])
    })

    it('deselects a node that is checked via its own prefix', () => {
        expect(togglePrefix(['2023-01', '2023'], { prefix: '2023' })).toEqual([
            '2023-01',
        ])
    })

    it('selecting a node drops now-redundant descendant prefixes', () => {
        expect(
            togglePrefix(['2023-01', '2023-02'], { prefix: '2023' })
        ).toEqual(['2023'])
    })

    it('is a no-op when checked only via an already-selected ancestor', () => {
        const selected = ['2023']
        expect(togglePrefix(selected, { prefix: '2023-05-15 09' })).toBe(
            selected
        )
    })

    it('selecting an indeterminate node adds it without touching unrelated selections', () => {
        expect(togglePrefix(['2024'], { prefix: '2023-05-15' })).toEqual([
            '2024',
            '2023-05-15',
        ])
    })
})

describe('flattenVisibleNodes', () => {
    const tree = [
        {
            key: '2023',
            children: [
                {
                    key: '2023-05',
                    children: [{ key: '2023-05-15', children: [] }],
                },
            ],
        },
        { key: '2024', children: [] },
    ]

    it('shows only root nodes when nothing is expanded', () => {
        expect(
            flattenVisibleNodes(tree, new Set()).map((r) => r.node.key)
        ).toEqual(['2023', '2024'])
    })

    it('shows children of an expanded node at depth + 1', () => {
        const result = flattenVisibleNodes(tree, new Set(['2023']))
        expect(result.map((r) => [r.node.key, r.depth])).toEqual([
            ['2023', 0],
            ['2023-05', 1],
            ['2024', 0],
        ])
    })

    it('recurses into nested expanded nodes', () => {
        const result = flattenVisibleNodes(tree, new Set(['2023', '2023-05']))
        expect(result.map((r) => r.node.key)).toEqual([
            '2023',
            '2023-05',
            '2023-05-15',
            '2024',
        ])
    })
})

describe('getSearchMatches / nodeMatchesOrHasMatch', () => {
    const tree = buildDateGroupTree(
        ['2023-05-15 09:00:00.0', '2024-01-01 00:00:00.0'],
        TYPE_DATETIME
    )

    it('a year-number search matches every node whose raw prefix starts with that year, since a descendant prefix is always a literal extension of its ancestors', () => {
        const { matchedKeys, expandedAncestorKeys } = getSearchMatches(
            tree,
            '2024'
        )
        expect(matchedKeys.has('2024')).toBe(true)
        expect(matchedKeys.has('2024-01')).toBe(true)
        expect(matchedKeys.has('2024-01-01 00:00:00.0')).toBe(true)
        expect(matchedKeys.has('2023')).toBe(false)
        // the value match's ancestors get force-expanded
        expect(expandedAncestorKeys.has('2024')).toBe(true)
        expect(expandedAncestorKeys.has('2024-01')).toBe(true)
        expect(expandedAncestorKeys.has('2024-01-01')).toBe(true)
        expect(expandedAncestorKeys.has('2024-01-01 00')).toBe(true)
    })

    it('matches a deep node by a longer numeric prefix and reports every ancestor key', () => {
        const { matchedKeys, expandedAncestorKeys } = getSearchMatches(
            tree,
            '2023-05'
        )
        expect(matchedKeys.has('2023-05')).toBe(true)
        expect(matchedKeys.has('2024-01')).toBe(false)
        expect(expandedAncestorKeys.has('2023')).toBe(true)
    })

    it('nodeMatchesOrHasMatch is true for a match and for any ancestor of a match', () => {
        const { matchedKeys } = getSearchMatches(tree, '2023-05')
        const yearNode = tree.find((n) => n.key === '2023')
        expect(nodeMatchesOrHasMatch(yearNode, matchedKeys)).toBe(true)
        const otherYear = tree.find((n) => n.key === '2024')
        expect(nodeMatchesOrHasMatch(otherYear, matchedKeys)).toBe(false)
    })
})
