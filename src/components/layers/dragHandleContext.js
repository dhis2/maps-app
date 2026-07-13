import { createContext } from 'react'

// Passes the dnd-kit drag handle props (attributes + listeners) from the
// sortable layer wrapper down to the nested SortableHandle, which lives deep
// inside the layer card. Mirrors the behaviour react-sortable-hoc's
// SortableHandle HOC used to provide via context.
export const DragHandleContext = createContext(null)
