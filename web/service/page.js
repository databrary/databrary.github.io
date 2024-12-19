'use strict';

app.factory('pageService', [
  '$injector', '$rootScope',
  function ($injector, $rootScope) {
    var page = {
      auth: $injector.get('authService'),
      constants: $injector.get('constantService'),
      display: $injector.get('displayService'),
      messages: $injector.get('messageService'),
      models: $injector.get('modelService'),
      router: $injector.get('routerService'),
      tooltips: $injector.get('tooltipService')
    };

    //

    page.permission = page.constants.permission;
    page.release = page.constants.release;

    //

    _.each([
      '$filter',
      '$location',
      '$q',
      '$route',
    ], function (dependency) {
      page[dependency] = $injector.get(dependency);
    });

    //

    page.$w = $($injector.get('$window'));

    //

    $rootScope.page = page;

    return page;
  }
]);
