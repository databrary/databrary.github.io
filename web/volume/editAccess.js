'use strict';

app.directive('volumeEditAccessForm', [
  '$q', '$location', 'constantService', 'modelService', 'messageService', 'displayService',
  function ($q, $location, constants, models, messages, display) {
    var link = function ($scope) {
      var volume = $scope.volume;
      var form = $scope.volumeEditAccessForm;

      form.preset = volume.accessPreset;
      form.data = _.values(volume.access);

      var presetForm = $scope.accessPresetForm;
      var subforms = [];

      $scope.permissionName = function (p) {
        return constants.permission[p];
      };

      function savePreset() {
        if (form.preset == null)
          return;
        form.$setSubmitted();
        var sharefull = false;
        $q.all(constants.accessPreset[form.preset].map(function (a, pi) {
          if (form.preset === 2) {
            sharefull = true;
          }
          volume.accessSave(constants.accessPreset.parties[pi], a, sharefull);
        })).then(function () {
          messages.add({
            body: constants.message('access.preset.save.success'),
            type: 'green',
            owner: form
          });
          form.$setPristine();
        }, function (res) {
          form.$setUnsubmitted();
          messages.addError({
            body: constants.message('access.preset.save.error'),
            report: res,
            owner: form
          });
        });
      }

      form.saveAll = function () {
        messages.clear(form);
        subforms.forEach(function (subform) {
          if (subform.$dirty)
            subform.save(false);
        });
        if (presetForm.$dirty)
          savePreset();
      };

      $scope.$on('accessGrantForm-init', function (event, grantForm) {
        subforms.push(grantForm);

        grantForm.removeSuccessFn = function (access) {
          form.data.remove(access);
          subforms.remove(grantForm);
        };
      });

      $scope.selectFn = function (p) {
        if (form.data.some(function (a) { return a.party.id === p.id; })) {
          display.scrollTo("#access-"+p.id);
        } else {
          form.data.push({
            new: true,
            party: p,
            individual: 0,
            children: 0
          });
          display.scrollTo('fieldset .access-grant:last');
        }
      };

      var p = $location.search().party;
      if (p !== undefined) {
        $location.search('party', null);
        models.Party.get(p).then($scope.selectFn);
      }
    };

    return {
      restrict: 'E',
      templateUrl: 'volume/editAccess.html',
      link: link
    };
  }
]);
