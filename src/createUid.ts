const createUid = (length = 20): string => Array.from(
  { length },
  () => Math.random().toString(36)[2],
).join('')

export default createUid
