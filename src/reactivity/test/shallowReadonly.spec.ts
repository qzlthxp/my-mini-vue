import { isReadonly, shallowReadonly } from '../reactive'

/**
 * 只有第一层是 readonly
 */
describe('shallowReadonly', () => {
  test('should not make non-reactive properties reactive', () => {
    const props = shallowReadonly({ n: { foo: 1 } })
    expect(isReadonly(props)).toBe(true)
    expect(isReadonly(props.n)).toBe(false)
  })

  it('warn then call set', () => {
    console.warn = jest.fn()

    const props = shallowReadonly({ n: { foo: 1 } })

    props.n = { bar: 2 }

    expect(console.warn).toBeCalled()
    expect(console.warn).toHaveBeenCalledTimes(1)

    props.n.foo = 2

    expect(props.n.foo).toBe(2)
  })
})
