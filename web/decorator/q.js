'use strict';

app.config([
  '$provide', function ($provide) {
    $provide.decorator('$q', [
      '$delegate', function ($q) {
        $q.successful = function (v) {
          var p = $q.defer();
          p.resolve(v);
          return p.promise;
        };

        return $q;
      }
    ]);
  }
]);
