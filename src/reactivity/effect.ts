import { extend } from '../shared/index'

let activeEffect
let shouldTrack = false

class ReactiveEffect {
  private _fn: any
  deps = []
  // 只执行一次移除依赖
  active = true
  onStop?: () => void
  public scheduler: Function | undefined
  constructor(_fn, scheduler?: Function) {
    this._fn = _fn
    this.scheduler = scheduler
  }

  run() {
    if (!this.active) {
      // 调用过stop了
      return this._fn()
    }

    // 应该收集
    shouldTrack = true
    activeEffect = this

    const result = this._fn()

    shouldTrack = false
    return result
  }

  stop() {
    // 从依赖中删除当前的 effect
    if (this.active) {
      cleanupEffect(this)
      this.active = false
      this.onStop && this.onStop()
    }
  }
}

function cleanupEffect(effect) {
  effect.deps.forEach((dep) => {
    dep.delete(effect)
  })
}

function isTracking() {
  return shouldTrack && activeEffect !== undefined
}

// { obj: {key1: set1, key2: set2} }   dep是Set类型
const targetMap = new Map()

export function track(target, key) {
  /**
   * 如果只是简单创建一个响应式对象去访问一些属性，但是并没有调用 effect
   * 函数的话，是不会去创建 effect实例的，所以 activeEffect 就是 undefined
   */
  if (!isTracking()) return

  // 一步一步取到 set 然后把依赖添加进去，并且初始化数据
  //  target -> key -> dep
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    // 初始化的时候（应该是第一次发生effect事件 获取响应式数据的值）targetMap是为空的，所以set一下，并且初始化的时候会直接执行fn，
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  let dep = depsMap.get(key)
  if (!dep) {
    // 初始化为空
    dep = new Set()
    depsMap.set(key, dep)
  }

  // 不要重复收集
  if (dep.has(activeEffect)) return

  // 收集依赖
  dep.add(activeEffect)

  /**
   * 反向收集，因为一个实例可以被收集到多个依赖集合所以存在数组里，
   * stop这一个全都移除
   */
  activeEffect.deps.push(dep)
}

// 执行依赖
export function trigger(target, key) {
  // 一步一步取到 set 然后遍历执行
  // 就是根据target取map里的值 然后根据 key再取到 set，然后遍历set 执行一下run
  const deps = targetMap.get(target).get(key)
  for (const effect of deps) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}

// 先是调用 effect -> new 一个新的ReactiveEffect 对象的时候才去track
export function effect(fn, options: any = {}) {
  // fn
  const _effect = new ReactiveEffect(fn, options.scheduler)
  // Object.assign(_effect, options)
  extend(_effect, options)

  _effect.run()

  const runner: any = _effect.run.bind(_effect)
  runner.effect = _effect

  return runner
}

export function stop(runner) {
  runner.effect.stop()
}
