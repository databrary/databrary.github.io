'use strict';

var videoDirective = [
  'Segment',
  function (Segment) { return {
    restrict: 'E',
    require: '^?ngController',
    link: function ($scope, $element, $attrs, view) {
      $element.on('loadedmetadata', function () {
        var video = this;
        var seek = $scope.$eval($attrs.seek), stop;
        if (seek instanceof Segment) {
          stop = seek.u;
          seek = seek.l;
        }

        if (isFinite(seek) && seek > 0) {
          video.currentTime = seek / 1000;
          $element.off('loadedmetadata');
        }

        if (isFinite(stop) && stop > seek) {
          stop /= 1000;
          var checkStop = function() {
            if (video.currentTime < stop)
              return;
            video.pause();
            $element.off('timeupdate', checkStop);
          };
          $element.on('timeupdate', checkStop);
        }

        if (view && view.registerVideo)
          view.registerVideo($element);
        $scope.$on('$destroy', function () {
          $element.empty();
          video.load();
          if (view && view.deregisterVideo)
            view.deregisterVideo($element);
        });
      });
    }
  }; }
];
app.directive('video', videoDirective);
app.directive('audio', videoDirective);
