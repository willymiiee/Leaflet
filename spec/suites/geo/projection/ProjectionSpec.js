describe("Projection.Mercator", function () {
	var p = L.Projection.Mercator;

	describe("#project", function () {
		it("projects a center point", function () {
			// edge cases
			expect(p.project(L.latLng(0, 0))).near([0, 0]);
		});

		it("projects the northeast corner of the world", function () {
			expect(p.project(L.latLng(85.0840591556, 180))).near([20037508, 20037508]);
		});

		it("projects the southwest corner of the world", function () {
			expect(p.project(L.latLng(-85.0840591556, -180))).near([-20037508, -20037508]);
		});

		it("projects other points", function () {
			expect(p.project(L.latLng(50, 30))).near([3339584, 6413524]);

			// from https://github.com/Leaflet/Leaflet/issues/1578
			expect(p.project(L.latLng(51.9371170300465, 80.11230468750001)))
			        .near([8918060.964088084, 6755099.410887127]);
		});
	});

	describe("#unproject", function () {
		function pr(point) {
			return p.project(p.unproject(point));
		}

		it("unprojects a center point", function () {
			expect(pr(L.point(0, 0))).near([0, 0]);
		});

		it("unprojects pi points", function () {
			expect(pr(L.point(-Math.PI, Math.PI))).near([-Math.PI, Math.PI]);
			expect(pr(L.point(-Math.PI, -Math.PI))).near([-Math.PI, -Math.PI]);

			expect(pr(L.point(0.523598775598, 1.010683188683))).near([0.523598775598, 1.010683188683]);
		});

		it('unprojects other points', function () {
			// from https://github.com/Leaflet/Leaflet/issues/1578
			expect(pr(L.point(8918060.964088084, 6755099.410887127)));
		});
	});

	describe("#magnetization", function () {
		it("should magnetize negative Lng with a positive magnet close to date line", function () {
			var magnetPoint = new L.Point(p.R * 3, 1);
			expect(p.project(new L.LatLng(0, -45), magnetPoint)).near(new L.Point(p.R * Math.PI * 7 / 4, 0));
			expect(p.project(new L.LatLng(0, -90), magnetPoint)).near(new L.Point(p.R * Math.PI * 3 / 2, 0));
			expect(p.project(new L.LatLng(0, -135), magnetPoint)).near(new L.Point(p.R * Math.PI * 5 / 4, 0));
			expect(p.project(new L.LatLng(0, -180), magnetPoint)).near(new L.Point(p.R * Math.PI, 0));
		});

		it("should magnetize negative Lng with a positive magnet onto date line", function () {
			var magnetPoint = new L.Point(p.R * Math.PI, 1);
			expect(p.project(new L.LatLng(0, -45), magnetPoint)).near(new L.Point(p.R * Math.PI * 7 / 4, 0));
			expect(p.project(new L.LatLng(0, -90), magnetPoint)).near(new L.Point(p.R * Math.PI * 3 / 2, 0));
			expect(p.project(new L.LatLng(0, -135), magnetPoint)).near(new L.Point(p.R * Math.PI * 5 / 4, 0));
			expect(p.project(new L.LatLng(0, -180), magnetPoint)).near(new L.Point(p.R * Math.PI, 0));
		});

		it("should not magnetize negative Lng with a negative magnet close to date line", function () {
			var magnetPoint = new L.Point(p.R * -3, 1);
			expect(p.project(new L.LatLng(0, -45), magnetPoint)).near(p.project(new L.LatLng(0, -45)));
			expect(p.project(new L.LatLng(0, -90), magnetPoint)).near(p.project(new L.LatLng(0, -90)));
			expect(p.project(new L.LatLng(0, -135), magnetPoint)).near(p.project(new L.LatLng(0, -135)));
			expect(p.project(new L.LatLng(0, -180), magnetPoint)).near(p.project(new L.LatLng(0, -180)));
		});

		it("should not magnetize negative Lng with a negative magnet onto date line", function () {
			var magnetPoint = new L.Point(p.R * -Math.PI, 1);
			expect(p.project(new L.LatLng(0, -45), magnetPoint)).near(p.project(new L.LatLng(0, -45)));
			expect(p.project(new L.LatLng(0, -90), magnetPoint)).near(p.project(new L.LatLng(0, -90)));
			expect(p.project(new L.LatLng(0, -135), magnetPoint)).near(p.project(new L.LatLng(0, -135)));
			expect(p.project(new L.LatLng(0, -180), magnetPoint)).near(p.project(new L.LatLng(0, -180)));
		});

		it("should magnetize positive Lng with a negative magnet close to date line", function () {
			var magnetPoint = new L.Point(p.R * -3, 1);
			expect(p.project(new L.LatLng(0, 45), magnetPoint)).near(new L.Point(p.R * -Math.PI * 7 / 4, 0));
			expect(p.project(new L.LatLng(0, 90), magnetPoint)).near(new L.Point(p.R * -Math.PI * 3 / 2, 0));
			expect(p.project(new L.LatLng(0, 135), magnetPoint)).near(new L.Point(p.R * -Math.PI * 5 / 4, 0));
			expect(p.project(new L.LatLng(0, 180), magnetPoint)).near(new L.Point(p.R * -Math.PI, 0));
		});

		it("should not magnetize positive Lng with a positive magnet close to date line", function () {
			var magnetPoint = new L.Point(3, 1);
			expect(p.project(new L.LatLng(0, 45), magnetPoint)).near(p.project(new L.LatLng(0, 45)));
			expect(p.project(new L.LatLng(0, 90), magnetPoint)).near(p.project(new L.LatLng(0, 90)));
			expect(p.project(new L.LatLng(0, 135), magnetPoint)).near(p.project(new L.LatLng(0, 135)));
			expect(p.project(new L.LatLng(0, 180), magnetPoint)).near(p.project(new L.LatLng(0, 180)));
		});

		it("should not magnetize positive Lng with a positive magnet close to 0", function () {
			var magnetPoint = new L.Point(0.1, 1);
			expect(p.project(new L.LatLng(0, 45), magnetPoint)).near(p.project(new L.LatLng(0, 45)));
			expect(p.project(new L.LatLng(0, 90), magnetPoint)).near(p.project(new L.LatLng(0, 90)));
			expect(p.project(new L.LatLng(0, 135), magnetPoint)).near(p.project(new L.LatLng(0, 135)));
			expect(p.project(new L.LatLng(0, 180), magnetPoint)).near(p.project(new L.LatLng(0, 180)));
		});

		it("should not magnetize positive Lng with a positive magnet onto date line", function () {
			var magnetPoint = new L.Point(Math.PI, 1);
			expect(p.project(new L.LatLng(0, 45), magnetPoint)).near(p.project(new L.LatLng(0, 45)));
			expect(p.project(new L.LatLng(0, 90), magnetPoint)).near(p.project(new L.LatLng(0, 90)));
			expect(p.project(new L.LatLng(0, 135), magnetPoint)).near(p.project(new L.LatLng(0, 135)));
			expect(p.project(new L.LatLng(0, 180), magnetPoint)).near(p.project(new L.LatLng(0, 180)));
		});

		it("should not magnetize with a lng 0 magnet", function () {
			var magnetPoint = new L.Point(0, 1);
			expect(p.project(new L.LatLng(0, -45), magnetPoint)).near(p.project(new L.LatLng(0, -45)));
			expect(p.project(new L.LatLng(0, -90), magnetPoint)).near(p.project(new L.LatLng(0, -90)));
			expect(p.project(new L.LatLng(0, -135), magnetPoint)).near(p.project(new L.LatLng(0, -135)));
			expect(p.project(new L.LatLng(0, -180), magnetPoint)).near(p.project(new L.LatLng(0, -180)));
			expect(p.project(new L.LatLng(0, 45), magnetPoint)).near(p.project(new L.LatLng(0, 45)));
			expect(p.project(new L.LatLng(0, 90), magnetPoint)).near(p.project(new L.LatLng(0, 90)));
			expect(p.project(new L.LatLng(0, 135), magnetPoint)).near(p.project(new L.LatLng(0, 135)));
			expect(p.project(new L.LatLng(0, 180), magnetPoint)).near(p.project(new L.LatLng(0, 180)));
		});

		it("should not magnetize lng closer than or equal to 180° from magnet point", function () {
			var magnetPoint = new L.Point(Math.PI / 2, 1);  // 90°
			expect(p.project(new L.LatLng(0, -45), magnetPoint)).near(p.project(new L.LatLng(0, -45)));
			expect(p.project(new L.LatLng(0, -90), magnetPoint)).near(p.project(new L.LatLng(0, -90)));
			expect(p.project(new L.LatLng(0, 45), magnetPoint)).near(p.project(new L.LatLng(0, 45)));
			expect(p.project(new L.LatLng(0, 90), magnetPoint)).near(p.project(new L.LatLng(0, 90)));
			expect(p.project(new L.LatLng(0, 135), magnetPoint)).near(p.project(new L.LatLng(0, 135)));
			expect(p.project(new L.LatLng(0, 180), magnetPoint)).near(p.project(new L.LatLng(0, 180)));
			magnetPoint = new L.Point(-Math.PI / 2, 1);  // -90°
			expect(p.project(new L.LatLng(0, -45), magnetPoint)).near(p.project(new L.LatLng(0, -45)));
			expect(p.project(new L.LatLng(0, -90), magnetPoint)).near(p.project(new L.LatLng(0, -90)));
			expect(p.project(new L.LatLng(0, -135), magnetPoint)).near(p.project(new L.LatLng(0, -135)));
			expect(p.project(new L.LatLng(0, -180), magnetPoint)).near(p.project(new L.LatLng(0, -180)));
			expect(p.project(new L.LatLng(0, 45), magnetPoint)).near(p.project(new L.LatLng(0, 45)));
			expect(p.project(new L.LatLng(0, 90), magnetPoint)).near(p.project(new L.LatLng(0, 90)));
		});

		it("should magnetize lng farther than 180° from magnet point", function () {
			var magnetPoint = new L.Point(p.R * Math.PI / 2, 1);  // 90°
			expect(p.project(new L.LatLng(0, -135), magnetPoint)).near(new L.Point(p.R * Math.PI * 5 / 4, 0));
			expect(p.project(new L.LatLng(0, -180), magnetPoint)).near(new L.Point(p.R * Math.PI, 0));
			magnetPoint = new L.Point(p.R * -Math.PI / 2, 1);  // -90°
			expect(p.project(new L.LatLng(0, 135), magnetPoint)).near(new L.Point(p.R * -Math.PI * 5 / 4, 0));
			expect(p.project(new L.LatLng(0, 180), magnetPoint)).near(new L.Point(p.R * -Math.PI, 0));
		});

		it("should wrap lng before magnetizing", function () {
			var magnetPoint = new L.Point(p.R * Math.PI / 2, 1);  // 90°
			expect(p.project(new L.LatLng(0, -405), magnetPoint)).near(p.project(new L.LatLng(0, -45)));
			expect(p.project(new L.LatLng(0, -450), magnetPoint)).near(p.project(new L.LatLng(0, -90)));
			expect(p.project(new L.LatLng(0, -495), magnetPoint)).near(p.project(new L.LatLng(0, -135)));
			expect(p.project(new L.LatLng(0, -540), magnetPoint)).near(p.project(new L.LatLng(0, -180)));
			expect(p.project(new L.LatLng(0, 405), magnetPoint)).near(p.project(new L.LatLng(0, 45)));
			expect(p.project(new L.LatLng(0, 450), magnetPoint)).near(p.project(new L.LatLng(0, 90)));
			expect(p.project(new L.LatLng(0, 495), magnetPoint)).near(p.project(new L.LatLng(0, 135)));
			expect(p.project(new L.LatLng(0, 540), magnetPoint)).near(p.project(new L.LatLng(0, 180)));
			magnetPoint = new L.Point(p.R * Math.PI, 1);
			expect(p.project(new L.LatLng(0, -405), magnetPoint)).near(p.project(new L.LatLng(0, -45)));
			expect(p.project(new L.LatLng(0, -450), magnetPoint)).near(p.project(new L.LatLng(0, -90)));
			expect(p.project(new L.LatLng(0, -495), magnetPoint)).near(p.project(new L.LatLng(0, -135)));
			expect(p.project(new L.LatLng(0, -540), magnetPoint)).near(p.project(new L.LatLng(0, -180)));
			expect(p.project(new L.LatLng(0, 405), magnetPoint)).near(p.project(new L.LatLng(0, 45)));
			expect(p.project(new L.LatLng(0, 450), magnetPoint)).near(p.project(new L.LatLng(0, 90)));
			expect(p.project(new L.LatLng(0, 495), magnetPoint)).near(p.project(new L.LatLng(0, 135)));
			expect(p.project(new L.LatLng(0, 540), magnetPoint)).near(p.project(new L.LatLng(0, 180)));
			magnetPoint = new L.Point(p.R * 3, 1);
			expect(p.project(new L.LatLng(0, -405), magnetPoint)).near(p.project(new L.LatLng(0, -45)));
			expect(p.project(new L.LatLng(0, -450), magnetPoint)).near(p.project(new L.LatLng(0, -90)));
			expect(p.project(new L.LatLng(0, -495), magnetPoint)).near(p.project(new L.LatLng(0, -135)));
			expect(p.project(new L.LatLng(0, -540), magnetPoint)).near(p.project(new L.LatLng(0, -180)));
			expect(p.project(new L.LatLng(0, 405), magnetPoint)).near(p.project(new L.LatLng(0, 45)));
			expect(p.project(new L.LatLng(0, 450), magnetPoint)).near(p.project(new L.LatLng(0, 90)));
			expect(p.project(new L.LatLng(0, 495), magnetPoint)).near(p.project(new L.LatLng(0, 135)));
			expect(p.project(new L.LatLng(0, 540), magnetPoint)).near(p.project(new L.LatLng(0, 180)));
			magnetPoint = new L.Point(p.R * -3, 1);
			expect(p.project(new L.LatLng(0, -405), magnetPoint)).near(p.project(new L.LatLng(0, -45)));
			expect(p.project(new L.LatLng(0, -450), magnetPoint)).near(p.project(new L.LatLng(0, -90)));
			expect(p.project(new L.LatLng(0, -495), magnetPoint)).near(p.project(new L.LatLng(0, -135)));
			expect(p.project(new L.LatLng(0, -540), magnetPoint)).near(p.project(new L.LatLng(0, -180)));
			expect(p.project(new L.LatLng(0, 405), magnetPoint)).near(p.project(new L.LatLng(0, 45)));
			expect(p.project(new L.LatLng(0, 450), magnetPoint)).near(p.project(new L.LatLng(0, 90)));
			expect(p.project(new L.LatLng(0, 495), magnetPoint)).near(p.project(new L.LatLng(0, 135)));
			expect(p.project(new L.LatLng(0, 540), magnetPoint)).near(p.project(new L.LatLng(0, 180)));
			magnetPoint = new L.Point(p.R * 0.1, 1);
			expect(p.project(new L.LatLng(0, -405), magnetPoint)).near(p.project(new L.LatLng(0, -45)));
			expect(p.project(new L.LatLng(0, -450), magnetPoint)).near(p.project(new L.LatLng(0, -90)));
			expect(p.project(new L.LatLng(0, -495), magnetPoint)).near(p.project(new L.LatLng(0, -135)));
			expect(p.project(new L.LatLng(0, -540), magnetPoint)).near(p.project(new L.LatLng(0, -180)));
			expect(p.project(new L.LatLng(0, 405), magnetPoint)).near(p.project(new L.LatLng(0, 45)));
			expect(p.project(new L.LatLng(0, 450), magnetPoint)).near(p.project(new L.LatLng(0, 90)));
			expect(p.project(new L.LatLng(0, 495), magnetPoint)).near(p.project(new L.LatLng(0, 135)));
			expect(p.project(new L.LatLng(0, 540), magnetPoint)).near(p.project(new L.LatLng(0, 180)));
			magnetPoint = new L.Point(p.R * -0.1, 1);
			expect(p.project(new L.LatLng(0, -405), magnetPoint)).near(p.project(new L.LatLng(0, -45)));
			expect(p.project(new L.LatLng(0, -450), magnetPoint)).near(p.project(new L.LatLng(0, -90)));
			expect(p.project(new L.LatLng(0, -495), magnetPoint)).near(p.project(new L.LatLng(0, -135)));
			expect(p.project(new L.LatLng(0, -540), magnetPoint)).near(p.project(new L.LatLng(0, -180)));
			expect(p.project(new L.LatLng(0, 405), magnetPoint)).near(p.project(new L.LatLng(0, 45)));
			expect(p.project(new L.LatLng(0, 450), magnetPoint)).near(p.project(new L.LatLng(0, 90)));
			expect(p.project(new L.LatLng(0, 495), magnetPoint)).near(p.project(new L.LatLng(0, 135)));
			expect(p.project(new L.LatLng(0, 540), magnetPoint)).near(p.project(new L.LatLng(0, 180)));
		});

	});
});

