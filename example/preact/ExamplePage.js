import { h } from 'preact';
import component from '@js-factory/hoc/preact/component';

@component({
    beforeRender() {
        console.log('before render');
    },
    afterRender({ sayHello }) {
        console.log('afterRender');
    },
    state: {
        x: 1,
    },
    instanceProps: {
        y: 1
    },
    eventHandlers: {
        onClickHandler({ x, onClickAction, setState, getInstanceProps, setInstanceProps }) {
            const { y } = getInstanceProps();
            setInstanceProps({ y: y + 1 });
            setState({ x: x + 1 });
        }
    },
    template: (props) => {
        const { x, onClickHandler, getInstanceProps, state } = props;
        console.log('state', x);
        console.log('instance prop', getInstanceProps())
        return (
            <div>
            <h1>Example Page</h1>
                <button onClick={onClickHandler}>Increment</button>
                <p>state - {x}</p>
                <p>ip - {getInstanceProps().y}</p>
            </div>
        );
    }
})
export default class ExamplePage { }
