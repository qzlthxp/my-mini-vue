import { reactive } from '../reactive'
import { effect, stop } from '../effect'

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
     * 为什么要调用effect方法？
     * 在vue3中 例如 const user = reactive({age: 10})  let age = user.age + 1 这里的 age依赖user.age 但是不会在user.age 变化时更新，一般采用 computed或者 watchEffect 或者 watch的方式进行更新 这些都在底层调用effect函数
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

  it('should return runner when call effect ', () => {
    // 执行effect传递一个fn，effect会返回一个方法 runner，执行runner再次执行fn 并且返回fn的返回值
    let foo = 10

    const runner = effect(() => {
      foo++
      return 'foo'
    })
    expect(foo).toBe(11)
    const r = runner()
    expect(foo).toBe(12)
    expect(r).toBe('foo')
    runner()
    expect(foo).toBe(13)
  })

  it('exist scheduler trigger data set dont run fn', () => {
    let dummy
    let run: any
    const scheduler = jest.fn(() => {
      run = runner
    })
    const obj = reactive({ foo: 1 })
    const runner = effect(
      () => {
        dummy = obj.foo
        return 'trigger runner'
      },
      { scheduler }
    )
    // 第一次 不触发 scheduler，只是执行fn
    expect(scheduler).not.toHaveBeenCalled()
    expect(dummy).toBe(1)
    // 拦截set 执行 trigger
    obj.foo++
    // 只是执行 scheduler
    expect(scheduler).toHaveBeenCalledTimes(1)
    expect(dummy).toBe(1)
    // 执行run，run是effect返回的fn，通过调用 scheduler 进行赋值，
    // 通过上一节知道 runner 就是调用fn的一个方法，并且返回fn的返回值
    const runnerRes = run()
    expect(dummy).toBe(2)
    expect(runnerRes).toBe('trigger runner')
  })

  it('stop can remove depend', () => {
    // 视频代码
    let dummy
    const obj = reactive({ prop: 1 })
    const runner = effect(() => {
      dummy = obj.prop
    })
    obj.prop = 2
    expect(dummy).toBe(2)
    stop(runner)

    obj.prop++
    expect(dummy).toBe(2)

    runner()
    expect(dummy).toBe(3)

    obj.prop++
    expect(dummy).toBe(3)

    runner()
    expect(dummy).toBe(4)
  })

  it('noStop', () => {
    // 调用 stop ，onStop会被执行
    const obj = reactive({ foo: 1 })
    const onStop = jest.fn()
    let dummy
    const runner = effect(
      () => {
        dummy = obj.foo
      },
      {
        onStop
      }
    )
    stop(runner)
    expect(onStop).toBeCalledTimes(1)
  })
})
