import { createContext, useContext } from 'react'

export const DragHandleCtx = createContext(null)

export const useDragHandle = () => useContext(DragHandleCtx)
