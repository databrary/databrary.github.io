'use strict';

app.directive('fundingGrantForm', [
  'messageService', 'constantService', 'displayService',
  function (messages, constants, display) {
    var link = function ($scope) {
      var volume = $scope.volume;
      var funding = $scope.funding;
      var form = $scope.fundingGrantForm;

      form.data = {
        awards: funding.awards.slice(0)
      };
      form.data.awards.push('');

      if (funding.new)
        form.$setDirty();

      function keep(x) {
        return x;
      }

      form.save = function () {
        messages.clear(form);
        form.data.awards = _.filter(form.data.awards, keep);

        form.$setSubmitted();
        volume.fundingSave(funding.funder.id, form.data).then(function () {
          messages.add({
            body: constants.message('funding.save.success'),
            type: 'green',
            owner: form
          });

          delete funding.new;
          form.data.awards.push('');
          form.$setPristine();
        }, function (res) {
          form.$setUnsubmitted();
          messages.addError({
            body: constants.message('funding.save.error'),
            report: res,
            owner: form
          });

          display.scrollTo(form.$element);
        });
      };

      form.remove = function () {
        messages.clear(form);
        form.$setSubmitted();
        volume.fundingRemove(funding.funder.id).then(function () {
          messages.add({
            body: constants.message('funding.remove.success'),
            type: 'green',
            owner: form
          });

          form.$setPristine();
          form.removeSuccessFn(funding);
        }, function (res) {
          form.$setUnsubmitted();
          messages.addError({
            body: constants.message('funding.remove.error'),
            report: res,
            owner: form
          });

          display.scrollTo(form.$element);
        });
      };

      form.awardChange = function () {
        if (form.data.awards[form.data.awards.length-1] !== '')
          form.data.awards.push('');
      };

      form.awardRemove = function (i) {
        form.data.awards[i] = i === form.data.awards.length-1 ? '' : null;
        if (!form.data.awards.some(keep))
          return form.remove();
        form.awardChange();
        form.$setDirty();
      };

      $scope.$emit('fundingGrantForm-init', form, $scope);
    };

    //

    return {
      restrict: 'E',
      templateUrl: 'volume/fundingGrant.html',
      link: link
    };
  }
]);
