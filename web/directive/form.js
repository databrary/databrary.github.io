'use strict';

app.directive('ngForm', [
  '$route', '$timeout', '$animate', 'constantService', 'messageService',
  function ($route, $timeout, $animate, constants, messages) {
    var pre = function ($scope, $element, $attrs) {
      var name = $attrs.name || $attrs.ngForm;
      var form = name && $scope.$eval(name);
      if (!form)
        return;

      form.$element = $element;

      var controls = [];

      function checkDirty() {
        if (!(form.$dirty || form.$submitted) || controls.some(function (control) {
            return control.$dirty;
          }))
            return;
        /* effectively call form.$setPristine, without the child controls. */
        $animate.setClass($element, 'ng-pristine', 'ng-dirty ng-submitted');
        form.$dirty = false;
        form.$pristine = true;
        form.$submitted = false;
        if (form.$$parentForm.subformControl)
          form.$$parentForm.subformControl.$setPristine();
      }

      // This method sets the form state back to its unsubitted state
      form.$setUnsubmitted = function () {
        if (!form.$submitted || controls.some(function (control) {
          return control.$submitted;
        }))
          return;
        $animate.removeClass($element, 'ng-submitted');
        form.$submitted = false;
        if (form.$$parentForm.$setUnsubmitted)
          form.$$parentForm.$setUnsubmitted();
      };

      var $addControl = form.$addControl;
      var $removeControl = form.$removeControl;

      /* this is unfortunate, just because we can't access the existing controls list. */
      form.$addControl = function (control) {
        if ('$pristine' in control)
          controls.push(control);
        return $addControl(control);
      };

      form.$removeControl = function (control) {
        controls.remove(control);
        checkDirty();
        return $removeControl(control);
      };

      form.subformControl = {
        $setPristine: checkDirty
      };

      if ('isolate' in $attrs) {
        form.$$parentForm.$removeControl(form);
        form.$setDirty = function() {
          $animate.removeClass($element, 'ng-pristine');
          $animate.addClass($element, 'ng-dirty');
          form.$dirty = true;
          form.$pristine = false;
        };
      }
      /* it'd be nicer to handle this in $addControl, but it happens too early */
      else if (form.$$parentForm.subformControl)
        form.$addControl(form.$$parentForm.subformControl);

      var unclaimed = {};
      form.validators = {};
      form.validator = {
        server: function (res, replace) {
          messages.clear(form);
          if ($.isEmptyObject(res)) {
            res.data = {};
          } else if (!angular.isObject(res.data)) {
            messages.addError({
              body: constants.message('error.generic'),
              report: res,
              owner: form
            });
            return;
          }

          var errors = messages.foreachError(res.data);
          var name;
          for (name in form.validators) {
            form.validators[name].server(errors[name] || [], replace);
            delete errors[name];
          }

          for (name in errors)
            messages.add({
              type: 'red',
              body: errors[name].join('; '),
              owner: form
            });
        },

        clearServer: function () {
          _.each(form.validators, function (validator) {
            validator.server({}, true);
          });
        },

        client: function (data, replace) {
          for (var name in data) {
            if (!data.hasOwnProperty(name)) {
              continue;
            } else if (form.validators[name]) {
              form.validators[name].client(data[name], replace);
            } else {
              unclaimed[name] = data[name];
            }
          }
        },

        add: function (name, validator) {
          form.validators[name] = validator;

          if (unclaimed[name]) {
            validator.client(unclaimed[name], true);
            delete unclaimed[name];
          }
        },
      };

      form.resetAll = function (force, check) {
        if (!(force || form.$pristine)) {
          if (!(confirm(constants.message('navigation.confirmation')))) {
            window.dataLayer.push({
              'event': 'gtm.confirm',
              'gtm.confirmAction': 'cancel'
            });
            return false;
          } else {
            window.dataLayer.push({
              'event': 'gtm.confirm',
              'gtm.confirmAction': 'ok'
            });
          }
        } 
        if (check)
          return true;
        var x = window.pageXOffset,
            y = window.pageYOffset;
        $route.reload();
        $timeout(function () {
          window.scrollTo(x, y);
        });
        return true;
      };
    };

    return {
      restrict: 'EA',
      link: {
        pre: pre
      }
    };
  }
]);
