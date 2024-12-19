'use strict';

app.config([
  '$provide', function ($provide) {
    $provide.decorator('$cacheFactory', [
      '$delegate', function ($delegate) {

        $delegate.removeAll = function () {
          var info = $delegate.info();

          for (var key in info) {
            if (info.hasOwnProperty(key) && key !== 'templates') {
              $delegate.get(key).removeAll();
            }
          }
        };

        return $delegate;
      }
    ]);
  }
]);
