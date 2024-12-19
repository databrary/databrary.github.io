'use strict';
/*
app.factory('updateInterceptor', [
  'constantService', 'messageService', '$sce',
  function (constants, messages, $sce) {
    var version = '/' + constants.version;

    return {
      response: function (res) {
        var server;
        if (res.headers && (server = res.headers('server')) && !server.endsWith(version))
          messages.add({
            type: 'yellow',
            body: $sce.trustAsHtml('The Databrary website has been updated. ' + constants.message('app.reload')),
            persist: true
          });

        return res;
      }
    };
  }
]);

app.config([
  '$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('updateInterceptor');
  }
]);
*/
