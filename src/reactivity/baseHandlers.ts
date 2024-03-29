import { extend, isObject } from '../shared'
import { track, trigger } from './effect'
import { ReactiveFlags, reactive, readonly } from './reactive'

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)

function createGetter(isReadonly = false, isShallowReadonly = false) {
  return function get(target, key) {
    if (key === ReactiveFlags.IS_PROXY) {
      return true
    }

    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    }

    if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    }

    const res = Reflect.get(target, key)

    if (isShallowReadonly) {
      return res
    }

    // 判断 res 是不是一个 object
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }

    if (!isReadonly) {
      // 依赖收集，但也只存在于调用effect函数的情况
      track(target, key)
    }
    return res
  }
}

function createSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value)

    // 触发依赖
    trigger(target, key)
    return res
  }
}

export const mutableHandlers = {
  get,
  set
}

export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key, value) {
    console.warn('操作失败，不能在只读数据上执行set操作')
    return true
  }
}

export const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
  get: shallowReadonlyGet
})
