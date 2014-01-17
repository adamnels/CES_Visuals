$(document).ready(function() {

    /**
     * 
     * @param {type} error
     * @param {type} us
     * @param {type} rate
     * @returns {undefined}
     */
    function ready(error, us, rate) {
        var rateById = {};

        rate.forEach(function(d) {
            rateById[d.id] = +d.rate;
        });

        svg.append("g")
                .attr("class", "counties")
                .selectAll("path")
                .data(topojson.feature(us, us.objects.counties).features)
                .enter().append("path")
                .attr("d", path)
                .style("fill", function(d) {
            if (color(rateById[d.id])) {
                return color(rateById[d.id]);
            } else {
                return "rgb(222,235,247)";
            }
        });

        svg.append("path")
                .datum(topojson.mesh(us, us.objects.states, function(a, b) {
            return a.id !== b.id;
        }))
                .attr("class", "states")
                .attr("d", path);
    }

    /* ----------------------------------------------------------------------- */
    var width = 960,
            height = 500;

    var color = d3.scale.threshold()
            .domain([0001, 0010, 0020, 0030, 0040, 0050])
            .range(["rgb(247,251,255)", "rgb(107,174,214)", "rgb(66,146,198)", "rgb(33,113,181)", "rgb(8,81,156)", "rgb(8,48,107)"]);

    var path = d3.geo.path();

    var svg = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height);

    queue()
            .defer(d3.json, "assets/json/us-10m.json")
            .defer(d3.csv, "assets/csv/us-county-names.csv")
            .await(ready);
});