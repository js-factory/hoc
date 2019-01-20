import { Component } from '@js-factory/hoc';
import ExampleTmpl from './ExampleTmpl';

@Component({
    componentWillMount({ state }) {
        console.log('before render', state.x);
    },
    componentDidMount({ state }) {
        console.log('after Render', state.x);
    },
    componentDidUpdate({ state }) {
        console.log('after Update', state.x);
    },
    state: {
        z: 100,
        x: 1
    },
    instanceProps: {
        z: 100,
        y: 1
    },
    sayHello({ state }, name, date) {
        const { x } = state;
        console.log(`x - ${x}`);
        console.log(`Hello ${name} : ${date}`);
    },
    onClickHandler(props, e) {
        e.preventDefault();
        const {
            getState,
            onClickAction,
            setState,
            getInstanceProps,
            setInstanceProps,
            sayHello
        } = props
        const { y } = getInstanceProps();
        const { x } = getState();
        setInstanceProps({ y: y + 1 });
        setState({ x: x + 1 });
        sayHello('Foo', Date.now());
    },
    template: ExampleTmpl
})
export default class ExamplePage { }
