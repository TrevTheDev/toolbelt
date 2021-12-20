declare global {
    interface Array<T> {
        reverseForEach(callbackFn: (value: T, index: number, array: T[]) => void): void;
    }
}

// eslint-disable-next-line func-names
const reverseForEach = function (
  this: unknown[],
  callbackFn: (value: unknown, index: number, array: unknown[]) => void,
) {
  let i: number
  const len = this.length - 1
  for (i = len; i >= 0; i -= 1)
    callbackFn(this[i], i, this)
}

if (!('reverseForEach' in Array.prototype)) {
  // eslint-disable-next-line no-extend-native
  Array.prototype.reverseForEach = reverseForEach
}
export default reverseForEach
