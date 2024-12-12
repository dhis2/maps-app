import { useEffect } from 'react'

const useKeyDown = (key, callback) => {
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === key) {
                callback(event)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [key, callback])
}

export default useKeyDown
