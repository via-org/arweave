/** @param {string[]} items @returns {string} */
// @ts-ignore
export const list = items => new Intl.ListFormat().format(items)
