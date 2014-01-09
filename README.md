## alock

Arbitrary locking mechanism for asynchronous operations

### About

    npm install alock

This module is an event-based approach to locking asynchronous operations.
Locks are established and freed on a key-by-key basis and are passed two
arguments: a key to uniquely identify the operation you want to lock, and a
callback.

This callback should accept a function – `done()` – which, when invoked, frees
the lock.

Let's give it a whirl.

### Usage

```javascript
var lock = require('alock');

lock("console-log", function (done) {
  setTimeout(function () {
    console.log('First!');
    done();
  }, 1000);
});

lock("console-log", function (done) {
  setImmediate(function () {
    console.log('Second!');
    done();
  });
});
```

Without locking, the above example would normally print "Second!" followed by
"First!" a second later. Instead, we see a 1-second delay, followed by both
"First!" and "Second!" displaying in quick succession.

**alock** can be used to simulate atomic operations on virtually anything.
Consider the following example: We want to fetch some serialized object from
a key-value store, change one of its properties, and place it back. If two of
these operations are called in quick succession, one of the operations may
receive an outdated copy of this object because of a
[race condition](http://en.wikipedia.org/wiki/Race_condition). Instead, let's
lock the operation to prevent such a data hazard.

```javascript
lock("double-score", function (done) {
  db.get('player1', function (err, value) {
    value = JSON.parse(value);
    value.score *= 2;
    db.put('player1', JSON.stringify(value), function (err) {
      done();
    });
  });
});
```

### How it Works

**alock** uses node's built-in `EventEmitter` class at its core. The internal
locks object holds EventEmitter instances, each responsible for emitting a
"free" event when the operation has completed.

When `lock()` is called, the library checks to see if the key already has a lock
on it – that is – that the internal locks object holds the key. If such a
lock already exists, we create an event listener for the "free" event to then
acquire the lock ourselves.

To acquire a lock means to assign a new EventEmitter instance to the key in
the internal locks object, then invoke the callback originally passed to us.

[The source is around 30 lines](https://github.com/jdan/alock/blob/master/index.js),
so be sure to check it out for yourself.

### License

MIT
