'use strict';

app.filter('truncate', [
  function () {
    return function (text, max) {
      if (!text) {
        return text;
      }

      max = parseInt(max, 10);
      if (isNaN(max))
        max = 10;

      if (text.length <= max)
        return text;

      var p = text.lastIndexOf(' ', max);
      if (p <= max/2)
        p = max;
      return text.substr(0, p) + '...';
    };
  }
]);
