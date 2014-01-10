var EventEmitter = require('events').EventEmitter;
var locks = {};

function lock(key, callback) {
  if (locks[key] && !locks[key].released) {
    /* This key has been locked, set an event listener to retry */
    locks[key].on('free', function () {
      lock(key, callback);
    });
  } else {
    /* The lock has been released, acquire one ourselves */
    locks[key] = new EventEmitter();
    callback(unlock(key));
  }
}

/**
 * Returns a function that, when invoked, unlocks the key.
 */
function unlock(key) {
  return function () {
    /* Set `released` to true and emit a "free" event */
    locks[key].released = true;
    locks[key].emit('free');
  };
}

module.exports = lock;
