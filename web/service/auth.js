'use strict';

app.factory('authService', [
  '$location', '$route', 'messageService', 'constantService', 'modelService',
  function ($location, $route, messages, constants, models) {
    var auth = {};

    auth.logout = function () {
      messages.clear(auth);
      models.Login.logout().then(function () {
        $location.url('/');
        $route.reload();

        messages.add({
          body: constants.message('logout.success'),
          type: 'yellow',
        });
      }, function (res) {
        $location.url('/');

        messages.add({
          body: constants.message('logout.error'),
          report: res,
          owner: auth,
          persist: true
        });
      });
    };

    return auth;
  }
]);
