'use strict';

app.filter('toArray', [
  'pageService', function (page) {
    return function (input, expression, reverse) {
      if (!angular.isObject(input)) {
        return [input];
      }

      var output = [];
      if (Array.isArray(input))
        output = input;
      else _.each(input, function (item, key) {
        if (key != '$promise' && key != '$resolved') {
          item.key = key;
          output.push(item);
        }
      });

      if (angular.isDefined(expression)) {
        output = page.$filter('orderBy')(output, expression, reverse);
      }

      return output;
    };
  }
]);
