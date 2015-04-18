//noinspection ThisExpressionReferencesGlobalObjectJS
_.extend(this, d3c.common());

describe("parses csv string with date as key", function () {
    it("", function() {
        var data = parseDateBasedCsv(csv);

        expect(data[0]).toEqual({ date: date("18/01/2013"), java: 3, xml: 33, txt: 333 });
        expect(data[1]).toEqual({ date: date("19/01/2013"), java: 2, xml: 22, txt: 222 });
        expect(data[2]).toEqual({ date: date("20/01/2013"), java: 1, xml: 11, txt: 111 });
    });
});

describe("data source", function () {
    it("notifies listeners with data, key and categories", function() {
        var dataSource = newDataSource(data, "date");
        var received = captureUpdateOf(dataSource);

        dataSource.sendUpdate();

        expect(received()).toEqual({
            data: data,
            key: "date",
            categories: ['java', 'xml', 'txt']
        })
    });

    it("can switch between two delegate data sources", function() {
        var dataSource = dataSourceSwitcher([newDataSource(dataArray[0], "date"), newDataSource(dataArray[1], "date")]);
        var received = captureUpdateOf(dataSource);

        dataSource.sendUpdate();
        expect(received().dataSourceIndex).toEqual(0);
        expect(received().data).toEqual(dataArray[0]);

        dataSource.setDataSourceIndex(1);
        expect(received().dataSourceIndex).toEqual(1);
        expect(received().data).toEqual(dataArray[1]);
    });

    it("can exclude categories", function() {
        var dataSource = withCategoryExclusion(newDataSource(data, "date"));
        var received = captureUpdateOf(dataSource);

        dataSource.sendUpdate();
        expect(received().data).toEqual(data);
        expect(received().categories).toEqual(["java", "xml", "txt"]);

        dataSource.excludeCategory("txt");
        expect(received().data).toEqual(data);
        expect(received().categories).toEqual(["java", "xml"]);
    });

    it("can group data by time", function() {
        var dataSource = groupedBy(d3time([d3.time.day, d3.time.monday, d3.time.month]), newDataSource(data, "date"));
        var received = captureUpdateOf(dataSource);

        dataSource.sendUpdate();
        expect(received().groupByIndex).toEqual(0);
        expect(received().data).toEqual(data);

        dataSource.groupBy(1);
        expect(received().groupByIndex).toEqual(1);
        expect(received().data).toEqual([{ date: date("14/01/2013"), java: 6, xml: 66, txt: 666 }]);

        dataSource.groupBy(2);
        expect(received().groupByIndex).toEqual(2);
        expect(received().data).toEqual([{ date: date("01/01/2013"), java: 6, xml: 66, txt: 666 }]);
    });

    it("sends min and max of categories total in all rows", function() {
        var dataSource = withMinMaxKey(
            clampedMin(0, withMinMax("_total_",
            withRowTotal("_total_",
            newDataSource(parseDateBasedCsv(csvArray[0]), "date"
        )))));
        var received = captureUpdateOf(dataSource);

        dataSource.sendUpdate();

        expect(received().min.date).toEqual(date("18/01/2013"));
        expect(received().max.date).toEqual(date("20/01/2013"));
        expect(received().min["_total_"]).toEqual(0);
        expect(received().max["_total_"]).toEqual(3 + 33 + 333);
    });

    it("can have data auto-grouped on first update", function() {
        var dataAmountThreshold = 1;
        var dataSource = autoGroupOnFirstUpdate(dataAmountThreshold, withMinMaxKey(
            groupedBy(d3time([d3.time.day, d3.time.monday, d3.time.month]), newDataSource(data, "date"))
        ));
        var received = captureUpdateOf(dataSource);

        dataSource.sendUpdate();

        expect(received().groupByIndex).toEqual(2);
    });


    it("sends min and max of all categories in all rows", function() {
        var dataSource = withMinMaxKey(withMinMaxOfRow(
            newDataSource(parseDateBasedCsv(csvArray[0]), "date"
        )));
        var received = captureUpdateOf(dataSource);

        dataSource.sendUpdate();

        expect(received().min["value"]).toEqual(1);
        expect(received().max["value"]).toEqual(333);
    });

    it("when percentile is set, sends update with filtered data", function() {
        var data = filteredByPercentile("_total_",
            withRowTotal("_total_",
            newDataSource(parseDateBasedCsv(csvArray[0]), "date"
        )));
        var received = captureUpdateOf(data);

        data.sendUpdate();
        expect(received().percentile).toEqual(1.0);
        expect(received().data.length).toEqual(3);

        data.setPercentile(0.5);
        expect(received().percentile).toEqual(0.5);
        expect(received().data.length).toEqual(2);
        expect(received().data[0].date).toEqual(date("19/01/2013"));
        expect(received().data[1].date).toEqual(date("20/01/2013"));
    });
});

describe("x scale", function () {
    it("sends update when its domain is changed", function() {
        var x = newTimeScale("date").rangeRound([0, 100]);
        var received = captureUpdateOf(x);
        x.update({ key: "date", min: {date: date("20/04/2011")}, max: {date: date("30/04/2011")} });

        x.setDomain([date("20/04/2011"), date("25/04/2011")]);

        expect(received().domain()).toEqual([date("20/04/2011"), date("25/04/2011")]);
    });
});

describe("grouping by d3 time", function() {
    it("", function() {
        var times = d3time([d3.time.day, d3.time.monday]);
        var byDay = times[0];
        var byWeek = times[1];

        expect(byDay.size.getTime()).toEqual(1000 * 60 * 60 * 24);
        expect(byWeek.size.getTime()).toEqual(1000 * 60 * 60 * 24 * 7);

        expect(byDay.floor(date("18/01/2013"))).toEqual(date("18/01/2013"));
        expect(byWeek.floor(date("18/01/2013"))).toEqual(date("14/01/2013"));
        expect(byWeek.floor(date("14/01/2013"))).toEqual(date("14/01/2013"));

        expect(byDay.nextFloor(date("18/01/2013"))).toEqual(date("19/01/2013"));
        expect(byWeek.nextFloor(date("18/01/2013"))).toEqual(date("21/01/2013"));
        expect(byWeek.nextFloor(date("21/01/2013"))).toEqual(date("28/01/2013"));
    })
});

function date(s) {
    return d3.time.format("%d/%m/%Y").parse(s);
}

function captureUpdateOf(observable) {
    var received;
    observable.onUpdate(function(it) {
        received = it;
    });
    return function() {
        return received;
    }
}

var csvArray = ["\
date,java,xml,txt\n\
18/01/2013,3,33,333\n\
19/01/2013,2,22,222\n\
20/01/2013,1,11,111\n\
",
"date,java,xml,txt\n\
18/01/2013,33,333,3333\n\
19/01/2013,22,222,2222\n\
20/01/2013,11,111,1111\n\
"];
var csv = csvArray[0];
var dataArray = csvArray.map(function(it) {
    return parseDateBasedCsv(it);
});
var data = dataArray[0];
