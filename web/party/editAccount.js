'use strict';

app.directive('partyEditAccountForm', [
  'messageService', 'constantService',
  function (messages, constants) {
    var link = function ($scope) {
      var party = $scope.party;
      var form = $scope.partyEditAccountForm;

      function init() {
        form.data = {
          email: party.email,
        };
      }
      init();

      $scope.$watch('partyEditAccountForm.data.password.again', function () {
        form['password.again'].$setValidity('match', !form.data.password || form.data.password.once === form.data.password.again);
      });

      form.save = function () {
        if (form.data.password && !(form.data.password.once || form.data.password.again))
          delete form.data.password;
        form.$setSubmitted();
        messages.clear(form);
        party.saveAccount(form.data).then(
          function () {
            form.validator.server({});

            messages.add({
              type: 'green',
              body: constants.message('party.edit.profile.success'),
              owner: form
            });

            init();
            form.$setPristine();
          }, function (res) {
            form.$setUnsubmitted();
            form.validator.server(res);
          });
      };

      var validate = {};
      ['email', 'password', 'password.again', 'auth'].forEach(function (f) {
        validate[f] = {
          tips: constants.message('party.edit.' + f + '.help')
        };
      });
      validate.email.errors = constants.message('login.email.error');
      validate['password.again'].errors = constants.message('party.edit.password.again.error');
      form.validator.client(validate, true);
    };

    return {
      restrict: 'E',
      templateUrl: 'party/editAccount.html',
      link: link
    };
  }
]);
