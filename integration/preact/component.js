/**
 * It's a higher order component provides a wrapper around given preact component `InnerComponent`
 */

import { h, Component } from 'preact';
import getProps from '../util/getProps';
import bindHandler from '../util/bindHandler';

const isObject = (target) => (Object.prototype.toString.call(target) === '[object Object]');
let store = {};
let storeActivated = false;

function attachInstanceProps(instanceProps) {
    this.instanceProps = instanceProps || {};
    this.getInstanceProps = () => this.instanceProps;
    this.setInstanceProps = (newVal) => {
        if (!isObject(newVal)) {
            return {};
        }
        const currentVal = this.instanceProps;
        return (this.instanceProps = { ...currentVal, ...newVal });
    };
}

export default function component(options = {}) {
    const {
        hooks,
        state,
        handlers,
        template,
        instanceProps
    } = options;
    let { actions, watcher } = options;
    return function wrapper(InnerComponent) {
        return class Wrapper extends Component {
            constructor(props, context = {}) {
                super(props, context);
                const setState = (newState) => this.setState({ ...newState });
                const getState = () => this.state;
                this.__store__ = Wrapper.__store__;

                if (this.__store__) {
                    watcher = this.__store__.watcher;
                    actions = this.__store__.actions;
                }
                this.state = state || {};
                this.handlers = { setState, getState };
                // Attach handlers
                bindHandler.call(this, handlers, this.proxy);
                bindHandler.call(this, actions, store.action);
                attachInstanceProps.call(this, instanceProps);

                let globalState = this.__store__ ? getProps(watcher)(store ? store.getState() : {}, props) : {};
                const updateStore = () => {
                    if (!this.__store__) {
                        return;
                    }
                    let localState = getProps(watcher)(store ? store.getState() : {}, this.props);
                    // if store value does change, do not call update
                    for (let i in localState) if (localState[i] !== globalState[i]) {
                        globalState = localState;
                        return this.setState(null);
                    }
                    // if above condition fails & store contains additional props
                    // update & cause re-render
                    for (let i in globalState) if (!(i in localState)) {
                        globalState = localState;
                        return this.setState(null);
                    }
                };

                this.mergeProps = () => {
                    const { state, handlers, instanceProps, getInstanceProps, setInstanceProps } = this;
                    return {
                        state,
                        ...props,
                        ...handlers,
                        ...globalState,
                        instanceProps,
                        getInstanceProps,
                        setInstanceProps
                    };
                }
                if (hooks) {
                    const { componentDidMount, componentWillUnmount, ...other } = hooks;
                    other && Object.keys(other).map(key => (this[key] = this.proxy(other[key], this)));
                    componentDidMount && (this.componentDidMount = () => {
                        componentDidMount.call(null, this.mergeProps());
                        if (this.__store__) {
                            store.subscribe(updateStore);
                        }
                    })
                    componentWillUnmount && (this.componentWillUnmount = () => {
                        componentWillUnmount.call(null, this.mergeProps());
                        if (this.__store__) {
                            store.unsubscribe(updateStore);
                        }
                    })
                }
                this.render = (props) => {
                    const view = template || templates || InnerComponent;
                    return h(view, this.mergeProps());
                };
            }
            proxy(func, context) {
                return func && function hook() {
                    const { __store__ } = this;
                    let globalState = __store__ ? getProps(watcher)(store ? store.getState() : {}) : {};
                    func.apply(null, [this.mergeProps(), ...arguments]);
                }.bind(context);
            }
        };
    };
}

export function injectStore(appStore) {
    store = appStore;
    storeActivated = true;
}
