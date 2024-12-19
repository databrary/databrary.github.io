'use strict';

if (!Array.isArray) {
  Array.isArray = function (a) {
    return Object.prototype.toString.call(a) === '[object Array]';
  };
}

/* These are purposefully not as robust as it ought to be, since we don't need it to be. */
if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    value: function (predicate, scope) {
      for (var i = 0, l = this.length; i < l; i ++)
        if (predicate.call(scope, this[i], i, this))
          return this[i];
      return undefined;
    }
  });
}

if (!Array.prototype.findIndex) {
  Object.defineProperty(Array.prototype, 'findIndex', {
    value: function (predicate, scope) {
      for (var i = 0, l = this.length; i < l; i ++)
        if (predicate.call(scope, this[i], i, this))
          return i;
      return -1;
    }
  });
}

if (!Array.prototype.includes) {
  Object.defineProperty(Array.prototype, 'includes', {
    value: function () {
      return this.indexOf.apply(this, arguments) !== -1;
    }
  });
}

/* This is non-standard, but useful. */
Object.defineProperty(Array.prototype, 'remove', {
  value: function (value) {
    var i = this.indexOf(value);
    if (i === -1)
      return;
    return this.splice(i, 1)[0];
  }
});
