export const formatCount = (count) => {
    let num

    if (count >= 1000 && count < 9500) {
        num = (count / 1000).toFixed(1) + 'k' // 3.3k
    } else if (count >= 9500 && count < 999500) {
        num = Math.round(count / 1000) + 'k' // 33k
    } else if (count >= 999500 && count < 1950000) {
        num = (count / 1000000).toFixed(1) + 'M' // 3.3M
    } else if (count > 1950000) {
        num = Math.round(count / 1000000) + 'M' // 33M
    }

    return num || count
}

// Rounds a number to d decimals
export const numberPrecision = (d) => {
    if (d === undefined) {
        return (n) => n
    }
    const m = Math.pow(10, d)
    return (n) => Math.round(n * m) / m
}
