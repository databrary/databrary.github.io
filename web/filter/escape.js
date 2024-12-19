'use strict';

app.filter('escape', [
  '$sce', '$sanitize',
  function ($sce, $sanitize) {
    return function (input) {
      return $sce.trustAsHtml($sanitize(input));
    };
  }
]);
