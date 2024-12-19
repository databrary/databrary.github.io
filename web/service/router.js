'use strict';

app.provider('routerService', [
  '$routeProvider', 'routeData',
  function ($routeProvider, controllers) {
    function encodeUri(val) {
      return encodeURIComponent(val).
        replace(/%40/g, '@').
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, '+');
    }

    /* Add the query params to the url. */
    function urlParams(url, params) {
      if (!params) {
        return url;
      }

      var q = url.includes('?');

      _.each(params, function (value, key) {
        if (value == null)
          return;

        var add = function (v) {
          if (angular.isObject(v))
            v = angular.toJson(v);

          url += (q ? '&' : '?') + encodeUri(key);
          if (v !== true)
            url += '=' + encodeUri(v);
          q = true;
        };

        if (Array.isArray(value))
          value.forEach(add);
        else
          add(value);
      });

      return url;
    }

    /* Apply a jsroute (from play's routeData) given the names of its arguments and optional data (or placeholders). */
    function getRoute(route, argNames, data) {
      var args;
      var params = {};
      if (!argNames)
        argNames = [];
      var ph = arguments.length < 3;
      if (ph)
        args = argNames.map(function (a) { return ':' + a; });
      else if (data == null)
        args = [];
      else if (Array.isArray(data))
        args = data;
      else if (typeof data === 'object') {
        args = argNames.map(function (k) {
          if (k in data) {
            var r = data[k];
            delete data[k];
            return r;
          }
          return null;
        });
        params = data;
      } else
        args = [data];
      var url = route.route.apply(null, args);
      if (ph)
        return url;
      for (var i = route.route.length; i < argNames.length && i < args.length; i++) {
        params[argNames[i]] = args[i];
      }
      var q;
      for (var p in params) {
        if (!q) {
          url += '?';
          q = true;
        }
        url += p;
        if (params[p] != null)
          url += '=' + encodeUri(params[p]);
      }
      return url;
    }

    /* Add a route to $routeProvider and return a function to get a url given parameters. */
    function makeRoute(route, argNames, handler) {
      if (handler) {
        var path = getRoute(route, argNames);
        $routeProvider.when(path, handler);
        if (path.includes('id/:segment'))
          $routeProvider.when(path.replace('id/:segment', 'id'), handler);
      }

      return function (data, params) {
        return urlParams(getRoute(route, argNames, data), params);
      };
    }

    function checkPermission($q, f, perm) {
      return f.then(function (obj) {
        return obj.checkPermission(perm) ? obj :
          $q.reject({status: 403});
      });
    }

    var routes = {};

    routes.index = makeRoute(controllers.viewRoot, [], {
      controller: 'site/home',
      templateUrl: 'site/home.html',
      resolve: {
        volume: [
          'modelService', 'constantService',
          function (models, constants) {
            if (constants.sandbox) return; else
            return models.Volume.get(9)
              .catch(function() {
                return {};
              });
          }
        ],
        tags: [
          'modelService',
          function (models) {
            return models.Tag.top();
          }
        ],
        activity: [
          'modelService',
          function (models) {
            return models.siteActivity();
          }
        ]
      },
      reloadOnSearch: false,
    });

    //

    routes.login = makeRoute(controllers.viewLogin, [], {
      controller: 'party/login',
      templateUrl: 'party/login.html',
      reloadOnSearch: false
    });

    //

    routes.register = makeRoute(controllers.viewRegister, [], {
      controller: 'party/register',
      templateUrl: 'party/register.html',
      resolve: {
        user: [
          'modelService',
          function (models) {
            if (models.Login.isLoggedIn())
              return models.Login.user.get(['parents']);
            else
              return models.Login.user;
          }
        ],
        token: function () {},
      },
      reloadOnSearch: false
    });

    //

    routes.password = makeRoute(controllers.viewPasswordReset, [], {
      controller: 'party/reset',
      templateUrl: 'party/reset.html',
      reloadOnSearch: false
    });

    //

    makeRoute(controllers.viewLoginToken, ['id'], {
      controller: 'party/register',
      templateUrl: 'party/register.html',
      resolve: {
        token: [
          'modelService', '$route',
          function (models, $route) {
            return models.Login.getToken($route.current.params.id, $route.current.params.auth);
          }
        ],
        user: [
          'modelService', function (models) {
            return models.Login.user;
          }
        ],
      },
      reloadOnSearch: false
    });

    //

    routes.volumeSearch = makeRoute(controllers.viewVolumeSearch, [], {
      controller: 'volume/search',
      templateUrl: 'volume/search.html',
      resolve: {
        volumes: [
          'pageService', function (page) {
            return page.models.Volume.search(page.$route.current.params);
          }
        ]
      },
    });

    // Solr search
    routes.search = makeRoute(controllers.viewSearch, [], {
      controller: 'site/search',
      templateUrl: "site/search.html",
      resolve: {
        parties: [
          '$route', 'searchService',
          function ($route, search) {
            return search.Party.search($route.current.params);
          }
        ],
        volumes: [
          '$route', 'searchService',
          function ($route, search) {
            return search.Volume.search($route.current.params);
          }
        ]
      },
      reloadOnSearch: true
    });

    routes.profile = makeRoute(controllers.viewProfile, [], {
      controller: 'party/profile',
      templateUrl: 'party/profile.html',
      resolve: {
        party: [
          'modelService', function (models) {
            return models.Login.user.get({parents:true, children:true, volumes:'access'});
          }
        ]
      },
      reloadOnSearch: false,
    });

    routes.party = makeRoute(controllers.viewParty, ['id'], {
      controller: 'party/view',
      templateUrl: 'party/view.html',
      resolve: {
        party: [
          'pageService', function (page) {
            return page.models.Party.get(page.$route.current.params.id, ['parents', 'children', 'access']);
          }
        ],
      },
      reloadOnSearch: false,
    });

    //

    routes.partyEdit = makeRoute(controllers.viewPartyEdit, ['id'], {
      controller: 'party/edit',
      templateUrl: 'party/edit.html',
      resolve: {
        party: [
          'pageService', function (page) {
            return checkPermission(page.$q,
              page.models.Party.get(page.$route.current.params.id, ['parents', 'children']),
              page.permission.EDIT);
          }
        ],
      },
      reloadOnSearch: false,
    });

    routes.profileEdit = makeRoute(controllers.viewProfileEdit, [], {
      controller: 'party/edit',
      templateUrl: 'party/edit.html',
      resolve: {
        party: [
          'modelService', function (models) {
            return models.Login.user.get(['parents', 'children']);
          }
        ],
      },
      reloadOnSearch: false,
    });

    routes.partyActivity = makeRoute(controllers.viewPartyActivity, ['id'], {
      controller: 'party/activity',
      templateUrl: 'party/activity.html',
      resolve: {
        activity: [
          'pageService', function (page) {
            return page.models.Party.get(page.$route.current.params.id).then(function (p) {
              return p.getActivity().then(function (a) {
                a.party = p;
                return a;
              });
            });
          }
        ],
      }
    });

    routes.partySearch = makeRoute(controllers.viewPartySearch, [], {
      controller: 'party/search',
      templateUrl: 'party/search.html',
      resolve: {
        parties: [
          'pageService', function (page) {
            return page.models.Party.search(page.$route.current.params);
          }
        ]
      },
    });

    var volumeEdit = {
      controller: 'volume/edit',
      templateUrl: 'volume/edit.html',
      resolve: {
        volume: [
          'pageService', function (page) {
            if (!('id' in page.$route.current.params)) {
              return page.models.Login.user.get({parents:'authorization'})
                .then(function () {
                  return undefined;
                });
            }

            return checkPermission(page.$q,
              page.models.Volume.get(page.$route.current.params.id,
                {access:true, citation:true, links:true, top:true, funding:true, records:true, containers:'all', tags:'keyword', metrics:true, excerpts:true}),
              page.permission.EDIT)
              .then(function (volume) {
                return volume.top.getSlot(volume.top.segment, ['assets'])
                  .then(function () {
                    return volume;
                  });
              });
          }
        ],
      },
      reloadOnSearch: false,
    };

    routes.volumeCreate = makeRoute(controllers.viewVolumeCreate, ['owner'], volumeEdit);
    routes.volumeEdit = makeRoute(controllers.viewVolumeEdit, ['id'], volumeEdit);

    routes.volume = makeRoute(controllers.viewVolume, ['id'], {
      controller: 'volume/view',
      templateUrl: 'volume/view.html',
      resolve: {
        volume: [
          'pageService', function (page) {
            return page.models.Volume.get(page.$route.current.params.id,
              {access:true, citation:true, links:true, funding:true, top:true, tags:true, excerpts:true, comments:true, records:true, containers:'all', metrics:true, state:true});
          }
        ]
      },
      reloadOnSearch: false,
    });

    routes.volumeDescription = makeRoute(controllers.viewVolumeDescription, ['id'], {
      controller: 'volume/zip',
      templateUrl: 'volume/zip.html',
      resolve: {
        volume: [
          'pageService', function (page) {
            return page.models.Volume.get(page.$route.current.params.id, {containers:'assets',top:true});
          }
        ],
        slot: function() {
        },
      }
    });

    routes.volumeCSV = makeRoute(controllers.csvVolume, ['id'], {
      controller: 'volume/csv',
      templateUrl: 'volume/csv.html',
      resolve: {
        volume: [
          'pageService', function (page) {
            return page.models.Volume.get(page.$route.current.params.id);
          }
        ],
      }
    });

    routes.volumeActivity = makeRoute(controllers.viewVolumeActivity, ['id'], {
      controller: 'volume/activity',
      templateUrl: 'volume/activity.html',
      resolve: {
        activity: [
          'pageService', function (page) {
            return page.models.Volume.get(page.$route.current.params.id).then(function (v) {
              return v.getActivity().then(function (a) {
                a.volume = v;
                return a;
              });
            });
          }
        ],
      }
    });

    routes.slotZip = makeRoute(controllers.zipSlot, ['vid', 'id'], {
      controller: 'volume/zip',
      templateUrl: 'volume/zip.html',
      resolve: {
        slot: [
          'pageService', function (page) {
            return page.models.Volume.get(page.$route.current.params.vid).then(function(v) {
              return v.getSlot(page.$route.current.params.id, page.$route.current.params.segment, ['assets']);
            });
          }
        ],
        volume: function () {
        },
      }
    });

    routes.slotOrigZip = makeRoute(controllers.zipOrigSlot, ['vid', 'id'], {
      controller: 'volume/zip',
      templateUrl: 'volume/zip.html',
      resolve: {
        slot: [
          'pageService', function (page) {
            return page.models.Volume.get(page.$route.current.params.vid).then(function(v) {
              return v.getSlot(page.$route.current.params.id, page.$route.current.params.segment, ['assets']);
            });
          }
        ],
        volume: function () {
        },
      }
    });

    routes.slotActivity = makeRoute(controllers.viewSlotActivity, ['vid', 'id'], {
      controller: 'volume/slotActivity',
      templateUrl: 'volume/slotActivity.html',
      resolve: {
        activity: [
          'pageService', function (page) {
            return page.models.Volume.get(page.$route.current.params.vid).then(function (v) {
              return v.getSlot(page.$route.current.params.id).then(function (s) {
                return s.getActivity().then(function (a) {
                  a.slot = s;
                  return a;
                });
              });
            });
          }
        ],
      }
    });

    function slotRoute(edit) { return {
      controller: 'volume/slot',
      templateUrl: 'volume/slot.html',
      resolve: {
        slot: [
          'pageService', function (page) {
            var r = page.models.Volume.get(page.$route.current.params.vid, edit ? ['records', 'metrics'] : ['metrics']);
            return (edit ? checkPermission(page.$q, r, page.permission.EDIT) : r)
              .then(function (volume) {
                return volume.getSlot(page.$route.current.params.id, edit ? '-' : page.$route.current.params.segment,
                  ['records', 'assets', 'excerpts', 'tags', 'comments']);
              });
          },
        ],
        edit: function () {
          return edit;
        }
      },
      reloadOnSearch: false,
    }; }
    routes.slotEdit = makeRoute(controllers.viewSlotEdit, ['vid', 'id'], slotRoute(true));
    routes.slot = makeRoute(controllers.viewSlot, ['vid', 'id', 'segment'], slotRoute(false));

    routes.slotAsset = makeRoute(controllers.viewAssetSegment, ['vid', 'cid', 'segment', 'id'], {
      controller: 'asset/view',
      templateUrl: 'asset/view.html',
      resolve: {
        asset: [
          'pageService', function (page) {
            return page.models.Volume.get(page.$route.current.params.vid)
              .then(function (volume) {
                return volume.getAsset(page.$route.current.params.id, page.$route.current.params.cid, page.$route.current.params.segment, ['container', 'asset']);
              });
          },
        ]
      },
      reloadOnSearch: false,
    });

    routes.helpFormats = makeRoute(controllers.viewFormats, [], {
      controller: 'asset/formats',
      templateUrl: 'asset/formats.html',
      reloadOnSearch: false,
    });

    routes.partyAvatar = makeRoute(controllers.partyAvatar, ['id', 'size']);
    routes.volumeThumb = makeRoute(controllers.thumbVolume, ['id', 'size']);
    routes.assetThumb = makeRoute(controllers.thumbAssetSegment, ['cid', 'segment', 'id', 'size']);
    routes.slotThumb = makeRoute(controllers.thumbSlot, ['id','cid','segment', 'size']);
    routes.assetDownload = makeRoute(controllers.downloadAssetSegment, ['cid', 'segment', 'id', 'inline']);
    routes.rawAssetDownload = makeRoute(controllers.downloadAsset, ['id', 'inline']);
    routes.rawAssetThumb = makeRoute(controllers.thumbAsset, ['id', 'size']);
    routes.volumeZip = makeRoute(controllers.zipVolume, ['id']);
    routes.volumeZipOrig = makeRoute(controllers.zipOrigVolume, ['id']);

    $routeProvider.otherwise('/');

    //

    this.$get = [
      '$rootScope', '$location', '$http', '$cacheFactory', 'constantService', 'analyticService',
      function ($rootScope, $location, $http, $cacheFactory, constants, analytics) {
        var router = angular.extend({
          controllers: controllers,
          prev: '/'
        }, routes);

        /* Simple wrapper to $http(route(...)).
         * Non-object arguments (or an initial array) are passed to route.
         * The next argument is passed as data (POST) or params.
         * An additional argument is passed as extra config to $http.
         */
        router.http = function (route, args/*...*/) {
          var i;
          if (Array.isArray(args))
            i = 2;
          else {
            for (i = 1; i < arguments.length; i ++)
              if (angular.isObject(arguments[i]))
                break;
            args = Array.prototype.slice.call(arguments, 1, i);
          }
          var r = {
            method: route.method,
            url: route.route.apply(null, args),
            headers: {}
          };
          if (i < arguments.length) {
            if (r.method === 'POST' || r.method === 'PUT')
              r.data = arguments[i];
            else
              r.url = urlParams(r.url, arguments[i]); // Workaround for ; escaping
            if (++i < arguments.length)
              angular.extend(r, arguments[i]);
          }
          if (r.data instanceof FormData) {
            if (!('transformRequest' in r))
              r.transformRequest = angular.identity;
            // Not sure why we do this but it seems to be necessary:
            if (!('Content-Type' in r.headers))
              r.headers['Content-Type'] = undefined;
          }
          var cache;
          /* try to guess (conservatively) if this request is cached: */
          if (r.method === 'GET' || r.method === 'JSONP') {
            cache = r.cache || $http.defaults.cache && $cacheFactory('$http');
            if (cache && !r.params)
              cache = cache.get(r.url);
          } else if (router.http.csverf)
            r.headers['x-csverf'] = router.http.csverf;
          if (!cache) {
            var a = analytics.dump();
            if (a)
                r.headers.Analytics = a;
          }
          return $http(r);
        };

        var prev;
        $rootScope.$on('$locationChangeStart', function (event, to, from) {
          router.prev = prev;
          prev = from;
        });
        $rootScope.$on('$routeChangeStart', function () {
          router.prev = prev;
        });

        router.back = function () {
          if (!router.prev || router.prev === $location.absUrl())
            $location.url('/');
          else
            $location.$$parse(router.prev);
        };

        return router;
      }
    ];
  }
]);
