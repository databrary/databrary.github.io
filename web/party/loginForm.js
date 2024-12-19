'use strict';

app.directive('loginForm', [
  '$route', 'modelService', 'routerService', '$timeout',
  function ($route, models, router, $timeout) { return {
    restrict: 'E',
    templateUrl: 'party/loginForm.html',
    link: function ($scope) {
      var form = $scope.loginForm;

      form.data = {};

      form.submit = function () {
        form.$setSubmitted();
        models.Login.login(form.data).then(function () {
          form.validator.server({});
          if ($route.current.controller === 'party/login')
            router.back();
          else
            $route.reload();
          form.$setPristine();
        }, function (res) {
          form.validator.server(res, true);
          form.$setUnsubmitted();
        });
      };

      form.validator.client({}, true);

      $timeout(function(){angular.element('#loginEmail').focus();},100);

      $(document).on('blur', '#loginEmail', function(){
        $scope.email = form.data.email;
      })

    }
  }; }
]);
