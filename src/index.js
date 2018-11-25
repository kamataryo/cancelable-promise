const hasCanceled = {}
const rejector = {}

const defaultCancelOptions = {
  immediate: false,
}

export const makeCancelable = promise => {
  const id = Symbol('cancelable promise')

  return {
    /**
     * @return {Promise} return cancelable promise
     */
    promise: () =>
      new Promise((resolve, reject) => {
        rejector[id] = () => reject({ isCanceled: true })
        return promise.then(result => {
          if (hasCanceled[id]) {
            delete hasCanceled[id]
            return reject({ isCanceled: true })
          } else {
            return resolve(result)
          }
        })
      }),

    /**
     * cancel promise
     * @param  {object} arg options
     * @return {void}
     */
    cancel: arg => {
      const options = { ...defaultCancelOptions, ...arg }
      const reject = rejector[id]
      if (options.immediate && typeof reject === 'function') {
        reject()
      }
      hasCanceled[id] = true
    },
  }
}

export default class CancelablePromise {
  constructor(executor) {
    const cancelablePromise = makeCancelable(new Promise(executor))
    return cancelablePromise
  }
}
