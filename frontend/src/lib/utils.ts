export const idGenerator = () => {
    const tempId =  "" + Date.now() + (Math.floor(Math.random() * Math.pow(10, 3)))
    return parseInt(tempId)
}