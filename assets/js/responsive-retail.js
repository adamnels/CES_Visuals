$(document).ready(function() {

    /**
     * This function is used to show the clicked point details in the modal dialog
     * box.
     * 
     * @param   string          lon         Geographical longitude co-ordinate
     * @param   string          lat         Geographical latitude co-ordinate
     * @param   string          url         Image path
     * @param   string          imageAlt    Image alt text
     * @param   string          title       Title Text 1
     * @param   string          subtitle    Title Text 2
     * @param   string          address     Address for the point plotted
     * @author  Maninder Singh              <manindersingh221@gmail.com>
     */
    function circleDetail(lon, lat, url, imageAlt, title, subTitle, address) {
        images = "<a href = 'http://www.ahextechnologies.com'>\n\
                <img src='" + url + "' alt='" + imageAlt + "' height='220' width='220'></a>";
        //$("#dialog p").html("I am plotted at " + lon + " , " + lat);
        $("#dialog p.dialog-title").html(title);
        $("#dialog p.dialog-subtitle").html(subTitle);
        $('#dialog p.dialog-address').html('<b>Address : </b>' + address);
        $("#dialog .pointImage").html(images);
        $(function() {
            $("#dialog").dialog();
        });
    }

    /* ---------------------------------------------------------------------- */
    /**
     * 
     * @param {type} d
     * @returns {undefined}
     */
    function clicked(d) {
        var centroid = path.centroid(d),
                translate = projection.translate();

        projection.translate([
            translate[0] - centroid[0] + width / 2,
            translate[1] - centroid[1] + height / 2
        ]);
    }

    /* ---------------------------------------------------------------------- */

    var width = 960,
            height = 500;

    var projection = d3.geo.albersUsa()
            .scale(1070)
            .translate([width / 2, height / 2]);

    var path = d3.geo.path()
            .projection(projection);

    var svg = d3.select('div.body-container').append("svg")
            .attr("width", width)
            .attr("height", height);

    var g = svg.append("g");

    g.append("rect")
            .attr("class", "background")
            .attr("width", width)
            .attr("height", height);

    d3.json("assets/json/us-10m.json", function(error, us) {
        g.append("g")
                .attr("id", "states")
                .selectAll("path")
                .data(topojson.feature(us, us.objects.counties).features)
                .enter().append("path")
                .attr("d", path)
                .on("click", clicked);

        g.append("path")
                .datum(topojson.mesh(us, us.objects.states, function(a, b) {
                    return a !== b;
                }))
                .attr("id", "state-borders")
                .attr("d", path);

        /* Read data from the csv file and plot the points on the us map respectively */
        d3.csv("assets/csv/live_data_1.csv", function(data) {
            dataset = data.map(function(d) {
                var geoLocation = d['location'];
                var geoLocationArray = geoLocation.split(',');
                return [geoLocationArray[0], geoLocationArray[1]];
            });

            g.selectAll("circle")
                    .data(data)
                    .enter()
                    .append("circle")
                    .attr("cx", function(d) {
                        var geoLocation = d['location'];
                        var geoLocationArray = geoLocation.split(',');
                        return projection([geoLocationArray[1], geoLocationArray[0]])[0];
                    })
                    .attr("cy", function(d) {
                        var geoLocation = d['location'];
                        var geoLocationArray = geoLocation.split(',');
                        return projection([geoLocationArray[1], geoLocationArray[0]])[1];
                    })
                    .attr("class", "circle_point")
                    .style("fill", "red")
                    .attr("r", 0)
                    .transition().duration(0)
                    .delay(function(d, i) {
                        return i * 1500;
                    })
                    .attr("r", 10)

                    .style("fill", "red")
                    .attr("r", 0)
                    .transition().duration(0)
                    .delay(function(d, i) {
                        return i * 2500;
                    })
                    .attr("r", 10)
                    .each("end", function(d, i) {
                        var geoLocation = d['location'];
                        var geoLocationArray = geoLocation.split(',');
                        //var imagePath = d['Step-DH2xFtbngA'];
                        var imagePath = d['Step-A16hHXuAAQ'];
                        if (imagePath.length === 0) {
                            var random_number =Math.floor(Math.random() * 40) + 1;
                            imagePath = './assets/images/real_images/image_'+random_number+'.jpg';
                            console.log(imagePath);
                        }
                        var pointTitle = d['Step-nMRZLHkGe9'];
                        var pointSubTitle = d['Step-yPinVKCMVS'];
                        var pointAddress = d['address'];
                        circleDetail(geoLocationArray[1], geoLocationArray[0], imagePath, d.taskId, pointTitle, pointSubTitle, pointAddress);
                    });
        });
    });
});