'use strict';

app.controller('party/view', [
  '$scope', 'displayService', 'party',
  function ($scope, display, party) {
    $scope.party = party;
    $scope.volumes = _.pluck(party.access, 'volume');
    display.title = party.name;
  }
]);
