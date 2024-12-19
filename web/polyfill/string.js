'use strict';

if (!String.prototype.startsWith) {
  Object.defineProperty(String.prototype, 'startsWith', {
    value: function (searchString, position) {
      position = position || 0;
      return this.lastIndexOf(searchString, position) === position;
    }
  });
}

if (!String.prototype.endsWith) {
  Object.defineProperty(String.prototype, 'endsWith', {
    value: function (searchString, position) {
      if (position === undefined || position > this.length)
        position = this.length;
      position -= searchString.length;
      return position >= 0 && this.indexOf(searchString, position) === position;
    }
  });
}

if (!String.prototype.includes) {
  Object.defineProperty(String.prototype, 'includes', {
    value: function () {
      return this.indexOf.apply(this, arguments) !== -1;
    }
  });
}
