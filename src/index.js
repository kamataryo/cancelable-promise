const hasCanceled = {}

export const makeCancelable = promise => {
  const id = Symbol('cancelable promise')

  return {
    /**
     * @return {Promise} return cancelable promise
     */
    promise: () =>
      new Promise((resolve, reject) =>
        promise.then(result => {
          if (hasCanceled[id]) {
            delete hasCanceled[id]
            return reject({ isCanceled: true })
          } else {
            return resolve(result)
          }
        }),
      ),

    /**
     * cancel promise
     * @return {void}
     */
    cancel: () => {
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
