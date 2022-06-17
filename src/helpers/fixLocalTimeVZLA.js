export const fixLocalTimeVZLA = () => {
    const miliSec = new Date().getTime()
    const subtractSec = 30 * 60000
    const createAt = miliSec - subtractSec
    return new Date(createAt)
}