'use strict';

app.directive('hint', [
  'constantService', 'tooltipService',
  function (constants, tooltips) {
    var hints = {};

    _.each(constants.permission, function (a) {
      hints['permission-' + a] =
        constants.message('access.' + a, 'You');
    });

    _.each(constants.releases, function (a) {
      var r = constants.release[a];
      hints['release-' + r] =
        constants.message('release.' + r + '.title') + ': ' + constants.message('release.' + r + '.description');
    });

    _.each(constants.format, function (a) {
      hints['format-' + a.extension] =
        a.name;
    });

    _.each(['slot', 'globalrecord'], function (a) {
      hints['action-' + a] =
        constants.message('hint.action.' + a);
    });

    _.each(['up', 'null'], function (a) {
      hints['tags-vote-' + a] =
        constants.message('tags.vote.' + a);
    });

    _.each(hints, function (hint, name) {
      tooltips.add('.hint-' + name, hint);
    });

    var link = function ($scope, $element, $attrs) {
      $element.addClass('hint-' + $attrs.hint);
    };

    return {
      restrict: 'A',
      link: link,
    };
  }
]);
