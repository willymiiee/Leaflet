function Lethargy(stability, sensitivity, tolerance, delay) {
	this.stability = stability != null ? Math.abs(stability) : 8;
	this.sensitivity = sensitivity != null ? 1 + Math.abs(sensitivity) : 100;
	this.tolerance = tolerance != null ? 1 + Math.abs(tolerance) : 1.1;
	this.delay = delay != null ? delay : 150;
	this.lastUpDeltas = (function () {
		var i, ref, results;
		results = [];
		for (i = 1, ref = this.stability * 2; 1 <= ref ? i <= ref : i >= ref; 1 <= ref ? i++ : i--) {
			results.push(null);
		}
		return results;
	}).call(this);
	this.lastDownDeltas = (function () {
		var i, ref, results;
		results = [];
		for (i = 1, ref = this.stability * 2; 1 <= ref ? i <= ref : i >= ref; 1 <= ref ? i++ : i--) {
			results.push(null);
		}
		return results;
	}).call(this);
	this.deltasTimestamp = (function () {
		var i, ref, results;
		results = [];
		for (i = 1, ref = this.stability * 2; 1 <= ref ? i <= ref : i >= ref; 1 <= ref ? i++ : i--) {
			results.push(null);
		}
		return results;
	}).call(this);
}

Lethargy.prototype.check = function (e) {
	var lastDelta;
	e = e.originalEvent || e;
	if (e.wheelDelta != null) {
		lastDelta = e.wheelDelta;
	} else if (e.deltaY != null) {
		lastDelta = e.deltaY * -40;
	} else if ((e.detail != null) || e.detail === 0) {
		lastDelta = e.detail * -40;
	}
	this.deltasTimestamp.push(Date.now());
	this.deltasTimestamp.shift();
	if (lastDelta > 0) {
		this.lastUpDeltas.push(lastDelta);
		this.lastUpDeltas.shift();
		return this.isInertia(1);
	} else {
		this.lastDownDeltas.push(lastDelta);
		this.lastDownDeltas.shift();
		return this.isInertia(-1);
	}
	return false;
};

Lethargy.prototype.isInertia = function (direction) {
	var lastDeltas, lastDeltasNew, lastDeltasOld, newAverage, newSum, oldAverage, oldSum;
	lastDeltas = direction === -1 ? this.lastDownDeltas : this.lastUpDeltas;
	if (lastDeltas[0] === null) {
		return direction;
	}
	if (this.deltasTimestamp[(this.stability * 2) - 2] + this.delay > Date.now() && lastDeltas[0] === lastDeltas[(this.stability * 2) - 1]) {
		return false;
	}
	lastDeltasOld = lastDeltas.slice(0, this.stability);
	lastDeltasNew = lastDeltas.slice(this.stability, this.stability * 2);
	oldSum = lastDeltasOld.reduce(function (t, s) {
		return t + s;
	});
	newSum = lastDeltasNew.reduce(function (t, s) {
		return t + s;
	});
	oldAverage = oldSum / lastDeltasOld.length;
	newAverage = newSum / lastDeltasNew.length;
	if (Math.abs(oldAverage) < Math.abs(newAverage * this.tolerance) && (this.sensitivity < Math.abs(newAverage))) {
		return direction;
	} else {
		return false;
	}
};

Lethargy.prototype.showLastUpDeltas = function () {
	return this.lastUpDeltas;
};

Lethargy.prototype.showLastDownDeltas = function () {
	return this.lastDownDeltas;
};

export default Lethargy;
