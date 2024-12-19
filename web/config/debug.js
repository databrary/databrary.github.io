'use strict';

app.config([
  '$compileProvider',
  function ($compileProvider) {
    $compileProvider.debugInfoEnabled(DEBUG);
  }
]);
