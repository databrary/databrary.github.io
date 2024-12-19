'use strict';

app.directive('partyEditProfileForm', [
  'messageService', 'constantService',
  function (messages, constants) {
    var link = function ($scope) {
      var party = $scope.party;
      var form = $scope.partyEditProfileForm;

      var fields = ['prename', 'sortname', 'affiliation', 'orcid', 'url'];

      function init() {
        form.data = {};
        fields.forEach(function (f) {
          form.data[f] = party[f];
        });
      }
      init();
      form.avatarUrl = party.avatarRoute();

      form.save = function () {
        messages.clear(form);
        form.$setSubmitted();
        var fd, upload;
        if (angular.isObject(form.data.avatar)) {
          fd = new FormData();

          fd.append('avatar', form.data.avatar[0]);

          for (var prop in form.data)
            if (form.data.hasOwnProperty(prop) && form.data[prop] !== undefined)
              fd.append(prop, form.data[prop]);

          upload = messages.add({
            type: 'yellow',
            body: constants.message('party.edit.avatar.upload', constants.message('avatar')),
            owner: form
          });
        } else
          fd = form.data;

        party.save(fd)
          .then(function () {
            form.validator.server({});
            messages.add({
              type: 'green',
              body: constants.message('party.edit.profile.success') + ('avatar' in form.data ? ' Your avatar will take some time to update.' : ''),
              owner: form
            });

            if (upload)
              upload.remove();

            init();
            form.$setPristine();

            if (upload)
              form.avatarUrl = party.avatarRoute(undefined, Date.now());
          }, function (res) {
            form.validator.server(res);
            form.$setUnsubmitted();

            if (upload)
              upload.remove();
          });
      };

      form.removeAvatar = function () {
        form.data.avatar = null;
        form.avatarUrl = '/web/images/avatar.png';
        form.$setDirty();
      };

      var validate = {};
      fields.forEach(function (f) {
        validate[f] = {
          tips: constants.message('party.edit.' + f + '.help')
        };
      });
      form.validator.client(validate, true);
    };

    return {
      restrict: 'E',
      templateUrl: 'party/editProfile.html',
      link: link
    };
  }
]);
