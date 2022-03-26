import {Marker} from './Marker';
import {falseFn, stamp} from '../../core/Util';
import {SVGIcon} from './SVGIcon';
import {toPoint as point} from '../../geometry/Point';
import Browser from '../../core/Browser';
import * as DomUtil from '../../dom/DomUtil';
import {Bounds} from '../../geometry/Bounds';

export var SVGMarker = Marker.extend({

	beforeAdd: function (map) {
		// Renderer is set here because we need to call renderer.getEvents
		// before this.getEvents.
		this._renderer = map.getRenderer(this);
	},

	_animateZoom: falseFn,

	_addIcon: function(){
		this._path = this._icon;
		this._renderer._addPath(this);
		this._renderer._layers[stamp(this)] = this;
	},

	_setPos: function (pos) {

		if (this._icon) {
			var iconPos = pos;
			var marginTop = this._icon.getAttribute('marginTop');
			var marginLeft = this._icon.getAttribute('marginLeft');
			if (!isNaN(marginTop) && !isNaN(marginLeft)) {
				var offset = point(parseInt(marginLeft), parseInt(marginTop));
				iconPos = iconPos.add(offset);
			}
			DomUtil.setPosition(this._icon, iconPos);
		}

		if (this._shadow) {
			var shadowPos = pos;
			var marginTop = this._shadow.getAttribute('marginTop');
			var marginLeft = this._shadow.getAttribute('marginLeft');
			if (!isNaN(marginTop) && !isNaN(marginLeft)) {
				var offset = point(parseInt(marginLeft), parseInt(marginTop));
				shadowPos = shadowPos.add(offset);
			}
			DomUtil.setPosition(this._shadow, shadowPos);
		}
	},
	update: function () {
		if (this._icon && this._map) {
			this._update();
		}
		return this;
	},
	_update: function () {
		if (this._map && this.options.icon instanceof SVGIcon) {
			var pos = this._map.latLngToLayerPoint(this._latlng).round();
			this._setPos(pos);
		}
	},
	_project: function () {
		if (this._map) {
			this._point = this._map.latLngToLayerPoint(this._latlng);
			this._updateBounds();
		}
	},
	_updateBounds: function () {
		var r = this._radius,
			r2 = this._radiusY || r,
			w = this._clickTolerance(),
			p = [r + w, r2 + w];
		this._pxBounds = new Bounds(this._point.subtract(p), this._point.add(p));
	},
	_clickTolerance: function () {
		// used when doing hit detection for Canvas layers
		return this._renderer.options.tolerance || 0;
	},

	// @method bringToFront(): this
	// Brings the layer to the top of all path layers.
	bringToFront: function () {
		if (this._renderer) {
			this._renderer._bringToFront(this);
		}
		return this;
	},

	// @method bringToBack(): this
	// Brings the layer to the bottom of all path layers.
	bringToBack: function () {
		if (this._renderer) {
			this._renderer._bringToBack(this);
		}
		return this;
	},

});

// factory L.svgMarker(latlng: LatLng, options? : Marker options)

// @factory L.svgMarker(latlng: LatLng, options? : Marker options)
// Instantiates a SVGMarker object given a geographical point and optionally an options object.
export function svgMarker(latlng, options) {
	return new SVGMarker(latlng, options);
}
