'use strict';

app.factory('$exceptionHandler', [
  '$log', 'analyticService',
  function ($log, analytics) {
    return function (exception, cause) {
      $log.error.apply($log, arguments);
      if (DEBUG)
        throw exception;
      else {
        var data = {error: {name: exception.name, message: exception.message}};
        if (cause)
          data.cause = cause;
        analytics.add('attempt', data);
      }
    };
  }
]);
