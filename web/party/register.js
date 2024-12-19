'use strict';

app.controller('party/register', [
  '$scope', 'pageService', 'user', 'token',
  function ($scope, page, user, token) {
    $scope.page = page;
    page.display.title = "Register";

    $scope.auth = {};

    var initStep = {
      create: function (step) {
        var form = $scope.registerForm = step.$scope.registerForm;
        form.data = {};
        form.sent = false;

        var validate = {};
        ['prename', 'sortname', 'email', 'affiliation'].forEach(function (f) {
          validate[f] = {
            tips: page.constants.message('party.edit.' + f + '.help')
          };
        });
        validate.email.errors = page.constants.message('register.email.error');
        form.validator.client(validate, true);
      },

      agreement: function (step) {
        $scope.registerForm.$setUnsubmitted();
        step.$scope.proceed = function () {
          $scope.registerForm.$setPristine(); // maybe should be $setSubmitted
          page.models.Login.register($scope.registerForm.data)
            .then(function () {
              $scope.registerForm.$setUnsubmitted();
              $scope.registerForm.sent = true;
              $scope.proceed();
            }, function (res) {
              $scope.registerForm.$setUnsubmitted();
              page.messages.addError({
                body: page.constants.message('error.generic'),
                report: res
              });
            });
        };
      },

      email: function (/*step*/) {
      },

      password: function (step) {
        var form = $scope.passwordForm = step.$scope.passwordForm;
        form.sent = false;
        form.data = {};

        form.save = function () {
          form.$setSubmitted();
          page.messages.clear(form);
          page.models.Login.passwordToken(token.id, form.data)
            .then(function () {
              form.$setUnsubmitted();
              form.validator.server({});

              page.messages.add({
                type: 'green',
                body: page.constants.message('reset.save.success', form.data.email),
                owner: form
              });
              form.sent = true;
              page.$location.url(page.router.register());
            }, function (res) {
              form.$setUnsubmitted();
              form.validator.server(res);
            });
        };

        form.validator.client({
          'once': {
            tips: page.constants.message('reset.once.help'),
          },
          'again': {
            tips: page.constants.message('reset.again.help'),
          },
        }, true);
      },

      agent: function (step) {
        var form = $scope.authSearchForm = step.$scope.authSearchForm;
        form.data = {};

        step.$scope.authSearchSelectFn = function (found) {
          $scope.auth.party = found;
          delete $scope.auth.query;
          $scope.proceed();
        };

        step.$scope.authSearchNotFoundFn = function (query) {
          delete $scope.auth.party;
          $scope.auth.query = query;
          $scope.auth.principal = form.principal;
          $scope.proceed();
        };
      },

      request: function (step) {
        var form = $scope.authApplyForm = step.$scope.authApplyForm;
        form.sent = false;
        step.$scope.authApplySuccessFn = function () {
          form.sent = true;
          updateUserAuth();
        };

        step.$scope.authApplyCancelFn = function () {
          delete $scope.auth.party;
          delete $scope.auth.query;
          $scope.proceed();
        };
      },

      pending: function () {
      }
    };

    $scope.registerStep = function (step) {
      initStep[step.name](step);
      if (step.name === 'pending')
        $scope.proceed();
    };

    function updateUserAuth() {
      user.get(['parents']).then(function () {
        $scope.proceed();
      }, function (res) {
        page.messages.addError({
          body: page.constants.message('register.authquery.error'),
          report: res,
        });
      });
    }

    $scope.proceed = function () {
      var s = {};
      if (!page.models.Login.isLoggedIn())
        if (!token)
          if (!$scope.registerForm.sent) {
            s.create = true;
            s.agreement = $scope.registerForm.$dirty && $scope.registerForm.$valid;
          } else
            s.email = true;
        else
          s.password = !$scope.passwordForm.sent;
      else if (!(user.parents && user.parents.length) && !$scope.authApplyForm.sent) {
        s.agent = true;
        s.request = $scope.auth.party || $scope.auth.query;
      } else if (!page.models.Login.isAuthorized())
        s.pending = true;

      var a;
      for (var si = $scope.steps.length-1; si >= 0; si --) {
        var step = $scope.steps[si];
        step.complete = !!a;
        if (!(step.disabled = !s[step.name]))
          a = a || step;
      }
      if (a)
        $scope.activateStep(a);
      else
        page.$location.url('/');
    };
  }
]);