describe("Projection.SphericalMercator", function () {
	var p = L.Projection.SphericalMercator;

	describe("#project", function () {
		it("projects a center point", function () {
			// edge cases
			expect(p.project(L.latLng(0, 0))).near([0, 0]);
		});

		it("projects the northeast corner of the world", function () {
			expect(p.project(L.latLng(85.0511287798, 180))).near([20037508, 20037508]);
		});

		it("projects the southwest corner of the world", function () {
			expect(p.project(L.latLng(-85.0511287798, -180))).near([-20037508, -20037508]);
		});

		it("projects other points", function () {
			expect(p.project(L.latLng(50, 30))).near([3339584, 6446275]);

			// from https://github.com/Leaflet/Leaflet/issues/1578
			expect(p.project(L.latLng(51.9371170300465, 80.11230468750001)))
				.near([8918060.96409, 6788763.38325]);
		});
	});

	describe("#unproject", function () {
		function pr(point) {
			return p.project(p.unproject(point));
		}

		it("unprojects a center point", function () {
			expect(pr(L.point(0, 0))).near([0, 0]);
		});

		it("unprojects pi points", function () {
			expect(pr(L.point(-Math.PI, Math.PI))).near([-Math.PI, Math.PI]);
			expect(pr(L.point(-Math.PI, -Math.PI))).near([-Math.PI, -Math.PI]);

			expect(pr(L.point(0.523598775598, 1.010683188683))).near([0.523598775598, 1.010683188683]);
		});

		it('unprojects other points', function () {
			// from https://github.com/Leaflet/Leaflet/issues/1578
			expect(pr(L.point(8918060.964088084, 6755099.410887127)));
		});
	});
});
