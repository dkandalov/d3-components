//noinspection ThisExpressionReferencesGlobalObjectJS
_.extend(this, d3c.common());
//noinspection ThisExpressionReferencesGlobalObjectJS
_.extend(this, d3c.barCharts());

describe("'nothing to show' label", function () {
	var root, svgRoot, uiConfig;
	beforeEach(function() {
		root = d3.select("body").append("span").attr("id", "tooltip-test");
		svgRoot = root.append("svg");
		uiConfig = { width: 1000, height: 500, margin: {left: 0, top: 0} };
	});
	afterEach(function() {
		root.remove();
	});

	it("becomes visible if there is no data", function() {
		var label = newEmptyChartLabel(root, svgRoot, uiConfig);

		label.update({ data: [1, 2, 3] });
		expect(root.select("div")[0][0].getAttribute("style")).toContain("opacity: 0");

		label.update({ data: [] });
		expect(root.select("div")[0][0].getAttribute("style")).toContain("opacity: 0.9");
	});
});

describe("tooltip", function () {
	var root, svgRoot, uiConfig;
	beforeEach(function() {
		root = d3.select("body").append("span").attr("id", "tooltip-test");
		svgRoot = root.append("svg");
		uiConfig = { width: 1000, height: 500, margin: {left: 0, top: 0} };
	});
	afterEach(function() {
		root.remove();
	});

	it("becomes visible on non-null update", function(done) {
        var getTooltipText = function(it) { return "some text: " + it.value; };
        var tooltip = newBarTooltip(root, svgRoot, uiConfig, {delay: 0, delayBeforeHide: 0}, getTooltipText);
		expect(root.select("div")[0][0].getAttribute("style")).toContain("opacity: 0");

		var bar = document.createElement('rect');
		tooltip.update({
			bar: bar,
			value: 123,
			date: date("23/10/2011"),
			category: "java"
		});

		setTimeout(function() {
			expect(getComputedStyle(root.select("div")[0][0]).opacity).toBeGreaterThan(0);
            done();
		}, 20);
	});
});

describe("bars", function () {
	var root, uiConfig, dataSource, x, y;
	beforeEach(function() {
		root = d3.select("body").append("svg").attr("id", "bars-test");
		uiConfig = { width: 1000, height: 500 };
		dataSource = newStackedDataSource(csvArray);
        x = newTimeScale("date").rangeRound([0, uiConfig.width]);
        y = newScale(dataSource.rowTotal).range([uiConfig.height, 0]);
    });
	afterEach(function() {
		root.remove();
	});

	it("add rects to svg root", function() {
		var bars = newBars(root, uiConfig, x, y, "bars");
		dataSource.onUpdate([x.update, y.update, bars.update]);

		dataSource.sendUpdate();

		expect(root.selectAll(".layer-bars")[0].length).toEqual(3);
		expect(root.selectAll(".layer-bars rect")[0].length).toEqual(9);
		root.selectAll(".layer-bars rect")[0].map(function(it) {
			expect(parseInt(it.attributes["width"].value)).toBeGreaterThan(0);
			expect(parseInt(it.attributes["width"].value)).toBeLessThan(uiConfig.width + 1);
			expect(parseInt(it.attributes["height"].value)).toBeGreaterThan(0);
			expect(parseInt(it.attributes["height"].value)).toBeLessThan(uiConfig.height + 1);
		});
	});

	it("on data update replaces svg rects with new ones according to new data", function() {
		function allRectsHeight() {
			var allRects = root.selectAll(".layer-bars rect")[0];
			return _.reduce(allRects, function(acc, it){ return acc + parseInt(it.attributes["height"].value); }, 0);
		}
		var bars = newBars(root, uiConfig, x, y, "bars");
		dataSource.onUpdate([x.update, y.update, bars.update]);

		dataSource.sendUpdate();
		expect(allRectsHeight()).toEqual(995);

		dataSource.setDataSourceIndex(1);
		expect(allRectsHeight()).toEqual(997);
	});

	it("on data update sends categories and their colors to listeners", function() {
		var bars = newBars(root, uiConfig, x, y, "bars");
		dataSource.onUpdate([x.update, y.update, bars.update]);
		var received = captureUpdateOf(bars);

		dataSource.sendUpdate();

		expect(received()).toEqual([
			{category: "java", color: '#1f77b4'},
			{category: "xml", color: '#aec7e8'},
			{category: "txt", color: '#ff7f0e'}
		]);
	});
});

describe("stacked bar chart data", function () {
	it("sends update with stacked data", function() {
        var data = withStackedData(newDataSource(parseDateBasedCsv(csvArray[0]), "date"));
        var received = captureUpdateOf(data);

		data.sendUpdate();

		expect(received().dataStacked.length).toEqual(3);
		expect(received().dataStacked[0][0]).toEqual({ category: "java", x: date("18/01/2013"), y: 1, y0: 0 });
		expect(received().dataStacked[1][0]).toEqual({ category: "xml", x: date("18/01/2013"), y: 11, y0: 1 });
		expect(received().dataStacked[2][0]).toEqual({ category: "txt", x: date("18/01/2013"), y: 111, y0: 1 + 11 });
		expect(received().dataStacked[0][1]).toEqual({ category: "java", x: date("19/01/2013"), y: 2, y0: 0 });
		expect(received().dataStacked[1][1]).toEqual({ category: "xml", x: date("19/01/2013"), y: 22, y0: 2 });
		expect(received().dataStacked[2][1]).toEqual({ category: "txt", x: date("19/01/2013"), y: 222, y0: 2 + 22 });
	});

	it("sends empty update when input is empty", function() {
		var data = withStackedData(newDataSource(parseDateBasedCsv("date,category,value\n\n"), "date"));
		var received = captureUpdateOf(data);

		data.sendUpdate();

		expect(received().dataStacked.length).toEqual(0);
	});
});

