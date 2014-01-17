$(document).ready(function() {

    /*  array that contains the short month names */
    var monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    
    /*  hiding the point display container initially    */
    $('.point-display-detail').css('display', 'none');
    
    /*  handling the close point detail click event */
    $('.close-point-detail').on('click', function(){
        $('.point-display-detail').css('display', 'none');
        $('#p.point-title').html('&nbsp;');
        $('p.point-subtitle').html('&nbsp;');
        $('p.point-address').html('&nbsp;');
        $('.point-image').html('&nbsp;');
    });
    /*  ----------------------------------------------------------------------  */
    /**
     * This function is used to draw a visualization pie chart.
     * 
     * @version     0.0.1
     * @since       0.0.1
     * @access      public
     * @param       array       arr_params      Array that contains the data to be plotted
     * @param       array       arr_key_name    Array that holds the name for the key in arr_params
     * @param       string      class_name      Name of the class for the map container
     * @param       int         counter         Total Number of entries, used to calculate the percentage contribution
     * @author      Maninder Singh              <manindersingh221@gmail.com>
     */
    function drawPieChart(arr_params, arr_key_name, class_name, counter_logging, counter_fix, sourceData) {

        var width = 450,
                height = 260,
                radius = 110,
                color = d3.scale.category20c();

        /*  array that holds the data for the visualization */
        var data = [];

        /*  reading individual values and pushing them in the data array */
        for (key in arr_params) {
            data.push({
                label: arr_key_name[key],
                value: (arr_params[key] / counter_logging) * 100,
                count: arr_params[key]
            });
        }
        /* sorting the array according to increasing value */
        data.sort(function(element_a, element_b) {
            return element_a['value'] - element_b['value'];
        });

        var vis = d3.select('.' + class_name)
                .append("svg:svg") //create the SVG element inside the desired container
                .data([data]) //associate our data with the document
                .attr("width", width) //set the width and height of our visualization
                .attr("height", height)
                .append("svg:g") //make a group to hold our pie chart
                .attr("transform", "translate(" + radius * 1.1 + "," + radius * 1.1 + ")") //move the center of the pie chart from 0, 0 to radius, radius

        var arc = d3.svg.arc() //this will create <path> elements for us using arc data
                .outerRadius(radius);

        var arcOver = d3.svg.arc()
                .innerRadius(10)
                .outerRadius(radius + 10);

        var pie = d3.layout.pie() //this will create arc data for us given a list of values
                .value(function(d) {
            return d.value;
        }); //we must tell it out to access the value of each element in our data array

        var arcs = vis.selectAll("g.slice") //this selects all <g> elements with class slice (there aren't any yet)
                        .data(pie) //associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties)
                        .enter() //this will create <g> elements for every "extra" data element that should be associated with a selection. The result is creating a <g> for every object in the data array
                        .append("svg:g") //create a group to hold each slice (we will have a <path> and a <text> element associated with each slice)
                        .attr("class", "slice") //allow us to style things in the slices (like text)
                        .on("mouseover", function(d) {
                            d3.select(this).select("path").transition()
                                .duration(200)
                                .attr("d", arcOver);

                            $('.' + class_name + '-hover-detail p.taskName').addClass('alert alert-warning').html('<strong>' + d3.select(this).datum().data.label + '</strong><br/><small>Count : ' + d3.select(this).datum().data.count + '</small>&nbsp;&nbsp;<small>Contribution(%) : ' + d3.select(this).datum().data.value.toFixed(2) + '%</small>');
                        })
                        .on("mouseout", function(d) {
                            d3.select(this).select("path").transition()
                                .duration(100)
                                .attr("d", arc);

                            $('.' + class_name + '-hover-detail p.taskName').removeClass('alert alert-warning').html('&nbsp;');
                        })
                        .on("click", function(d) {
                            var label = d3.select(this).datum().data.label
                            $('table.drill-down-data tbody').empty();
                            $('#detailInformation').empty();
                            for (var i = 1; i < sourceData.length; i++) {
                                var isFound = (sourceData[i][15].indexOf(label) > -1); //true
                                if (isFound) {
                                    var dateString = '';
                                    if (sourceData[i][3].length == 0) {
                                        dateString = 'Date not available';
                                    } else {
                                        var myDate = new Date(sourceData[i][3]);
                                        var currDate = myDate.getDate();
                                        var currMonth = myDate.getMonth();
                                        var currYear = myDate.getFullYear();
                                        dateString = currDate + ' ' + monthName[currMonth] + ', ' + currYear;
                                    }
                                    $('table.drill-down-data tbody').append('<tr><td>' + dateString + '</td>'
                                                                        + '<td>' + sourceData[i][8] + '</td>'
                                                                        + '<td>' + sourceData[i][11] + '</td>'
                                                                        + '<td>' + sourceData[i][15] + '</td>'
                                                                        + '<td><a href="mailto:' + sourceData[i][19] + '">' + sourceData[i][19] + '</a><input type="hidden" name="' + sourceData[i][18] + '" class="' + sourceData[i][16] + '" value="' + sourceData[i][17] + '"></td></tr>');
                                }
                            }
                            $("#myModal").modal('show');
                            $('.' + class_name + '-hover-detail p.taskName').removeClass('alert alert-warning').html('&nbsp;');
                        });

        arcs.append("svg:path")
                .attr("fill", function(d, i) {
                    return color(i);
                }) //set the color for each slice to be chosen from the color function defined above
                .attr("d", arc); //this creates the actual SVG path using the associated data (pie) with the arc drawing function

        arcs.append("svg:text") //add a label to each slice
                .attr("transform", function(d) { //set the label's origin to the center of the arc
                    //we have to make sure to set these before calling arc.centroid
                    d.innerRadius = 0;
                    d.outerRadius = radius;
                    return "translate(" + arc.centroid(d) + ")"; //this gives us a pair of coordinates like [50, 50]
                })
                .attr("text-anchor", "middle") //center the text on it's origin
                .text(function(d, i) {
                    return ' ';
                });

        /*  creating the legends  */
        var legend = d3.select('.' + class_name + '-legend')
                .append("svg")
                .attr("class", "legend")
                .attr("width", radius * 3)
                .attr("height", radius * 8)
                .selectAll("g")
                .data(color.domain().slice().reverse())
                .enter().append("g")
                .attr("transform", function(d, i) {
            return "translate(0," + i * 20 + ")";
        });

        legend.append("rect")
                .attr("width", 10)
                .attr("height", 10)
                .style("fill", color);

        legend.append("text")
                .attr("x", 18)
                .attr("y", 6)
                .attr("dy", ".35em")
                .text(function(d, i) {
            return data[i]['label'];
        });

        /*  Updating the counter detail */
        $('.tasksLoggedCount').html(counter_logging);
        $('.tasksFixitNumber').html(counter_fix);
    }

    /*    ----------------------------------------------------------------------  */
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
        $('#p.point-title').html(title);
        $('p.point-subtitle').html(subTitle);
        $('p.point-address').html('<b>Address : </b>' + address);
        $('.point-image').html(images);
        $('.point-display-detail').css('display', 'block');
        $('html,body').animate({
            scrollTop: $('.point-display-detail').offset().top - 30},
        'slow');
    }

    /*    ----------------------------------------------------------------------  */

    function drawDensityGraph() {

        var width = 500,
                height = 350;

        var projection = d3.geo.albersUsa()
                .scale(500)
                .translate([width / 2, height / 2]);

        var path = d3.geo.path()
                .projection(projection);

        var svg = d3.select('.density-map-container')
                .append("svg")
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
                    .attr("d", path);

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
                        .attr("r", 10)
                        .on("click", function(d) {
                    var geoLocation = d['location'];
                    var geoLocationArray = geoLocation.split(',');
                    var imagePath = d['Step-A16hHXuAAQ'];
                    if (imagePath.length === 0) {
                        var random_number = Math.floor(Math.random() * 40) + 1;
                        imagePath = './assets/images/real_images/image_' + random_number + '.jpg';
                        console.log(imagePath);
                    }
                    var pointTitle = d['Step-nMRZLHkGe9'];
                    var pointSubTitle = d['Step-yPinVKCMVS'];
                    var pointAddress = d['address'];
                    circleDetail(geoLocationArray[1], geoLocationArray[0], imagePath, d.taskId, pointTitle, pointSubTitle, pointAddress);
                });
            });
        });
    }

    /*  ----------------------------------------------------------------------  */

    /*  Reads data from the csv data file and group data accordingly    */
    d3.text('assets/csv/final_data.csv', 'text/csv', function(d) {

        var arr_left_params = [];
        var arr_right_params = [];
        var arr_key_name = [];
        var sourceData = d3.csv.parseRows(d);
        var counter_logging = 0;
        var counter_fix = 0;

        for (var i = 1; i < sourceData.length; i++) {
            if (sourceData[i][10] == 'Best Buy Display Issue Logging') {
                var operation = sourceData[i][15].split(',');
                var key1 = operation[0];
                var key2 = operation[1];
                if (key1.length > 0 && key2.length > 0) {
                    var left_key = key1.toLowerCase().replace(/ /g, '-');
                    var right_key = key2.toLowerCase().replace(/ /g, '-');

                    /*  checking if the left key exists in the key name array */
                    if (!arr_key_name.hasOwnProperty(left_key)) {
                        arr_key_name[left_key] = key1;
                    }
                    /*  checking if the right key exists in the key name array */
                    if (!arr_key_name.hasOwnProperty(right_key)) {
                        arr_key_name[right_key] = key2;
                    }

                    if (arr_left_params.hasOwnProperty(left_key)) {
                        arr_left_params[left_key] = arr_left_params[left_key] + 1;
                    } else {
                        arr_left_params[left_key] = 1;
                    }

                    if (arr_right_params.hasOwnProperty(right_key)) {
                        arr_right_params[right_key] = arr_right_params[right_key] + 1;
                    } else {
                        arr_right_params[right_key] = 1;
                    }
                    counter_logging++;
                }
            } else if (sourceData[i][10] == 'Fix Best Buy Display Issue' && sourceData[i][20] == 'Submitted') {
                counter_fix++;
            }
        }
        /*  calling the required function to draw the pie chart visualization   */
        drawPieChart(arr_left_params, arr_key_name, 'department-map-container', counter_logging, counter_fix, sourceData);
        drawPieChart(arr_right_params, arr_key_name, 'display-map-container', counter_logging, counter_fix, sourceData);
        drawDensityGraph();
    });

    /*  ----------------------------------------------------------------------  */
    /*    Icon Eye Open CLick Event   */
    $('body').on('click', '#informationListTable tbody tr', function() {
        var currentRow = $(this);
        $('#informationListTable tbody  tr').each(function() {
            if ($(this).hasClass('success')) {
                $(this).removeClass('success');
            }
        });
        currentRow.addClass('success');
        $('tr.temp-row').remove();
        var image1 = currentRow.find('input[type="hidden"]').attr('name');
        var image2 = currentRow.find('input[type="hidden"]').attr('value');
        var text1 = currentRow.find('input[type="hidden"]').attr('class');
        if (image1.length == 0 && image2.length == 0) {
            $('<tr class="temp-row"><td colspan="5"><p class="text-center"><strong>No information available.</strong><p></td></tr>').insertAfter(currentRow);
        } else {
            var newRowHtml = '<tr class="temp-row">'
                    + '<td colspan="2"><a href="' + image1 + '" target="_blank"><img src="' + image1 + '" style="height: 250px; width: 400px;" alt="image 1" /></a></td>'
                    + '<td colspan="2"><a href="' + image2 + '" target="_blank"><img src="' + image2 + '" style="height: 250px; width: 400px;" alt="image 2" /></a></td>'
                    + '<td><strong>Description : </strong>' + text1 + '</td>';
            +'</tr>';
            $(newRowHtml).insertAfter(currentRow);
        }
    });

    /*  ----------------------------------------------------------------------  */
    /*  Tasks Logged detail Click Event */
    $('body').on('click', '.loggedTaskDetail', function() {
        d3.text('assets/csv/final_data.csv', 'text/csv', function(d) {
            var sourceData = d3.csv.parseRows(d);
            /* Empty the table body */
            $('table.drill-down-data tbody').empty();
            $('#detailInformation').empty();
            var lastFlag = false;
            var dateString = '';
            for (var i = 1; i < sourceData.length; i++) {
                if (sourceData[i][10] == 'Best Buy Display Issue Logging') {
                    if (sourceData[i][3].length == 0) {
                        dateString = 'Date not available';
                    } else {
                        var myDate = new Date(sourceData[i][3]);
                        var currDate = myDate.getDate();
                        var currMonth = myDate.getMonth();
                        var currYear = myDate.getFullYear();
                        dateString = currDate + ' ' + monthName[currMonth] + ', ' + currYear;
                    }
                    $('table.drill-down-data tbody').append('<tr><td>' + dateString + '</td>'
                            + '<td>' + sourceData[i][8] + '</td>'
                            + '<td>' + sourceData[i][11] + '</td>'
                            + '<td>' + sourceData[i][15] + '</td>'
                            + '<td><a href="mailto:' + sourceData[i][19] + '">' + sourceData[i][19] + '</a><input type="hidden" name="' + sourceData[i][18] + '" class="' + sourceData[i][16] + '" value="' + sourceData[i][17] + '"></td></tr>');
                }
                if (i == sourceData.length - 1) {
                    lastFlag = true;
                }
            }
            if (lastFlag) {
                $('#myModal').modal('show');
            }
        });
    });

    /*  ----------------------------------------------------------------------  */
});