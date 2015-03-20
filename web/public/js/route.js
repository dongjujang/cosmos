(function(){
	window.Route = {};
	Route.routes = [];
	Route.regist = function() {
		var loc;
		if (location.pathname.length > 1 && location.pathname[location.pathname.length - 1] == '/') {
			loc = location.pathname.slice(0, location.pathname.length - 1);
		} else {
			loc = location.pathname;
		}

		var locPaths = loc.split('/');
		for (var i in this.routes) {
			if (this.routes[i](locPaths)) break;
		}
	};
	Route.match = function(route, fn) {
		this.routes.push(function(locPaths) {
			if (typeof fn == 'function') {
				var routePaths = route.split('/');

				if (locPaths.length != routePaths.length) {
					return false;
				}

				var params = {};
				for (var i in routePaths) {
					var p = routePaths[i];
					if (p.indexOf(':') == 0) {
						p = p.slice(1, p.length);
						params[p] = locPaths[i];
					} else {
						if (p != locPaths[i]) {
							return false;
						}
					}
				}				
				
				// Invoke handler after DOM ready
				Route.params = params;
				$(function() {
					fn();
				});

				return true;
			}
		});
	};
})();
