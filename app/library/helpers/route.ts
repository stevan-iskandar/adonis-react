import { controllers } from '#generated/controllers'

type Controller = abstract new (...args: any[]) => any
type LazyController = () => Promise<{ default: Controller }>
type ControllerActions<C extends Controller> = {
  [M in keyof InstanceType<C> as InstanceType<C>[M] extends (...args: any[]) => any ? M : never]: [
    () => Promise<{ default: C }>,
    M,
  ]
}
type ActionTree<T> = {
  [K in keyof T]: T[K] extends () => Promise<{ default: infer C extends Controller }>
    ? ControllerActions<C>
    : ActionTree<T[K]>
}

/**
 * Mirrors the generated controller index, turning `actions.Session.store` into
 * the `[lazyImport, 'store']` tuple the router expects. The mapped type keeps
 * each method's declaration, so "Go to Definition" lands on the method itself.
 */
export function toActions<T extends object>(tree: T): ActionTree<T> {
  return new Proxy(tree, {
    get(target, key) {
      const node = Reflect.get(target, key)
      if (typeof node !== 'function') return toActions(node as object)
      return new Proxy({}, { get: (_, method) => [node as LazyController, String(method)] })
    },
  }) as ActionTree<T>
}

export const actions = toActions(controllers)