describe("moving average line", function() {
	var root, uiConfig, data, x, y;
	beforeEach(function() {
		root = d3.select("body").append("span").attr("id", "bars-test");
		uiConfig = { width: 1000, height: 500 };
		data = newStackedDataSource(csvArray);
        x = newTimeScale("date").rangeRound([0, uiConfig.width]);
        y = newScale(data.rowTotal).range([uiConfig.height, 0]);
    });
	afterEach(function() {
		root.remove();
	});

	it("on data update adds svg line to root element", function() {
		var movingAverage = newMovingAverageLine(root, uiConfig, x, y, "movingAverage");
		movingAverage.setVisible(true);
		data.onUpdate(movingAverage.update);

		data.sendUpdate();

		expect(root.selectAll(".line-movingAverage")[0].length).toEqual(1);
	});

	it("can become invisible", function() {
		var movingAverage = newMovingAverageLine(root, uiConfig, x, y, "movingAverage");
		movingAverage.setVisible(true);
		data.onUpdate(movingAverage.update);

		data.sendUpdate();

		expect(root.selectAll(".line-movingAverage")[0].length).toEqual(1);
		movingAverage.setVisible(false);
		expect(root.selectAll(".line-movingAverage")[0].length).toEqual(0);
	});
});

describe("calculating moving average for timed values", function () {
	var getDate = function(it) { return it.date; };
	var getValue = function(it) { return it.value; };

	it("for three day interval", function() {
        var floor = d3.time.day.floor;
        var nextFloor = function(value) {
            return d3.time.day.floor(d3.time.day.offset(value, 1));
        };
		var movingAverageOfThreeDays = function(data) {
			return movingAverageForTimedValues(data, floor, nextFloor, getDate, getValue, 3);
		};

		expect(movingAverageOfThreeDays([
			{date: date("01/01/2010"), value: 10},
			{date: date("02/01/2010"), value: 10}
		])).toEqual([]);

		expect(movingAverageOfThreeDays([
			{date: date("01/01/2010"), value: 11},
			{date: date("03/01/2010"), value: 13},
			{date: date("04/01/2010"), value: 5}
		])).toEqual([
			{date: date("03/01/2010"), mean: (11 + 13) / 3},
			{date: date("04/01/2010"), mean: (13 + 5) / 3}
		]);
	});

	it("for three month interval", function() {
        var floor = d3.time.month.floor;
        var nextFloor = function(value) {
            return d3.time.month.floor(d3.time.month.offset(value, 1));
        };
        var movingAverageOfThreeWeeks = function(data) {
			return movingAverageForTimedValues(data, floor, nextFloor, getDate, getValue, 3);
		};

		expect(movingAverageOfThreeWeeks([
			{date: date("01/01/2010"), value: 10},
			{date: date("01/02/2010"), value: 10}
		])).toEqual([]);

		expect(movingAverageOfThreeWeeks([
			{date: date("01/01/2010"), value: 10},
			{date: date("01/02/2010"), value: 10},
			{date: date("01/03/2010"), value: 10},
			{date: date("01/04/2010"), value: 40}
		])).toEqual([
			{date: date("01/03/2010"), mean: 10},
			{date: date("01/04/2010"), mean: 20}
		]);
	});
});


describe("total amount label", function() {
	var root, svgRoot, uiConfig, data, x;
	beforeEach(function() {
		root = d3.select("body").append("span").attr("id", "total-amount-test");
		svgRoot = root.append("svg");
		uiConfig = { width: 1000, height: 500, margin: {left: 123} };
		x = newTimeScale("date").nice().rangeRound([0, uiConfig.width]);
		data = newStackedDataSource(csvArray);
	});
	afterEach(function() {
		root.remove();
	});

	it("on update adds label to root element", function() {
		var totalAmountLabel = newTotalAmountLabel(root, "Total amount: ");
		x.onUpdate(totalAmountLabel.onXScaleUpdate);
		data.onUpdate(totalAmountLabel.update);

		x.setDomain([date("18/01/2013"), date("21/01/2013")]);
		data.sendUpdate();

		expect(root.selectAll("label")[0].length).toEqual(2);
		expect(root.selectAll("label")[0][0].innerText).toEqual("Total amount: ");
        expect(root.selectAll("label")[0][1].innerText).toEqual(1 + 2 + 3 + 11 + 22 + 33 + 111 + 222 + 333 + "");
	});
});

describe("utilities", function() {
	it("can shade color", function() {
		expect(shadeColor("#111111", -0.15)).toEqual("#0e0e0e");
		expect(shadeColor("rgb(31, 119, 180)", -0.15)).toEqual("#1a6599");
	})
});
