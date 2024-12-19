'use strict';

app.filter('timecode', [
  'Offset',
  function (Offset) {
    return function (input, showMilli) {
      return Offset.format(input, !showMilli);
    };
  }
]);
