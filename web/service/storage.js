'use strict';

app.factory('storageService', [
  '$window', function ($window) {
    return {
      setString: function (k, v, persist) {
        try {
          var store = persist && $window.localStorage || $window.sessionStorage;
          if (store)
            store.setItem(k, v);
          else
            console.log('no store ' + k + '=' + v);
        } catch (e) {
          console.log('failed to store ' + k + '=' + v);
        }
      },
      setValue: function (k, v, persist) {
        return this.setString(k, JSON.stringify(v), persist);
      },
      getString: function (k) {
        try {
          if ($window.sessionStorage)
            return $window.sessionStorage.getItem(k);
          if ($window.localStorage)
            return $window.localStorage.getItem(k);
        } catch (e) {
        }
      },
      getValue: function (k) {
        var v = this.getString(k);
        if (typeof v == 'string')
        try {
          v = JSON.parse(v);
        } catch (e) {
        }
        return v;
      }
    };
  }]
);
