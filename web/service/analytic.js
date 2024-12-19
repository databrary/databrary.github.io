'use strict';

app.factory('analyticService', [
  function () {
    var analytics = {};
    var queue = [];

    analytics.dump = function () {
      if (!queue.length)
        return;
      return JSON.stringify(queue.splice(0, queue.length));
    };

    analytics.add = function (action, data) {
      var a = {action: action, route: location.pathname};
      if (data !== undefined)
        a.data = data;
      if (!_.some(queue, a))
        queue.push(a);
    };

    return analytics;
  }
]);
