import { useState, useEffect } from 'react'
import { mockCatalogueSources } from './mockCatalogueSources.js'

// Module-level shared state so favourites are consistent across the popover and modal
const favIds = new Set(
    mockCatalogueSources.filter((s) => s.isFavorite).map((s) => s.id)
)
const listeners = new Set()

const toggle = (id) => {
    if (favIds.has(id)) {
        favIds.delete(id)
    } else {
        favIds.add(id)
    }
    const snapshot = new Set(favIds)
    listeners.forEach((fn) => fn(snapshot))
}

export const useFavorites = () => {
    const [favorites, setFavorites] = useState(() => new Set(favIds))
    useEffect(() => {
        listeners.add(setFavorites)
        return () => listeners.delete(setFavorites)
    }, [])
    return [favorites, toggle]
}
