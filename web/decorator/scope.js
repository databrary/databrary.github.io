'use strict';

app.config([
  '$provide', function ($provide) {
    $provide.decorator('$rootScope', [
      '$delegate', function ($rootScope) {
        var Scope = Object.getPrototypeOf($rootScope);
        Scope.$lift = function (f) {
          var scope = this;
          return function (/*...*/) {
            var args = Array.prototype.slice.call(arguments);
            args.unshift(this);
            scope.$apply(f.bind.apply(f, args));
          };
        };

        return $rootScope;
      }
    ]);
  }
]);
