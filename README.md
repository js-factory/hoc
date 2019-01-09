# hoc 

hoc provide a simple apis to create javascript reusable components. It provide an abstraction from underlying framework, helps reuse the same component for different libraries with minimum code changes. 

# Install

```
npm i -S @js-factory/hoc 
```

# features!
  - Allow you to maximize vanilla javascript use
  - Promotes function programming by exposting functions/methods outside the class

```js
// ExampleComponent.js

import { withPreact as component } from '@js-factory/hoc';
import componentDidMount from './hooks/afterRender';
import componentShouldUpdate from './hooks/afterUpdate';
import componentWillMount from './hooks/beforeRender';
import componentWillUpdate from './hooks/beforeUpdate';
import componentWillUnmount from './hooks/beforeUnmount';
import onClickHanlder from './handlers/onClickHanlder';
import onScrollHanlder from './handlers/onScrollHanlder';
import ExampleComponentTmpl from './templates/ExampleComponentTmpl';

const state = {
    salutation: 'Dear'
};

const instanceProps = {
    counter: 0
};

@component({
    state,
    instanceProp,
    hooks: {
        componentDidMount,
        componentWillMount,
        componentWillUpdate,
        componentWillUnmount,
         componentShouldUpdate
    },
    eventHandler: {
        onClickHanlder,
        onScrollHanlder
    },
    template: ExampleComponentTmpl
})
export default class ExampleComponent {}
```
```js
// ExampleComponentTmpl.js
// This is preact functional component

import {h} from 'preact';

const ExampleComponentTmpl = (props) => {
    const { getState, onClickHander } = props;
    const {salutation} = getState();
    return(
        <div>
            <p> {salutation} customer! </p>
            <button onClick={onClickHander}>Say Hello </button>
        </div>
    );
}
```

### state
**state** is component local state. It can be modified with `setState` function. Every call to `setState` will cause component re-rending. In case you do not want render the component every time state changes, please use instanceProp.

In order to access application state you need to use `getState` method.

### instanceProp
**instanceProp** is same as *state* but it offers its own getter `getInstanceProp` and setter `setInstanceProp`. instanceProp changes do not call `render`.

### hooks
hoc allows developer to use underlying library hooks like componentDidMount, componentWillMount etc. Please refer above component definition.

**Note:** Unlike react or preact you will not have access to `this`. You will get all the handlers, action, state as a props.


### eventHandler
**eventHandler** is a collection of dom event handlers i.e. click, scroll, mouseover etc. Event handlers are plain javascript functions and surely not tightely coupued with any underlying library.
```js
const onClickHandler = (props, e) => {
  e.preventDefault();
  const { getState, setState, getInstanceProp } = props;
  const state = getState();
  return setState({
    ...state,
    updateMsg: 'I am updated'
  });
}
```

### template
**template** represents presentation layer. Mostly it's html is going to rendered in the browser.
 
 
