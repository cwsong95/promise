const STATE = {
  PENDING: 'PENDING',
  FULFILLED: 'FULFILLED',
  REJECTED: 'REJECTED',
}

// one way I can check if passed in value is a promise by checking if it has .then method
const isThenable = maybePromise => maybePromise && typeof maybePromise.then === 'function';

class PromiseDemo {
  constructor(func) {
    this._state = STATE.PENDING;

    this._value = undefined;
    this._reason = undefined;

    this._thenQueue = [];
    this._finallyQueue = [];

    // begin running computation function
    if (typeof func === 'function') {
      try {
        // this function can create an error, so let's use try and catch block
        setTimeout(() => {
          func(
            this._resolve.bind(this),
            this._reject.bind(this)
          );
        })
      } catch (ex) {
        this._reject(ex);
      }
    }
  }

  // #3
  // first, is a function that transforms the value if the promise is fulfilled
  // second, is a function that transforms the value if the promise is rejected
  then(fulfilledFn, catchFn) {
    // this will give always in pending state because computation function is not passed in
    const controlledPromise = new PromiseDemo();
    this._thenQueue.push([controlledPromise, fulfilledFn, catchFn]);

    if(this._state === STATE.FULFILLED) {
      this._propagateResolved();
    } else if (this._state === STATE.REJECTED) {
      this._propagateRejected();
    }

    return controlledPromise;
  }

  // #6
  // first, is a function transforms a reason if a promise is rejected
  catch(catchFn) {
    return this.then(undefined, catchFn);
  }

  // #7
  finally(sideFn) {
    if (this._state !== STATE.PENDING) {
      sideFn();

      return this._state === STATE.FULFILLED
      ? PromiseDemo.resolve(this._value)
      : PromiseDemo.reject(this._reason)
    }

    const controlledPromise = new PromiseDemo();
    this._finallyQueue.push([controlledPromise, sideFn]);

    return controlledPromise;
  }

  // #4
  // goal of this method is to communicate with promises that we have in the queues
  _propagateResolved() {
    this._thenQueue.forEach(([controlledPromise,fulfilledFn]) => {
      if (typeof fulfilledFn === 'function') {
        const valueOrPromise = fulfilledFn(this._value);

        if (isThenable(valueOrPromise)) {
          // pass the result to controlledPromise
          valueOrPromise.then(
            value => controlledPromise._resolve(value),
            reason => controlledPromise._reject(reason)
          );
        } else {
          controlledPromise._resolve(valueOrPromise);
        }
      } else {
        // this is the case where fulfilledFn is not defined
        // then give controlledPromise the value of this promise 
        return controlledPromise._resolve(this._value);
      }
    });

    this._finallyQueue.forEach(([controlledPromise, sideFn]) => {
      sideFn();
      controlledPromise._resolve(this._value);
    })

    this._thenQueue = [];
    this._finallyQueue = [];
  }

  // #5
  _propagateRejected() {
    this._thenQueue.forEach(([controlledPromise, _, catchFn]) => {
      if (typeof catchFn === 'function') {
        const valueOrPromise = catchFn(this._reason);
        if (isThenable(valueOrPromise)) {
          valueOrPromise.then(
            value => controlledPromise._resolve(value),
            reason => controlledPromise._reject(reason)
          )
        } else {
          controlledPromise._resolve(valueOrPromise);
        }
      } else {
        return controlledPromise._reject(this._reason);
      }
    });

    this._finallyQueue.forEach(([controlledPromise, sideFn]) => {
      sideFn();
      controlledPromise._reject(this._value);
    })

    this._thenQueue = [];
    this._finallyQueue = [];
  }

  // #2
  _resolve(value) {
    if (this._state === STATE.PENDING) {
      this._state = STATE.FULFILLED;
      this._value = value;
      // the new logic that deals with communicating with the queues is going to be placed into a method called propagateResolved
      this._propagateResolved();
    }
  }

  _reject(reason) {
    if (this._state === STATE.PENDING) {
      this._state = STATE.REJECTED;
      this._value = reason;
      // the new logic that deals with communicating with the queues is going to be placed into a method called propagateRejected
      this._propagateRejected();
    }
  }

  static all(list) {
    let results = [];

    return new PromiseDemo((resolve, reject) => {
      // edge case where user is inputting empty array
      if (list.length === 0) {
        resolve([]);
      } else {
        list.forEach((promise, index) => {
          if (promise instanceof PromiseDemo) {
            promise.then((value) => {
              results[index] = value;
              if(results.length === list.length) {
                resolve(results);
              }
            }).catch(function (error) {
              reject(error);
            });
          } else {
            results[index] = promise;
          }
          if(results.length === list.length) {
            resolve(results);
          }
        });
      }
    });
  }
}

module.exports = PromiseDemo
