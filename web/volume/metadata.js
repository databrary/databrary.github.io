'use strict';
app.directive('metadataForm', [
  'constantService', 'messageService', function(constants, messages) {
    return {
      restrict: 'E',
      templateUrl: 'volume/metadata.html',
      link: function($scope) {
        var form, volume;
        volume = $scope.volume;
        form = $scope.metadataForm;
        
        form.save = function() {
          var data;
          messages.clear(form);
          data = new FormData();
          data.append('file', form.data.metadata[0]);
          form.$setSubmitted();
          return volume.detectcsv(data).then(function() {
            $('metadata-match-form').show();
            form.validator.server({});
            messages.add({
              type: 'green',
              body: constants.message('volume.metadatadetect.success'),
              owner: form
            });
            form.$setPristine();
            var selected_mapping_array = [];
            var selected_metric = [];
            for (var i = 0; i < volume.suggested_mapping.length; i++) {
              selected_metric.push(volume.suggested_mapping[i].metric);
              if(volume.suggested_mapping[i].compatible_csv_fields[0]){
                selected_mapping_array.push({"metric": volume.suggested_mapping[i].metric, "csv_field": volume.suggested_mapping[i].compatible_csv_fields[0]})
              }
            }
            volume.selected_mapping = selected_mapping_array;
            if(volume.selected_mapping.length === volume.suggested_mapping.length){
              $('metadata-form').hide();
            }
            for (var i = 0; i < volume.column_samples.length; i++) {
              if(selected_metric.indexOf(volume.column_samples[i].column_name) !== -1){
                for (var j = 0; j < volume.column_samples[i].samples.length; j++) {
                  if(volume.column_samples[i].samples[j] === "") {
                    volume.column_samples[i].samples[j] = "null";
                    $('.nulltext').show();
                  }
                }
              }
            }
            $scope.$emit('skipfalse');
          }, function(res) {
            form.$setUnsubmitted();
            form.validator.server(res);
            messages.addError({
              body: constants.message('volume.metadatadetect.error'),
              report: res,
              owner: form
            });
          });
        };
      }
    };
  }
]);

app.directive('metadataMatchForm', [
  'constantService', 'messageService', function(constants, messages) {
    return {
      restrict: 'E',
      templateUrl: 'volume/metadatamatch.html',
      require: 'ngModel',
      link: function($scope, ctrl) {
        var form, volume;
        volume = $scope.volume;
        form = $scope.metadataMatchForm;
        form.save = function() {
          messages.clear(form);
          var data = { "csv_upload_id": volume.csv_upload_id, "selected_mapping": volume.selected_mapping};
          form.$setSubmitted();
          return volume.matchcsv(data).then(function() {
            form.validator.server({});
            messages.add({
              type: 'green',
              body: constants.message('volume.metadataupload.success'),
              owner: form
            });
            form.$setPristine();
            $('metadata-match-form').hide();
            $('metadata-form').show();
            $scope.$emit('refreshParent');
          }, function(res) {
            form.$setUnsubmitted();
            form.validator.server(res);
            messages.addError({
              body: constants.message('volume.metadataupload.error'),
              report: res,
              owner: form
            });
          });
        };
        $scope.skip = function(){
          $scope.$emit('skiptrue');
          $('metadata-match-form').hide();
          $('metadata-form').show();
        }
      }
    };
  }
]);
