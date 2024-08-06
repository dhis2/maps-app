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
                const oldItemIds = oldView.filters[j].items.map(
                    (item) => item.id
                )

                const newItemIds = filter.items.map((item) => item.id)

                return (
                    oldItemIds.length !== newItemIds.length ||
                    !oldItemIds.every((id, index) => id === newItemIds[index])
                )
            })
        ) {
            return true
        }

        if (
            newView.rows.some((row, j) => {
                const oldItemIds = oldView.rows[j].items.map((item) => item.id)

                const newItemIds = row.items.map((item) => item.id)

                return (
                    oldItemIds.length !== newItemIds.length ||
                    !oldItemIds.every((id, index) => id === newItemIds[index])
                )
            })
        ) {
            return true
        }

        return false
    })
}

export { didViewsChange }
