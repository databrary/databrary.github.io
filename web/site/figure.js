'use strict';

app.directive('figure', [
  function () { return {
    restrict: 'E',
    priority: 100,
    transclude: true,
    templateUrl: 'site/figure.html',
    link: function ($scope, $element, $attrs) {
      if ($attrs.fill) {
        var $inner = $element.find('.figmedia-inner');
        var $img = $element.find('img');

        if (!$img)
          return;

        var resizeFn = function () {
          var figW = $element[0].clientWidth;
          var w = $img[0].clientWidth;
          var h = $img[0].clientHeight;
          var calc;

          if (h > w) {
            $inner.css({
              'width': w,
              'left': 'auto',
              'margin-left': 'auto',
            });
          } else {
            calc = w * figW / h;
            $inner.css({
              'width': calc,
              'left': '50%',
              'margin-left': calc / -2,
            });
          }
        };

        $img.one('load', resizeFn);
        $element.on('resize.figure', resizeFn);
      }
    }
  }; }
]);
