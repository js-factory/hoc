import { h } from 'preact';

const ExampleTmpl = (props) => {
    const { state, onClickHandler, instanceProps } = props;
    console.log('state', state);
    console.log('instance prop', instanceProps);
    const { x } = state;
    return (
        <div>
            <h1>Example Page</h1>
            <button onClick={onClickHandler}>Increment</button>
            <p>state - {x}</p>
            <p>ip - {instanceProps.y}</p>
        </div>
    );
};

export default ExampleTmpl;
