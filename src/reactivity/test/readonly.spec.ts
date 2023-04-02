import { readonly, isReadonly, isProxy } from '../reactive'

describe('reactive', () => {
  it('happy path', () => {
    const original = { foo: 1, bar: { baz: 2 } }
    const wrapped = readonly(original)
    expect(wrapped).not.toBe(original)
    expect(isReadonly(wrapped.bar)).toBe(true)
    expect(isReadonly(wrapped)).toBe(true)
    expect(isProxy(wrapped.bar)).toBe(true)
    expect(isProxy(wrapped)).toBe(true)
  })

  it('warn then call set', () => {
    console.warn = jest.fn()

    const user = readonly({
      age: 10
    })

    user.age = 11

    expect(console.warn).toBeCalled()
    expect(console.warn).toHaveBeenCalledTimes(1)
  })
})
