'use strict';

app.directive('fileModel', [
  '$parse',
  function ($parse) { return {
    restrict: 'A',
    controller: [function () {
      this.$setPristine = function () {
        this.$dirty = false;
        this.$pristine = true;
      };
      this.$setPristine();
    }],
    require: ['fileModel', '^form'],
    link: function ($scope, $element, $attrs, ctrls) {
      var file = ctrls[0], form = ctrls[1];
      var model = $parse($attrs.fileModel);

      form.$addControl(file);
      $scope.$on('$destroy', function() {
        form.$removeControl(file);
      });

      $element.on('change', function () {
        model.assign($scope, $element[0].files);
        if (file.$pristine) {
          file.$dirty = true;
          file.$pristine = false;
          form.$setDirty();
        }
      });

      $scope.$watch(model, function (val) {
        if (!val)
          $element[0].value = '';
      });
    }
  }; }
]);
