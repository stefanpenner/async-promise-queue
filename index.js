'use strict';

// helper function that promisifies the queue
module.exports = function queue(worker, work, concurrency) {
  return new Promise((resolve, reject) => {
    let q = require('async').queue(worker, concurrency);
    let firstError;
    q.drain = resolve;
    q.error = function(error) {
      if (firstError === undefined) {
        // only reject with the first error;
        firstError = error;
      }

      // don't start any new work
      q.kill();

      // but wait until all pending work completes before reporting
      q.drain = function() {
        reject(firstError);
      };

    };
    q.push(work);
  });
};

Object.defineProperty(module.exports, 'async', {
  get() {
    return require('async');
  }
});
