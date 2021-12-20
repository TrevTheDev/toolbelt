import { expect } from 'chai'
import { reverseForEach } from '../src/index'

if (!('reverseForEach' in Array.prototype)) {
  // eslint-disable-next-line no-extend-native
  Array.prototype.reverseForEach = reverseForEach
}

describe('reverseForEach', () => {
  it('reverseForEach', (done) => {
    const arr = [1, 2, 3, 4, 5, 10]
    let i = arr.length - 1
    arr.reverseForEach((num, index) => {
      console.log(`${num}, ${arr[i]}`)
      expect(index).to.equal(i)
      expect(num).to.equal(arr[i])
      i -= 1
    })
    done()
  })
})
