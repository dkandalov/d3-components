//noinspection ThisExpressionReferencesGlobalObjectJS
_.extend(this, d3c.common());
//noinspection ThisExpressionReferencesGlobalObjectJS
_.extend(this, d3c.seriesCharts());

describe("series chart", function () {
	var root, uiConfig, dataSource, x, y;
	beforeEach(function() {
		root = d3.select("body").append("svg").attr("id", "series-chart-test");
		uiConfig = { width: 1000, height: 500, color: d3.scale.category10() };
        dataSource = withSeriesData(
            withMinMaxKey(withMinMaxOfRow(
            groupedBy(d3time([d3.time.monday, d3.time.month]),
            withFirstCategories(5, withCategoryExclusion(
            newDataSource(data, "date")
        ))))));
        x = newTimeScale("date").nice().rangeRound([0, uiConfig.width]);
        y = newScale("value").range([uiConfig.height, 0]);
    });
	afterEach(function() {
		root.remove();
	});

	it("adds line elements to svn root", function() {
		var lineSeries = newLineSeries(root, x, y, uiConfig);
		dataSource.onUpdate([x.update, y.update, lineSeries.update]);

		dataSource.sendUpdate();

		expect(root.selectAll(".series")[0].length).toEqual(3);
		expect(root.selectAll(".series .line")[0].length).toEqual(3);
        root.selectAll(".series .line")[0].map(function(it) {
			expect(parseInt(offsetWidth(it))).toBeGreaterThan(0);
			expect(parseInt(offsetWidth(it))).toBeLessThan(uiConfig.width + 1);
			expect(parseInt(offsetHeight(it))).toBeGreaterThan(0);
			expect(parseInt(offsetHeight(it))).toBeLessThan(uiConfig.height + 1);
		});
	});
});
