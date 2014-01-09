var EventEmitter = require('events').EventEmitter;
var locks = {};

function lock(key, callback) {
  /* Function to acquire a lock and invoke the callback */
  function acquire() {
    locks[key] = new EventEmitter();
    callback(unlock(key));
  }

  if (locks[key] && !locks[key].released) {
    /* This key has been locked, set an event listener */
    locks[key].on('free', function () {
      acquire();
    });
  } else {
    /* The lock has been released, acquire one ourselves */
    acquire();
  }
}

/**
 * Returns a function that, when invoked, unlocks the key.
 */
function unlock(key) {
  return function () {
    locks[key].emit('free');
    /* Set `released` to true so someone who comes along later can use it */
    locks[key].released = true;
  };
}

module.exports = lock;
