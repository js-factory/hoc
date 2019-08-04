# hoc

hoc provides a simple APIs to create reusable javascript components. It provides an abstraction from the underlying library use to manage these components. The abstraction enables teams to reuse the same components with different libraries with minimum code changes.

## Installation

```
npm i -S @js-factory/hoc
```

## Motivation
Modern frontend applications are getting complex every day. It has to manage core business logic, complex layouts, and data. It becomes necessary that frontend application architecture follows core software design principles.

In [computer science](https://en.wikipedia.org/wiki/Computer_science), separation of concerns (SoC) is a design principle for separating a computer program into distinct sections, such that each section addresses a separate [concern](https://en.wikipedia.org/wiki/Concern_%28computer_science%29).

`hoc` prefers [functional programming](https://en.wikipedia.org/wiki/Functional_programming) and allows programmers to write small functions. These functions follow [single responsibility principle](https://en.wikipedia.org/wiki/Single_responsibility_principle) and do just one thing and produce predictable output.


## Getting Started

```js
// ExampleComponent.js

import { Component } from '@js-factory/hoc';
import componentDidMount from './hooks/afterRender';
import componentShouldUpdate from './hooks/afterUpdate';
import componentWillMount from './hooks/beforeRender';
import componentWillUpdate from './hooks/beforeUpdate';
import componentWillUnmount from './hooks/beforeUnmount';
import onClickHandler from './handlers/onClickHanlder';
import onScrollHandler from './handlers/onScrollHanlder';
import ExampleComponentTmpl from './templates/ExampleComponentTmpl';

const state = {
   salutation: 'Dear'
};

const instanceProps = {
   counter: 0
};

@Component({
   state,
   instanceProp,
   componentDidMount,
   componentWillMount,
   componentWillUpdate,
   componentWillUnmount,
   componentShouldUpdate,
   onClickHanlder,
   onScrollHanlder,
   template: ExampleComponentTmpl
})
export default class ExampleComponent {}
```

```js
// ExampleComponentTmpl.js
// This is preact functional component

import { h } from 'preact';

const ExampleComponentTmpl = (props) => {
   const { state, instanceProp, onClickHander } = props;
   const { salutation } = state;
   return(
       <div>
           <p> {salutation} user! </p>
           <button onClick={onClickHander}>Say Hello </button>
       </div>
   );
}
```

## Overview
`HOC` offers four major components e.g. `state`, `template`, `instanceProps`, `methods`.

### state
The state is a plain JavaScript object that represents your component local state. Please read about [React state](https://reactjs.org/docs/state-and-lifecycle.html) if you are not aware of what a component state is all about. `hoc` exposes it's own `setState` to update component state.

```js
const state = {
   ...
   count: 0,
   ...
};

const increment = ({ state, setState }) => {
   const { count } = state;
   return setState({
       count: count + 1
   });
};
```

### instanceProps
The instanceProps are the same as *state*, unlike the state, any update to instanceProps will not trigger component re-rendering. You can update instanceProps using `setInstanceProps` method.

```js
const instanceProps = {
   ...
   count: 0,
   ...
};

const increment = ({ instanceProps, setInstanceProps }) => {
   const { count } = instanceProps;
   return setInstanceProps({
       count: count + 1
   });
};

```

### template
A template is functional component represents presentation layer.

### Pure JavaScript Functions
You can add as many functions as you need to manage your component state and handle user interactions. These methods could be lifecycle hooks of underlying framework like componentDidMount, componentWillUpdate or simple event handlers.

#### life cycle hooks
hoc allows developers to use underlying library hooks like componentDidMount, componentWillMount etc. Please refer above component definition.

**Note:** Unlike react or preact you will not have access to `this`. `hoc` will inject all component properties and methods in run time.


#### event handlers
You can define any dom event handler and bind it to the component. Event handlers are plain javascript functions and surely not tightly coupled with any underlying library.

```js
const onClickHandler = (props, e) => {
 e.preventDefault();
 const { state, setState, getInstanceProp } = props;
 return setState({
   updateMsg: 'I am updated'
 });
}
```

**props** contains component state, methods etc.
**e** is a dom event instance.

#### Other methods
Usually, any component has a lot of helper methods. You can define these methods as part of a component definition.

```js
function foo(props, ...args){
   // function body goes here
}
```

**props** contains component state, methods etc.
**args** are runtime arguments supplied
