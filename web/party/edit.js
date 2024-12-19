'use strict';

app.controller('party/edit', [
  '$scope', 'displayService', 'routerService', 'party',
  function ($scope, display, router, party) {
    $scope.party = party;
    display.title = "Edit " + party.name;

    function leavingSoSoon() {
      return $scope.partyEditForm.resetAll(false, true);
    }

    $scope.switchStep = leavingSoSoon;

    $scope.$on('$locationChangeStart', function (event, url) {
      /* hacky: */
      if (url.includes(party.editRoute()) || url.includes(router.profileEdit()))
        return;
      if (!leavingSoSoon())
        return display.cancelRouteChange(event);
    });
  }
]);
