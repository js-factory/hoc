/**
 * It's a higher order component provides a wrapper around given preact component `InnerComponent`
 */

import { h, Component } from 'preact';
import getProps from '../util/getProps';
import bindHandler from '../util/bindHandler';

const isObject = (target) => (Object.prototype.toString.call(target) === '[object Object]');
let store = {};
let storeActivated = false;

function profile(...rest) {
    const id = rest.id;
    return function decorator(target, key, descriptor) {
        const fn = descriptor.value;

        return {
            ...descriptor,
            value() {
                console.time(id || key);  // eslint-disable-line
                fn.apply(this, rest);
                console.timeEnd(id || key); // eslint-disable-line
            }
        };
    };
}

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
        state,
        template,
        instanceProps,
        componentDidMount,
        componentWillUnmount,
        ...otherHooksAndHandlers
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
                // Attach handlers
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

                this.mergeProps = () => ({
                    ...this,
                    ...props,
                    setState,
                    getState,
                    ...globalState
                });

                otherHooksAndHandlers && Object.keys(otherHooksAndHandlers).map((key) => {
                    const fn = otherHooksAndHandlers[key];
                    if (typeof fn === 'function') {
                        this[key] = this.proxy(fn, this, key);
                    }
                });

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

                this.render = (props) => {
                    const view = template || templates || InnerComponent;
                    return h(view, this.mergeProps());
                };
            }
            proxy(func, context, key) {
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
