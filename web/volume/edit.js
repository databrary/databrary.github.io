'use strict';

app.controller('volume/edit', [
  '$scope', 'constantService', 'displayService', 'routerService', 'modelService', 'volume',
  function ($scope, constants, display, router, models, volume) {
    $scope.volume = volume;
    display.title = volume ? "Edit " + volume.displayName : constants.message('volume.edit.create');

    if (!volume) {
      $scope.owners = _.chain(models.Login.user.parents
                             ).filter(function (p) {
                               return p.member >= constants.permission.ADMIN && p.party.authorization >= constants.permission.EDIT && !p.expired;
                             }).map(function (p) {
                               return p.party;
                             }).value();
      if (models.Login.user.authorization >= constants.permission.EDIT)
        $scope.owners.unshift(models.Login.user);
    }

    function leavingSoSoon() {
      return $scope.volumeEditForm.resetAll(false, true);
    }

    $scope.switchStep = leavingSoSoon;

    $scope.$on('$locationChangeStart', function (event, url) {
      /* hacky: */
      if (url.includes(volume ? volume.editRoute() : router.volumeCreate()))
        return;
      if (!leavingSoSoon())
        return display.cancelRouteChange(event);
    });
  }
]);
