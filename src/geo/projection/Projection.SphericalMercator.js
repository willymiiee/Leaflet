import {LatLng} from '../LatLng';
import {Bounds} from '../../geometry/Bounds';
import {Point} from '../../geometry/Point';

/*
 * @namespace Projection
 * @projection L.Projection.SphericalMercator
 *
 * Spherical Mercator projection — the most common projection for online maps,
 * used by almost all free and commercial tile providers. Assumes that Earth is
 * a sphere. Used by the `EPSG:3857` CRS.
 */

var earthRadius = 6378137;

export var SphericalMercator = {

	R: earthRadius,
	MAX_LATITUDE: 85.0511287798,


	project: function (latlng, magnetPoint) {
		//TODO 04/2022: Merge with new logic from main branch
		if (latlng._projectedPoint) {
			return latlng._projectedPoint.clone();
		}
		var d = Math.PI / 180,
			max = this.MAX_LATITUDE,
			lat = Math.max(Math.min(max, latlng.lat), -max),
			sin = Math.sin(lat * d),
			y = this.R * Math.log((1 + sin) / (1 - sin)) / 2,
			x = this.R * latlng.lng * d;

		if (magnetPoint) {
			var w = 2 * Math.PI * this.R,
				xPlus = x + w,
				xMinus = x - w,
				xToMagnet = Math.abs(magnetPoint.x - x);
			if (Math.abs(magnetPoint.x - xPlus) < xToMagnet) {
				x = xPlus;
			}
			else if (Math.abs(magnetPoint.x - xMinus) < xToMagnet) {
				x = xMinus;
			}
		}

		var point = new L.Point(x, y);
		latlng._projectedPoint = point.clone();
		return point;
	},

	unproject: function (point) {
		var d = 180 / Math.PI,
			latlng = new L.LatLng(
			(2 * Math.atan(Math.exp(point.y / this.R)) - (Math.PI / 2)) * d,
			point.x * d / this.R);
		latlng._projectedPoint = point;
		return latlng;
	},

	bounds: (function () {
		var d = earthRadius * Math.PI;
		return new Bounds([-d, -d], [d, d]);
	})()
};
