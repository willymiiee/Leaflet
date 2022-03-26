import {toPoint as point} from '../../geometry/Point';
import Browser from '../../core/Browser';
import {svgCreate} from '../vector/SVG.Util';
import {Icon} from './Icon';

export var SVGIcon = Icon.extend({

	_createIcon: function (name, oldIcon) {
		var src = this._getIconUrl(name);

		if (!src) {
			if (name === 'icon') {
				throw new Error('iconUrl not set in Icon options (see the docs).');
			}
			return null;
		}

		var img = this._createImg(src, oldIcon && oldIcon.tagName === 'IMG' ? oldIcon : null);
		this._setIconStyles(img, name);

		return img;
	},

	_setIconStyles: function (img, name) {
		var options = this.options;
		var sizeOption = options[name + 'Size'];

		if (typeof sizeOption === 'number') {
			sizeOption = [sizeOption, sizeOption];
		}

		var size = point(sizeOption),
		    anchor = point(name === 'shadow' && options.shadowAnchor || options.iconAnchor ||
		            size && size.divideBy(2, true));

		img.setAttribute('class', 'leaflet-marker-' + name + ' ' + (options.className || ''));

		if (anchor) {
			img.style.marginLeft = (-anchor.x) + 'px';
			img.style.marginTop  = (-anchor.y) + 'px';
			img.setAttribute('marginLeft', -anchor.x);
			img.setAttribute('marginTop', -anchor.y);
		}

		if (size) {
			//		img.style.width  = size.x + 'px';
			// 		img.style.height = size.y + 'px';
			img.setAttribute('width', size.x);
			img.setAttribute('height', size.y);
		}
	},

	_createImg: function (src, el) {
		el = el || svgCreate('image');
		el.setAttribute('href', src);
		return el;
	},
});


// @factory L.icon(options: Icon options)
// Creates an icon instance with the given options.
export function svgIcon(options) {
	return new SVGIcon(options);
}
