'use strict';

app.directive('uploadProgress', [
  function () {

    return {
      restrict: 'E',
      scope: {
        progressFloat: '=progressValue',
        progressTitle: '=progressText'
      },
      templateUrl: 'asset/uploadProgress.html',
    };
  }
]);

