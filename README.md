# @kamataryo/cancelable-promise

[![Build Status](https://travis-ci.org/kamataryo/cancelable-promise.svg?branch=master)](https://travis-ci.org/kamataryo/cancelable-promise)

Cancelable Promise. Prevent memory leak when ComponentWillUnmount.

## install

```shell
$ yarn add @kamataryo/cancelable-promise
# or
$ npm install @kamataryo/cancelable-promise
```

## APIs

### class

```javascript
import CancelablePromise from '@kamataryo/cancelable-promise'
const { promise, cancel } = new CancelablePromise(resolve =>
  setTimeout(resolve, 500),
)

promise()
  .then(() => console.log('timeout!'))
  .catch(err => console.log(err.isCanceled ? 'canceled!' : 'unknown error'))
cancel()
```

### decorator

```javascript
import { makeCancelable } from '@kamataryo/cancelable-promise'
const timeout = new Promise(resolve => setTimeout(resolve, 500))
const { promise, cancel } = makeCancelable(timeout)

promise()
  .then(() => console.log('timeout!'))
  .catch(err => console.log(err.isCanceled ? 'canceled!' : 'unknown error'))
cancel()
```
