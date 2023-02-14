class ReactiveEffect {
  constructor(_fn) {
    this._fn = _fn
  }

  run() {
    this._fn()
  }
}

const targetMap = new Map()

export function track(target, key) {
  //  target -> ket -> dep
  const depsMap = targetMap.get(target)
  const dep = depsMap.get(key)

  const dep = new Set()
}

export function effect(fn) {
  const _effect = new ReactiveEffect(fn)

  _effect.run()
}
