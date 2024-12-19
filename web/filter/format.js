'use strict';

app.filter('format', [
  '$sce', '$sanitize',
  function ($sce, $sanitize) {
    return function (input) {
      if (input === undefined || input === null)
        return '';

      return $sce.trustAsHtml('<p>' + $sanitize(input).replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>') + '</p>');
    };
  }
]);
