'use strict';

app.directive('authGrantForm', [
  '$filter', 'constantService', 'messageService', 'displayService', 'modelService',
  function ($filter, constants, messages, display, models) {
    var link = function ($scope) {
      var party = $scope.party;
      var auth = $scope.auth;
      var form = $scope.authGrantForm;

      function fill() {
        form.data = {
          site: auth.site,
          member: auth.member,
          expires: auth.expires && $filter('date')(auth.expires, 'yyyy-MM-dd')
        };
      }
      fill();

      if (auth.new)
        form.$setDirty();

      //

      form.presetName = function (type, name, party) {
        return '<strong>' + constants.message('auth.' + type + '.' + name + '.title') + '</strong>: ' + $filter('possessive')('auth.' + type + '.' + name, party);
      };

      $scope.canGrantSite = function (p) {
        return p == constants.permission.NONE ||
          p == constants.permission.READ ||
          p > constants.permission.READ &&
          models.Login.checkAuthorization(p + 1) ||
          models.Login.checkAuthorization(constants.permission.ADMIN);
      };

      $scope.canGrantMember = function (p) {
        return p == constants.permission.NONE ||
          p == constants.permission.READ ||
          p == constants.permission.EDIT ||
          p == constants.permission.ADMIN ||
          models.Login.checkAuthorization(constants.permission.ADMIN);
      };

      //

      form.save = function () {
        var parentArray = [];
        party.parents.forEach(function(item){
          parentArray.push(item.party.id);
        });
        messages.clear(form);
        if(!(form.data.site === 0 && form.data.member === 0) && !(party.authorization === 5 && parentArray.includes(0)) && !(party.id === 0)) {
          var accessData = "";
          if (form.data.site !==0) {
            accessData = "Databrary data.";
            if (form.data.member !== 0) {
              accessData = "Databrary data and your lab data."
            }
          } else if (form.data.member !== 0) {
            accessData = "your lab data."
          }
          if (confirm("By granting this authorization, you take responsibility for " + auth.party.name + "'s use of " + accessData)) {
            postauthData();
          }
        } else {
          postauthData();
        }
        
      };

      function postauthData() {
        return party.authorizeSave(auth.party.id, form.data).then(function (res) {
          form.validator.server({});
          messages.add({
            body: constants.message('auth.grant.save.success'),
            type: 'green',
            owner: form
          });

          delete auth.new;
          auth.site = res.site;
          auth.member = res.member;
          auth.expires = res.expires;
          fill();
          form.$setPristine();
        }, function (res) {
          form.validator.server(res);
          display.scrollTo(form.$element);
        });
      }

      $scope.$on('authGrantSave', function () {
        if (form.$dirty)
          form.save();
      });

      //

      form.deny = function () {
        messages.clear(form);
        if (auth.new) {
          $scope.authDenySuccessFn(auth, form);
          return;
        }
        party.authorizeRemove(auth.party.id).then(function () {
          form.validator.server({});
          messages.add({
            body: constants.message('auth.grant.remove.success'),
            type: 'green',
            owner: form
          });
          form.$setPristine();
          $scope.authDenySuccessFn(auth, form);
        }, function (res) {
          form.validator.server(res);
          display.scrollTo(form.$element);
        });
      };

      //

      form.validator.client({
        expires: {
          tips: constants.message('auth.grant.expires.help')
        }
      }, true);

      //

      $scope.$emit('authGrantForm-init', form);
    };

    //

    return {
      restrict: 'E',
      templateUrl: 'party/authGrant.html',
      link: link,
    };
  }
]);

