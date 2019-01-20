/**
 * It's a higher order component provides a wrapper around given preact component `InnerComponent`
 */

import React from 'react';
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
        state,
        template,
        instanceProps,
        componentDidMount,
        componentWillUnmount,
        ...otherHooksAndHandlers
    } = options;
    let { actions, watcher } = options;
    return function wrapper(InnerComponent) {
        return class Wrapper extends React.Component {
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
                    const View = template || templates || InnerComponent;
                    return <View {...this.mergeProps()} />;
                };
            }
            proxy(func, context, key) {
                return func && function hook() {
                    console.time(key);
                    const { __store__ } = this;
                    let globalState = __store__ ? getProps(watcher)(store ? store.getState() : {}) : {};
                    func.apply(null, [this.mergeProps(), ...arguments]);
                    console.timeEnd(key);
                }.bind(context);
            }
        };
    };
}

export function injectStore(appStore) {
    store = appStore;
    storeActivated = true;
}
