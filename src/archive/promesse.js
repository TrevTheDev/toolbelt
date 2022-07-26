import { curriedRunFunctionOnlyOnce } from '.';
const maybeThenable = (value) => value && (typeof value === 'object' || typeof value === 'function');
const wrapInNewDeferred = (fn) => {
    const d = deferred();
    setImmediate(fn, d);
    return d.promise;
};
const deferred = () => {
    let handlers = [];
    let state = 'pending';
    let value;
    const justOneTime = curriedRunFunctionOnlyOnce();
    const settle = () => {
        if (state !== 'pending') {
            handlers.forEach((handler) => {
                const hand = handler.propagateOutput;
                try {
                    if (typeof handler.transformInput[state] === 'function') {
                        const transformedValue = handler.transformInput[state](value);
                        if (transformedValue === handler.promise)
                            hand.rejected(new TypeError('A promise cannot be chained to itself.'));
                        else
                            hand.resolved(transformedValue);
                    }
                    else
                        hand[state](value);
                }
                catch (e) {
                    hand.rejected(e);
                }
            });
            handlers = [];
        }
    };
    const setState = (newState) => (result) => {
        state = newState;
        value = result;
        setImmediate(settle);
    };
    const setStateEventually = (newState) => (result) => {
        const oneTime = curriedRunFunctionOnlyOnce();
        try {
            if (maybeThenable(result)) {
                const { then } = result;
                if (typeof then === 'function') {
                    then.call(result, oneTime(setStateEventually('resolved')), oneTime(setState('rejected')));
                }
                else
                    setState(newState)(result);
            }
            else
                setState(newState)(result);
        }
        catch (e) {
            oneTime(setState('rejected'))(e);
        }
    };
    return {
        resolve: justOneTime(setStateEventually('resolved')),
        reject: justOneTime(setState('rejected')),
        promise: {
            then: (resolved, rejected) => wrapInNewDeferred((d) => {
                handlers.push({
                    transformInput: { resolved, rejected },
                    propagateOutput: { resolved: d.resolve, rejected: d.reject },
                    promise: d.promise,
                });
                settle();
            }),
        },
    };
};
const Promesse = {
    resolved: (value) => wrapInNewDeferred((d) => d.resolve(value)),
    rejected: (value) => wrapInNewDeferred((d) => d.reject(value)),
    deferred,
};
export default Promesse;
