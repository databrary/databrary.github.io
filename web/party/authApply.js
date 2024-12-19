'use strict';

app.directive('authApplyForm', [
  'constantService', 'modelService', 'messageService', 'displayService',
  function (constants, models, messages, display) {
    var link = function ($scope) {
      var party = $scope.party || models.Login.user;
      var auth = $scope.auth;
      var form = $scope.authApplyForm;

      form.data = {};

      if (auth.new)
        form.$setDirty();

      //

      var saveAuth = function () {
        form.$setSubmitted();
        party.authorizeApply(auth.party.id, form.data).then(function () {
          form.validator.server({});
          form.$setPristine();
          delete auth.new;

          $scope.authApplySuccessFn(auth, form);
        }, function (res) {
          form.$setUnsubmitted();
          form.validator.server(res);
          display.scrollTo(form.$element);
        });
      };

      var saveQuery = function () {
        messages.clear(form);
        party.authorizeNotFound(angular.extend({
          name: auth.query,
          permission: constants.permission[auth.principal ? 'READ' : 'EDIT']
        }, form.data)).then(function () {
          form.validator.server({});
          form.$setPristine();
          delete auth.new;

          $scope.authApplySuccessFn(auth, form);
        }, function (res) {
          form.validator.server(res);
          display.scrollTo(form.$element);
        });
      };

      form.save = function () {
        if (auth.party)
          saveAuth();
        else
          saveQuery();
      };

      //

      form.cancel = function () {
        $scope.authApplyCancelFn(auth, form);
      };

      //

      form.validator.client({}, true);

      //

      $scope.$emit('authApplyForm-init', form);
    };

    //

    return {
      restrict: 'E',
      templateUrl: 'party/authApply.html',
      replace: true,
      link: link
    };
  }
]);
