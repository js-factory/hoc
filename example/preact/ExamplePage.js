import { h } from 'preact';
import { withPreact as component } from '@js-factory/hoc';

@component({
    hooks: {
        componentWillMount() {
            console.log('before render');
        },
        componentDidMount({ sayHello }) {
            console.log('afterRender');
        }
    },
    state: {
        x: 1,
    },
    instanceProps: {
        y: 1
    },
    eventHandlers: {
        onClickHandler({ getState, onClickAction, setState, getInstanceProps, setInstanceProps }) {
            const { y } = getInstanceProps();
            const { x } = getState();
            setInstanceProps({ y: y + 1 });
            setState({ x: x + 1 });
        }
    },
    template: (props) => {
        const { getState, onClickHandler, getInstanceProps, state } = props;
        console.log('state', getState());
        console.log('instance prop', getInstanceProps())
        const { x } = getState();
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
