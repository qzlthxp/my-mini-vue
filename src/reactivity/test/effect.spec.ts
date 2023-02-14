import { reactive } from '../reactive'
import { effect } from '../effect'

describe('effect', () => {
  it('happy path', () => {
    const user = reactive({
      age: 10
    })
    let nextAge

    /**
     * 为什么要用代理（proxy）？不能直接字面量吗？
     * 字面量同样可以创建一个对象但是不能拦截操作，尤其是set和get
     *
     * 调用effect直接执行fn fn又涉及响应式更新所以要收集起来，等到下次代理数据变化的时候直接执行这个fn 就有响应式了
     * （代理对象调用 set 时执行所有依赖这个属性的fn）
     *
     * 何时收集？怎么收集？怎么存储？
     * 1.所有的fn通过代理对象调用get的时候去收集起来，因为只有这个时候我才知道你依赖我的代理数据
     * 2.对应的key存对应的fn
     * targetmap.get(key)  keySet存fn
     */
    effect(() => {
      nextAge = user.age + 1
    })
    expect(nextAge).toBe(11)

    // update
    user.age++
    expect(nextAge).toBe(12)
  })
})
