// Cosmos object initialize
(function() {

    var FEED_TYPE_ADD_CONTAINER = 0;
    var FEED_TYPE_REMOVE_CONTAINER = 1;
    var FEED_TYPE_ADD_PLANET = 2;
    var FEED_TYPE_REMOVE_PLANET = 3;

    window.Cosmos = {
        API_VER: 'v1',
        getPlanets: function(done, fail, complete) {
            var self = this;
            var xhr = $.ajax({
                url: '/planets',
                method: 'GET',
                cache: false,
                headers: { 'Accept': 'application/json' }
            });
            if (typeof done == 'function') {
                xhr.done(function(json) {
                    done(json);
                });
            }
            if (typeof fail == 'function') {
                xhr.fail(fail);
            }
            if (typeof complete == 'function') {
                xhr.complete(complete);
            }
        },
        getContainers: function(planet, done, fail, complete) {
            var self = this;
            var queryParams = {};

            if (planet) queryParams['planet'] = planet;

            var queryString = this._getQueryString(queryParams);

            var xhr = $.ajax({
                url: '/containers' + queryString,
                method: 'GET',
                cache: false,
                headers: { 'Accept': 'application/json' }
            });

            if (typeof done == 'function') {
                xhr.done(function(json) {
                    done(json);
                });
            }
            if (typeof fail == 'function') {
                xhr.fail(fail);
            }
            if (typeof complete == 'function') {
                xhr.complete(complete);
            }
        },
        getMetrics: function(type, planet, container, done, fail, complete) {
          var self = this;
          var queryParams = {};

          if (type) queryParams['type'] = type;
          if (planet) queryParams['planet'] = planet;
          if (container) queryParams['container'] = container;

          var queryString = this._getQueryString(queryParams);

          var xhr = $.ajax({
              url: '/metrics' + queryString,
              method: 'GET',
              cache: false,
              headers: { 'Accept': 'application/json' }
          });

          if (typeof done == 'function') {
              xhr.done(function(json) {
                  done(json);
              });
          }
          if (typeof fail == 'function') {
              xhr.fail(fail);
          }
          if (typeof complete == 'function') {
              xhr.complete(complete);
          }
        },
        getMetricsOfPlanet: function(planet, done, fail, complete) {
            var self = this;
            var xhr = $.ajax({
                url: '/' + Cosmos.API_VER + '/planets/' + planet,
                method: 'GET',
                cache: false,
                headers: { 'Accept': 'application/json' }
            });
            if (typeof done == 'function') {
                xhr.done(function(json) {
                    done(self._convertContainerResponse(json));
                });
            }
            if (typeof fail == 'function') {
                xhr.fail(fail);
            }
            if (typeof complete == 'function') {
                xhr.complete(complete);
            }
        },
        getContainerMetrics: function(planet, container, metric, period, done, fail, complete) {
            var self = this;
            var url = '/' + Cosmos.API_VER + '/planets/' + planet + '/containers/' + container;
            var xhr = $.ajax({
                url: url,
                data: {
                    metric: metric,
                    period: period
                },
                method: 'GET',
                cache: false,
                headers: { 'Accept': 'application/json' }
            });

            if (typeof done == 'function') {
                xhr.done(function(json) {
                    done(self._convertContainerMetricResponse(json));
                });
            }
            if (typeof fail == 'function') {
                xhr.fail(fail);
            }
            if (typeof complete == 'function') {
                xhr.complete(complete);
            }
        },
        getNewsFeeds: function(done, fail, complete) {
            var self = this;
            var xhr = $.ajax({
                url: '/' + Cosmos.API_VER + '/newsfeeds',
                method: 'GET',
                cache: false,
                headers: { 'Accept': 'application/json' }
            });

            if (typeof done == 'function') {
                xhr.done(function(json) {
                    done(self._convertNewsFeedsResponse(json));
                });
            }
            if (typeof fail == 'function') {
                xhr.fail(fail);
            }
            if (typeof complete == 'function') {
                xhr.complete(complete);
            }
        },
        _getQueryString: function(queryParams) {
          var queryString = '';

          for (var i = 0, len = Object.keys(queryParams).length; i < len; i++) {
            if (i == 0) queryString += '?';
            else queryString += '&';

            key = Object.keys(queryParams)[i];
            value = queryParams[key];
            queryString += (key + '=' + encodeURIComponent(value));
          }

          return queryString;
        },
        _convertNewsFeedsResponse: function(json) {
            var data = [];
            for (var i = 0; i < json.length; i++) {
                var j = JSON.parse(json[i][2])
                j['Time'] = json[i][0];
                j['Key'] = j.Planet;
                if (j.Container) {
                    j['Key'] += '.' + j.Container;
                }
                if (j['Type'] == 2 || j['Type'] == 3) {
                    // Planet NewsFeed
                    // set hidden property to TRUE
                    j['Hidden'] = true;
                }

                switch (j['Type']) {
                    case FEED_TYPE_ADD_CONTAINER:
                        j['Content'] = j['Container'] + ' is on the ' + j['Planet'] + '.';
                        break;
                    case FEED_TYPE_REMOVE_CONTAINER:
                        j['Content'] = j['Container'] + ' is lost on the ' + j['Planet'] + '.';
                        break;
                    case FEED_TYPE_ADD_PLANET:
                        j['Content'] = 'Curiosity lands on the ' + j['Planet'] + '.';
                        break;
                    case FEED_TYPE_REMOVE_PLANET:
                        j['Content'] = 'Curiosity is lost on the ' + j['Planet'] + '.';
                        break;
                }

                data.push(j);
            }
            return data;
        },
        _convertPlanetResponse: function(json) {
            var data = [];
            var keys = Object.keys(json);
            for (var i = 0; i < keys.length; i++) {
                var k = keys[i];
                var inKeys = Object.keys(json[k]);

                for (var j = 0; j < inKeys.length; j++) {
                    var inK = inKeys[j];
                    var newK = inK.replace(/\./g, "");
                    var val = json[k][inK];
                    delete(json[k][inK]);
                    json[k][newK] = val
                }
                json[k]['Planet'] = k;
                data.push(json[k]);
            }
            return data;
        },
        _convertContainerResponse: function(json) {
            var data = [];
            var keys = Object.keys(json);
            for (var i = 0; i < keys.length; i++) {
                var k = keys[i];
                var inKeys = Object.keys(json[k]);

                for (var j = 0; j < inKeys.length; j++) {
                    var inK = inKeys[j];
                    var newK = inK.replace(/\./g, "");
                    var val = json[k][inK];
                    delete(json[k][inK]);
                    json[k][newK] = val;
                }
                json[k]['Index'] = i;
                json[k]['Key'] = k;
                var comps = k.split('.');
                json[k]['Planet'] = comps[0];
                json[k]['Container'] = comps[1];
                data.push(json[k]);
            }
            return data;
        },
        _convertContainerMetricResponse: function(json) {
            var keys = Object.keys(json);
            for (var i = 0; i < keys.length; i++) {
                var k = keys[i];
                var newK = k.replace(/\./g, "");
                var val = json[k];
                delete(json[k]);
                json[newK] = val
            }
            return json;
        }
    };
})();
