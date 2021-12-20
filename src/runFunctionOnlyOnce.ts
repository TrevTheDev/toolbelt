// returns a function that is only executed on the first call,
// irrespective of how many times it is called.
const runFunctionOnlyOnce = () => {
  let called = false
  // eslint-disable-next-line no-return-assign
  return (fn: (...args: unknown[]) => unknown) => (
    ...args: unknown[]
  ) => called || ((called = true) && fn(...args))
}
export default runFunctionOnlyOnce
