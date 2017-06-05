'use strict';
const queue = require('./');
const chai = require('chai');
const expect = chai.expect;

describe('behavior', function() {
  // the example worker
  const worker = queue.async.asyncify(function(work) {
    return new Promise(resolve => {
      work.cb();
      setTimeout(resolve, work.duration);
    });
  });

  it('handles the run away work problem (all fail)', function() {
    let one, two, three, four = false;
    const thrownError = new Error('some error');
    // the work
    const work = [
      {
        cb() {
          one = true;
          throw thrownError;
        },
        file:'/path-1',
        duration: 0
      },
      {
        cb() {
          two = true;
          throw thrownError;
        },
        file:'/path-2',
        duration: 0
      },
      {
        cb() {
          three = true;
          throw thrownError;
        },
        file:'/path-3',
        duration: 0
      },

      {
        cb() {
          four = true;
        },
        file:'/path-4',
        duration: 0
      },
    ];

    // calling our queue helper
    return queue(worker, work, 3)
      .then(value  => expect(true).to.eql(false), // should never get here
        reason => expect(reason).to.eql(thrownError))
      .then(() => {
        // assert the work we expect to be done is done, but nothing more
        expect(one, 'first job should have executed').to.eql(true);
        expect(two, 'second job should have executed').to.eql(true);
        expect(three, 'third job should have executed').to.eql(true);
        expect(four, 'fourth job should have executed').to.eql(false);
      });
  });

  it('handles the run away work problem', function() {

    let one, two, three, four = false;
    const thrownError = new Error('some error');
    // the work
    const work = [
      {
        cb() {
          one = true;
        },
        file:'/path-1',
        duration: 50
      },
      {
        cb() {
          two = true;
          throw thrownError;
        },
        file:'/path-2',
        duration: 0
      },
      {
        cb() {
          three = true;
        },
        file:'/path-3',
        duration: 0
      },

      {
        cb() {
          four = true;
        },
        file:'/path-4',
        duration: 50
      },
    ];

    // calling our queue helper
    return queue(worker, work, 3)
      .then(value  => expect(true).to.eql(false), // should never get here
        reason => expect(reason).to.eql(thrownError))
      .then(() => {
        // assert the work we expect to be done is done, but nothing more
        expect(one, 'first job should have executed').to.eql(true);
        expect(two, 'second job should have executed').to.eql(true);
        expect(three, 'third job should have executed').to.eql(true);
        expect(four, 'fourth job should have executed').to.eql(false);
      });
  });

  it('works correctly when everything is wonderful', function() {
    // the example worker
    let one, two, three, four = false;

    // the work
    const work = [
      {
        cb() {
          one = true;
        },
        file: '/path-1',
        duration: 50
      },
      {
        cb() {
          two = true;
        },
        file: '/path-2',
        duration: 0
      },
      {
        cb() {
          three = true;
        },
        file: '/path-3',
        duration: 0
      },
      {
        cb() {
          four = true;
        },
        file: '/path-4',
        duration: 50
      },
    ];

    // calling our queue helper
    return queue(worker, work, 3)
      .then(value  => expect(value).to.eql(undefined))
      .then(() => {
        // assert the work we expect to be done is done, but nothing more
        expect(one,   'first job should have executed').to.eql(true);
        expect(two,   'second job should have executed').to.eql(true);
        expect(three, 'third job should have executed').to.eql(true);
        expect(four,  'fourth job should have executed').to.eql(true);
      });
  });
});
