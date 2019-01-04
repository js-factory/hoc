/**
 * It's a higher order component provides a wrapper around given preact component `InnerComponent`
 */

import { h, Component } from 'preact';
import getProps from '../util/getProps';
import bindHandler from '../util/bindHandler';


/**
 * @description
 * This function creates a new object to handle instance properties
 * @param {*} instanceProps - Instance Properties to be passed as props
 */
function attachInstanceProps(instanceProps) {
    if (Object.prototype.toString.call(instanceProps) !== '[object Object]') {
        return {};
    }
    let localProps = instanceProps;
    return {
        getInstanceProps() {
            return localProps;
        },
        setInstanceProps(newProps) {
            localProps = {
                ...localProps,
                ...newProps
            };
        }
    }
};

function exec(fn, ...rest) {
    return fn && fn.apply(this, rest);
}

function hasWatches(watcher) {
    return storeActivated && watcher.length;
}

let store = {};
let storeActivated = false;

export default function component(options = {}) {
    const {
        state,
        template,
        templates,
        afterRender,
        afterUpdate,
        beforeRender,
        beforeUpdate,
        beforeUnmount,
        eventHandlers,
        instanceProps
    } = options;
    let { actions, watcher } = options;
    return function wrapper(InnerComponent) {
        return class Wrapper extends Component {
            constructor(props, context = {}) {
                super(props, context);
                const { actions: storeActions, watcher: storeWatcher = [] } = props;
                const setState = (props) => this.setState({ ...props });
                watcher = storeWatcher || watcher;
                actions = storeActions || actions;
                this.state = state || {};
                this.handlers = { setState };
                this.storeAttached = hasWatches(watcher);

                // Attach handlers
                bindHandler.call(this, eventHandlers, this.bindLifecycleHandlers);
                bindHandler.call(this, actions, store.action);

                // Bind lifecycle methods
                beforeRender && (this.componentWillMount = this.bindLifecycleHandlers(beforeRender, this));
                beforeUpdate && (this.componentWillUpdate = this.bindLifecycleHandlers(beforeUpdate, this));
                afterUpdate && (this.componentDidUpdate = this.bindLifecycleHandlers(afterUpdate, this));
                instanceProps && (this.instanceProps = attachInstanceProps(instanceProps));

                let globalState = this.storeAttached ? getProps(watcher)(store ? store.getState() : {}, props) : {};
                const updateStore = () => {
                    if (!this.storeAttached) {
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
                    const { state, handlers, instanceProps } = this;
                    return {
                        ...state,
                        ...props,
                        ...globalState,
                        ...handlers,
                        ...instanceProps
                    };
                }

                this.componentDidMount = () => {
                    exec.call(this, afterRender, this.mergeProps());
                    if (this.storeAttached) {
                        store.subscribe(updateStore);
                    }
                }

                this.componentWillUnmount = () => {
                    exec.call(this, beforeUnmount, this.mergeProps());
                    if (this.storeAttached) {
                        store.unsubscribe(updateStore);
                    }
                }

                this.render = (props) => {
                    const view = template || templates || InnerComponent;
                    return h(view, this.mergeProps());
                };
            }
            bindLifecycleHandlers(func, context) {
                return func && function () {
                    const { state, props, handlers, instanceProps, storeAttached } = this;
                    let globalState = storeAttached ? getProps(watcher)(store ? store.getState() : {}) : {};
                    func.apply(null, [{ ...state, ...props, ...instanceProps, ...handlers, ...globalState }, ...arguments]);
                }.bind(context);
            }
        };
    };
}

export function injectStore(appStore) {
    store = appStore;
    storeActivated = true;
}

