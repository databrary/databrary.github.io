'use strict';

app.directive('fold', [
  'storageService',
  function (storage) {
    var link = function ($scope, $element, $attrs) {
      var id = $attrs.id;
      var folded = false;
      var forget = $attrs.forget;

      function setFold(fold) {
        if ((folded = fold))
          $element.addClass('folded');
        else
          $element.removeClass('folded');
        $scope.folded = folded;
        if (!forget)
          storage.setString('folding-' + id, folded ? '1' : '');
      }

      $scope.toggleFold = function (state) {
        setFold(state === undefined ? !folded : state);
      };

      $element.addClass('foldable');
      $element.find('[folder]').addClass('folder');

      setFold(storage.getString('folding-' + id));
    };

    return {
      restrict: 'A',
      priority: 0,
      link: link
    };
  }
]);
