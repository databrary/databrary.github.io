'use strict';

app.directive('validator', [
  '$sce', 'constantService',
  function ($sce, constants) {
    var pre = function ($scope, $element, $attrs) {
      $scope.validator = {};
      $scope.validator.label = $attrs.label && constants.message($attrs.label,{sce:$sce.HTML});
      $scope.validator.validatorId = $attrs.validatorId;
      if ('required' in $attrs)
        $scope.validator.label += ' (required)';
      $scope.validator.prefix = $scope.validator.label ? '<strong>' + $scope.validator.label + ':</strong> ' : '';
    };

    var post = function ($scope, $element, $attrs, form) {
      var validator = $scope.validator;

      validator.name = form[$attrs.name];
      validator.noclientval = 'noclientval' in $attrs;
      validator.$element = $element.find(':input[name="' + $attrs.name + '"]');
      validator.changed = false;
      validator.focus = false;
      validator.serverErrors = [];
      validator.clientErrors = [];
      validator.clientTips = [];

      var on = $scope.$lift(function () {
        validator.focus = true;
      });

      var off = $scope.$lift(function () {
        if (!validator.$element.is(":focus"))
          validator.focus = false;
      });

      validator.$element
        .focus(on)
        .blur(off)
        .mouseenter(on)
        .mouseleave(off);

      validator.iconClasses = function () {
        var cls = [];

        if (!validator.name) {
          return cls;
        }

        if (validator.name.$dirty) {
          cls.push('show');
        }

        if (validator.name.$valid) {
          cls.push('valid');
        } else {
          cls.push('invalid');
        }

        return cls;
      };

      //

      validator.show = function () {
        return validator.showClientErrors() || validator.showClientTips() || validator.showServerErrors();
      };

      validator.showServerErrors = function () {
        return validator.serverErrors.length > 0 && !validator.changed;
      };

      validator.showClientErrors = function () {
        return validator.clientErrors.length > 0 && validator.name && validator.name.$invalid && validator.focus;
      };

      validator.showClientTips = function () {
        return validator.clientTips.length > 0 && validator.name && (!validator.name.$invalid || (validator.clientErrors.length === 0 && validator.serverErrors.length === 0)) && validator.focus;
      };

      //

      var changeWatch = function () {
        validator.changed = true;
        validator.$element.off('keypress.validator');

        if (validator.name) {
          validator.name.$setValidity('serverResponse', true);
        }
      };

      function addPrefix(msg) {
        return $sce.trustAsHtml(validator.prefix + $sce.getTrustedHtml(msg));
      }

      validator.server = function (data, replace) {
        if (replace !== false) {
          validator.changed = false;
          validator.serverErrors.splice(0, validator.serverErrors.length);
          validator.$element.off('keypress.validator');

          if (validator.name) {
            validator.name.$setValidity('serverResponse', true);
          }
        }

        if (!data || $.isEmptyObject(data)) {
          return;
        }

        validator.$element.on('keypress.validator', changeWatch);

        if (validator.name) {
          validator.name.$setValidity('serverResponse', false);
        }

        if (angular.isString(data)) {
          data = [data];
        }

        _.each(data, function (error) {
          validator.serverErrors.push(addPrefix(error));
        });
      };

      validator.client = function (data, replace) {
        if (replace) {
          validator.clientErrors = [];
          validator.clientTips = [];
        }

        if (!data) {
          return;
        }

        if (Array.isArray(data)) {
          data = {
            errors: data,
          };
        }

        if (angular.isString(data.errors)) {
          data.errors = [data.errors];
        }

        if (angular.isString(data.tips)) {
          data.tips = [data.tips];
        }

        if (Array.isArray(data.errors)) {
          _.each(data.errors, function (error) {
            validator.clientErrors.push(addPrefix(error));
          });
        }

        if (Array.isArray(data.tips)) {
          _.each(data.tips, function (tip) {
            validator.clientTips.push(addPrefix(tip));
          });
        }
      };

      //

      if (form && form.validator) {
        form.validator.add($attrs.name, validator);
      }

      if (validator.name) {
        validator.name.validator = validator;
      }
    };

    //

    return {
      restrict: 'E',
      scope: true,
      transclude: true,
      templateUrl: 'directive/validator.html',
      require: '^form',
      link: {
        pre: pre,
        post: post,
      },
    };
  }
]);
