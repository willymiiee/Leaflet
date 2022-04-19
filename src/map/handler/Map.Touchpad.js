import {Map} from '../Map';
import {Handler} from '../../core/Handler';
import * as DomEvent from '../../dom/DomEvent';
import * as Util from '../../core/Util';
import * as DomUtil from '../../dom/DomUtil';

/*
 * L.Handler.Touchpad is used by L.Map to add gesture based pan and zoom on toupad based devices.
 */

// @namespace Map
// @section Interaction Options
Map.mergeOptions({
	// @section Touch interaction options
	// @option touchpad: Boolean|String = *
	// Whether the map can be zoomed and panned by two finger gesture. If
	// passed `'center'`, it will zoom to the center of the view regardless of
	// where the touch events (fingers) were. Enabled for touch-capable web
	// browsers except for old Androids.
	touchpad: true,

	// @option resetTimeout: Integer
	// Sets the snap timeout after the zoom gesture ends.
	resetTimeout: 300,

	// @option zoomMultiplier: Float
	// Sets the zoom multiplier when doing the zoom gesture.
	zoomMultiplier: -0.05,

	// @option bounceAtTouchpadLimits: Boolean = true
	// Set it to false if you don't want the map to zoom beyond min/max zoom
	// and then bounce back when pinch-zooming.
	bounceATouchpadLimits: true
});

export var Touchpad = Handler.extend({
	addHooks: function () {
		DomUtil.addClass(this._map._container, 'leaflet-touch-zoom');
		DomEvent.on(this._map._container, 'wheel', this._onTouchpadStart, this);
	},

	removeHooks: function () {
		DomUtil.removeClass(this._map._container, 'leaflet-touch-zoom');
		DomEvent.off(this._map._container, 'wheel', this._onTouchpadStart, this);
	},

	_onWheelEnd: function() {
		clearTimeout(this.timer);
		this.timer = setTimeout(()=>{
			this._map._touchpadActive = false;
		}, 150)
	},

	_onTouchpadStart: function (e) {
		if (e.deltaMode === e.DOM_DELTA_PIXEL && (Math.abs(e.deltaY) < 90 || Math.abs(e.deltaY) > 110 || this._map._touchpadActive)) {
			// console.log('Touchpad', e);
			this._map._touchpadActive = true;
			this._onWheelEnd();

			if (e.ctrlKey) {
				// touchpad two finger zoom
				this._performZoom(e);
			} else {
				// touchpad two finger scroll
				this._performScroll([e.deltaX, e.deltaY]);
			}
			DomEvent.stop(e);
		}
	},

	_performZoom: function (e) {
		var map = this._map,
			zoom = map.getZoom(),
			snap = this._map.options.zoomSnap || 0;

		map._stop(); // stop panning and fly animations if any

		this._delta = e.deltaY * this._map.options.zoomMultiplier;
		// map the delta with a sigmoid function to -4..4 range leaning on -1..1
		var d2 = this._delta, // / (this._map.options.wheelPxPerZoomLevel * 4),
			d3 = 4 * Math.log(2 / (1 + Math.exp(-Math.abs(d2)))) / Math.LN2,
			d4 = snap ? Math.ceil(d3 / snap) * snap : d3,
			delta = map._limitZoom(zoom + (this._delta > 0 ? d4 : -d4)) - zoom;

		this._delta = 0;
		this._startTime = null;

		if (!delta) { return; }

		if (map.options.scrollWheelZoom === 'center') {
			map.setZoom(zoom + delta);
		} else {
			this._pinchPoint = map.mouseEventToContainerPoint(e);
			map.setZoomAround(this._pinchPoint, zoom + delta);
		}
	},

	_performZoomOld: function (e) {
		var map = this._map;

		this._zoom = map.getZoom() + e.deltaY * this._map.options.zoomMultiplier;

		if (!map.options.bounceAtTouchpadLimits && (
			(this._zoom < map.getMinZoom() && e.deltaY > 0) ||
			(this._zoom > map.getMaxZoom() && e.deltaY < 0))) {
			this._zoom = map._limitZoom(this._zoom);
		}

		this._centerPoint = map.getSize()._divideBy(2);
		if (map.options.touchpad === 'center') {
			this._center = map.containerPointToLatLng(this._centerPoint);
		} else {
			this._pinchPoint = map.mouseEventToContainerPoint(e);
			this._centerLatLng = map.containerPointToLatLng(this._pinchPoint);
			var delta = this._pinchPoint._subtract(this._centerPoint);
			this._center = map.unproject(map.project(this._centerLatLng, this._zoom).subtract(delta), this._zoom);
		}

		Util.cancelAnimFrame(this._animRequest);
		var moveFn = Util.bind(map._move, map, this._center, this._zoom, {pinch: true, round: false});
		this._animRequest = Util.requestAnimFrame(moveFn, this, true);

		clearTimeout(this._timer);
		this._timer = setTimeout(Util.bind(this._zoomSnap, this), this._map.options.resetTimeout);
	},

	_performScroll: function(point) {
		this._map.panBy(point, {animate: false});
	},

	_zoomSnap: function () {
		Util.cancelAnimFrame(this._animRequest);

		if (this._map.options.zoomAnimation) {
			this._map._animateZoom(this._center, this._map._limitZoom(this._zoom), true, this._map.options.zoomSnap);
		} else {
			this._map._resetView(this._center, this._map._limitZoom(this._zoom));
		}
	}
});

// @section Handlers
// @property Touchpad: Handler
// Touchpad touchpad pan zoom handler.
Map.addInitHook('addHandler', 'touchpad', Touchpad);

