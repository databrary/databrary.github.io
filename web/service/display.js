'use strict';

app.factory('displayService', [
  '$rootScope', 'storageService', '$filter', '$sce', 'messageService', 'tooltipService', 'constantService', '$timeout', '$window', '$play', 'analyticService',
  function ($rootScope, storage, $filter, $sce, messages, tooltips, constants, $timeout, window, $play, analytics) {
    var display = {};

    display.title = '';

    display.loading = false;

    $rootScope.$on('$routeChangeStart', function () {
      display.loading = true;
      display.error = false;
      tooltips.clear();
      messages.clear();
    });

    $rootScope.$on('$routeChangeSuccess', function () {
      display.loading = false;
      analytics.add('open');
    });

    display.error = undefined;

    $rootScope.$on('$routeChangeError', function (event, current, previous, error) {
      display.error = true;
      display.loading = false;
      display.scrollTo(0);
      $rootScope.$broadcast('displayService-error', error);

      var data = {current: current.controller, error: error};
      if (previous)
        data.previous = previous.controller;
      analytics.add('close', data);
    });

    var $scroll = $('html,body');

    display.scrollTo = function (target) {
      $timeout(function () {
        if (typeof target === 'function')
          target = target();
        if (typeof target === 'string')
          target = $(target);
        if (target instanceof $) {
          if (!target.length) return;
          if (target.is('input,textarea'))
            target.focus();
          target = target.offset().top - 72;
        }
        $scroll.animate({
          scrollTop: target
        }, 500);
      }, 1);
    };

    var ageKeys = ['auto', 'day', 'month', 'year'];
    display.age = storage.getString('displayAge') || 'auto';

    display.ageMode = function (days) {
      if (display.age !== 'auto')
        return display.age;
      if (days < 3*constants.age.month)
        return 'day';
      if (days < 37*constants.age.month)
        return 'month';
      return 'year';
    };

    display.toggleAge = function (mode) {
      display.age = mode || ageKeys[(ageKeys.indexOf(display.age) + 1) % ageKeys.length];
      $rootScope.$broadcast('displayService-toggleAge', display.age);
      storage.setString('displayAge', display.age);
    };

    display.formatAge = function (value) {
      return $filter('age')(value);
    };

    /*$routeChangeStart is always fires before $locationChangeStart*/
    display.cancelRouteChange = function(event){
      display.loading = false;
      event.preventDefault();
    };

    /* TODO: this should really use .canPlayType */
    if (window.navigator.userAgent.search(/^Mozilla\/.* \(Macintosh; .* Firefox\/([0-2]|[3][0-4])/) === 0)
      messages.add({
        type: 'yellow',
        body: constants.message('video.unsupported'),
        persist: true
      });

    if ($play.down)
      messages.add({
        type: 'red',
        body: $sce.trustAsHtml($play.down + " <a href='/' target='_self'>Learn more.</a>"),
        persist: true
      });

    return display;
  }
]);
