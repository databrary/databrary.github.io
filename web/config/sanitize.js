'use strict';

/* This is a temporary patch to deal with SCE until it can be done properly. */
app.factory('$sanitize', [
  function () {
    var ent = Object.freeze({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&apos;"
    });

    function rep(c) {
      return ent[c];
    }

    return function (input) {
      return input.replace(/[&<>"']/g, rep);
    };
  }
]);
