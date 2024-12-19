'use strict';

app.config([
  '$httpProvider', function ($httpProvider) {
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'DatabraryClient';
  }
]);
