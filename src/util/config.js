export const parseJsonConfig = (jsonString) => {
    if (!jsonString || typeof jsonString !== 'string') {
        return {}
    }
    try {
        return JSON.parse(jsonString)
    } catch {
        return {}
    }
}
