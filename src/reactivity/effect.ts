class ReactiveEffect {
  _fn
  constructor(_fn) {
    this._fn = _fn
  }

  run() {
    activeEffect = this
    return this._fn()
  }
}

// { obj: {key: dep} }   dep是Set类型
const targetMap = new Map()

export function track(target, key) {
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

  // 调用 effect 才去收集依赖
  if (activeEffect && !dep.has(activeEffect)) {
    dep.add(activeEffect)
  }
}

// 执行依赖
export function trigger(target, key) {
  // 一步一步取到 set 然后遍历执行
  // 就是根据target取map里的值 然后根据 key再取到 set，然后遍历set 执行一下run
  const deps = targetMap.get(target).get(key)
  for (const dep of deps) {
    dep.run()
  }
}

let activeEffect

export function effect(fn) {
  const _effect = new ReactiveEffect(fn)

  _effect.run()

  return _effect.run.bind(_effect)
}
