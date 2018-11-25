import test from 'ava'
import CancelablePromise, { makeCancelable } from './'

test('not canceled', async t => {
  const myPromise = new Promise(resolve => setTimeout(resolve, 50))
  const { promise } = makeCancelable(myPromise)

  let catched = false
  try {
    await promise()
  } catch (error) {
    catched = true
  }
  t.false(catched)
})

test('canceled', async t => {
  const myPromise = new Promise(resolve => setTimeout(resolve, 50))
  const { promise, cancel } = makeCancelable(myPromise)
  cancel()

  try {
    await promise()
  } catch (error) {
    t.true(error.isCanceled)
  }
})

test('chained success', t => {
  const myPromise = new Promise(resolve => setTimeout(resolve, 50)).then(
    () => 'success',
  )

  const { promise } = makeCancelable(myPromise)

  return promise().then(result => t.true(result === 'success'))
})

test('chained fail', t => {
  const result = {}

  const myPromise = new Promise(resolve => setTimeout(resolve, 50)).then(
    () => (result.innerThen = true),
  )

  const { promise, cancel } = makeCancelable(myPromise)

  cancel()

  return promise()
    .then(() => (result.then = true))
    .catch(error => {
      result.catched = true
      t.true(error.isCanceled)
    })
    .then(() => {
      t.true(result.innerThen)
      t.true(result.catched)
    })
})

test('race', t => {
  const myPromise = new Promise(resolve => setTimeout(resolve, 50))
  const { promise: promise1, cancel } = makeCancelable(myPromise)
  const { promise: promise2 } = makeCancelable(myPromise)

  cancel()

  return Promise.all([
    promise1().catch(err => err),
    promise2().then(() => ({ notCanceled: true })),
  ]).then(result => {
    t.true(result[0].isCanceled)
    t.true(result[1].notCanceled)
  })
})

test('class', t => {
  const { promise, cancel } = new CancelablePromise(resolve =>
    setTimeout(resolve, 50),
  )
  cancel()
  return promise().catch(err => t.true(err.isCanceled))
})

test('cancel immediately', t => {
  const { promise, cancel } = new CancelablePromise(resolve =>
    setTimeout(resolve, 1000),
  )

  const started = Date.now()
  setTimeout(() => cancel({ immediate: true }), 500)

  return promise()
    .catch(() => {})
    .then(() => t.true(Date.now() - started < 1000))
})

test('cancel not immediately', t => {
  const { promise, cancel } = new CancelablePromise(resolve =>
    setTimeout(resolve, 1000),
  )

  const started = Date.now()
  setTimeout(() => cancel({ immediate: false }), 500)

  return promise()
    .catch(() => {})
    .then(() => t.true(Date.now() - started > 1000))
})
