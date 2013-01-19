/*
 * Spherical Mercator is the most popular map projection, used by EPSG:3857 CRS used by default.
 */

L.Projection.SphericalMercator = {
	MAX_LATITUDE: 85.0511287798,

	project: function (latlng, magnetPoint) { // (LatLng) -> Point
		var d = L.LatLng.DEG_TO_RAD,
		    max = this.MAX_LATITUDE,
		    lat = Math.max(Math.min(max, latlng.lat), -max),
		    x = latlng.lng * d,
		    y = lat * d;

		y = Math.log(Math.tan((Math.PI / 4) + (y / 2)));

		if (magnetPoint instanceof L.Point) {
			var xPlus = (latlng.lng + 360) * d,
				xMinus = (latlng.lng - 360) * d,
				candidates = {},
				xToMagnet = Math.abs(magnetPoint.x - x),
				xPlusToMagnet = Math.abs(magnetPoint.x - xPlus),
				xMinusToMagnet = Math.abs(magnetPoint.x - xMinus);
			candidates[xToMagnet] = x;
			candidates[xPlusToMagnet] = xPlus;
			candidates[xMinusToMagnet] = xMinus;
			var closer = [xToMagnet, xPlusToMagnet, xMinusToMagnet].sort(function(a,b){return a-b;}).shift();
			x = candidates[closer];
		}

		return new L.Point(x, y);
	},

	unproject: function (point) { // (Point, Boolean) -> LatLng
		var d = L.LatLng.RAD_TO_DEG,
		    lng = point.x * d,
		    lat = (2 * Math.atan(Math.exp(point.y)) - (Math.PI / 2)) * d;

		return new L.LatLng(lat, lng);
	}
};
