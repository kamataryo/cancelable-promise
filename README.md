# @kamataryo/cancelable-promise

[![Build Status](https://travis-ci.org/kamataryo/cancelable-promise.svg?branch=master)](https://travis-ci.org/kamataryo/cancelable-promise)

Cancelable Promise enables you to handle and prevent memory leak with remaining React `setState` after component unmounting.

## install

```shell
$ yarn add @kamataryo/cancelable-promise
# or $ npm install @kamataryo/cancelable-promise
```

### Yarn alias

[detail](https://yarnpkg.com/lang/en/docs/cli/add/#toc-yarn-add-alias)

```shell
$ yarn add cancelable-promise@npm:@kamataryo/cancelable-promise
```

## Usage with React

```javascript
import React from 'react'
import { makeCancelable } from '@kamataryo/cancelable-promise'
const noop = x => x

class MyComponent extends React.Component {
  state = { data: [], status: '', cancel: noop }

  /**
   * componentWillUnmount
   * @return {void}
   */
  componentWillUnmount() {
    this.state.cancel()
  }

  onClick = () => {
    const { promise, cancel } = makeCancelable(
      fetch('https://example.com/data.json')
        .then(res => {
          if (res.ok) {
            return res.json()
          } else {
            throw 'error'
          }
        })
        .catch(() => this.setState({ status: 'failure' })),
    )
    this.setState({ cancel, status: 'requesting' })

    promise()
      // if `cancel` has been called this `then` callback will never called.
      .then(data => this.setState({ data, status: 'success' }))
      // and this `catch` callback is called.
      .catch(({ isCanceled }) => console.log('canceled'))
  }

  /**
   * render
   * @return {ReactElement|null|false} render a React element.
   */
  render() {
    const { data, status } = this.state
    return (
      <div>
        <button onClick={this.onClick}>{'request'}</button>
        {status === 'failure' && 'error!'}
        <ul>
          {data.map(({ id, name }) => (
            <li key={id}>{name}</li>
          ))}
        </ul>
      </div>
    )
  }
}
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
// canceled! (500ms)
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
// canceled! (500ms)
```

### cancel options

`immediate:bool` option invokes `reject` immediately as `cancel` called.

```javascript
import { makeCancelable } from '@kamataryo/cancelable-promise'
const timeout = new Promise(resolve => setTimeout(resolve, 10000))
const { promise, cancel } = makeCancelable(timeout)

promise()
  .then(() => console.log('timeout!'))
  .catch(err => console.log(err.isCanceled ? 'canceled!' : 'unknown error'))
cancel({ immediate: true })
// canceled! (immediately)
```

## development

```shell
$ git clone git@github.com:kamataryo/cancelable-promise.git
$ cd cancelable-promise
$ yarn # or $ npm install
$ npm test
```

## Deploy

deploy from travis on tags.

```shell
$ npm version [patch/minor/major]
$ git push origin v0.0.0 # specify version
```
