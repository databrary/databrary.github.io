'use strict';

app.directive('messages', [
  'messageService',
  function (messages) {
    var controller = ['$scope', function ($scope) {
      return ($scope.messages = {
        list: messages.list
      });
    }];

    //

    return {
      restrict: 'E',
      templateUrl: 'site/messages.html',
      controller: controller,
      controllerAs: 'messages',
    };
  }
]);
