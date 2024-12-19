'use strict';

app.controller('asset/formats', [
  '$scope', 'pageService', function ($scope, page) {
    page.display.title = page.constants.message('help.formats.title');

    $scope.groups = {};

    _.each(page.constants.format, function(format){
      var general = format.type;

      if (!(general in $scope.groups))
        $scope.groups[general] = [];

      $scope.groups[general].push(format);

    });
  }
]);
