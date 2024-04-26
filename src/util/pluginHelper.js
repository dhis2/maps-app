const didViewsChange = (oldViews, newViews) => {
    return newViews.some((newView, i) => {
        const oldView = oldViews[i]

        if (
            oldView.filters.length !== newView.filters.length ||
            oldView.rows.length !== newView.rows.length
        ) {
            return true
        }

        if (
            newView.filters.some((filter, j) => {
                const oldItemIds = new Set(
                    oldView.filters[j].items.map((item) => item.id)
                )
                const newItemIds = new Set(filter.items.map((item) => item.id))

                return (
                    oldItemIds.size !== newItemIds.size ||
                    [...oldItemIds].some((id) => !newItemIds.has(id))
                )
            })
        ) {
            return true
        }

        if (
            newView.rows.some((row, j) => {
                const oldItemIds = new Set(
                    oldView.rows[j].items.map((item) => item.id)
                )
                const newItemIds = new Set(row.items.map((item) => item.id))

                return (
                    oldItemIds.size !== newItemIds.size ||
                    [...oldItemIds].some((id) => !newItemIds.has(id))
                )
            })
        ) {
            return true
        }

        return false
    })
}

export { didViewsChange }
