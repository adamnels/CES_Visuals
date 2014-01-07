var width = 960,
    height = width / 2;

var opacity = d3.scale.linear()
    .domain([0, 24*3600*1000])
    .range([1, 0.5]);

var radius = d3.scale.threshold()
            .domain([1, 10, 100, 300, 500, 1000])
            .range([1, 2, 5, 8, 10, 12]);
        /*.linear()
    .domain([0, 250])
    .range([0, 20]);*/

var projection = d3.geo.naturalEarth()
    .translate([width/2, height/2])
    .scale(150/900*width);

var path = d3.geo.path()
    .projection(projection);

var graticule = d3.geo.graticule();

var svg = d3.select("#map")
    .attr("width", width)
    .attr("height", height);

svg.append("path")
    .datum(graticule.outline)
    .attr("class", "water")
    .attr("d", path);

svg.append("g")
    .attr("class", "graticule")
  .selectAll("path")
    .data(graticule.lines)
  .enter().append("path")
    .attr("d", path);

var focus = svg.append("text")
    .attr("class", "focus");

d3.json("assets/json/world-110m.json", function(error, world) {

  svg.insert("path", ".graticule")
      .datum(topojson.object(world, world.objects.land))
      .attr("class", "land")
      .attr("d", path);

  svg.insert("path", ".graticule")
      .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a.id !== b.id; }))
      .attr("class", "borders")
      .attr("d", path);

});

d3.json('assets/json/tectonics.json', function(err, data) {

  svg.insert("path", ".graticule")
      .datum(topojson.object(data, data.objects.tec))
      .attr("class", "tectonic")
      .attr("d", path);

});

/*d3.text('assets/csv/csc_launch_param.csv', 'text/csv', function(d){
    var totalEntry = d3.csv.parseRows(d);
    //for(var i = 1; i < 5; i++){
        console.log('lat',totalEntry[i][1],'long',totalEntry[i][0]);
        //var arr_datum = [totalEntry[i][1],totalEntry[i][0]]
        var quakes = svg.append("g")
                        .attr("class", "quakes")
                        .data(totalEntry)
                        .selectAll(".quake")
                        .append("g")
                        .attr("class", "quake")
                        .attr("transform", function(){
                            return "translate("+projection(totalEntry[i][1])+","+projection(totalEntry[i][0]) +")";
                         })
                        .attr("opacity", 0.5)
                        .on("mouseover", function(){
                            focus.style("opacity", 1);
                         })
                        .on("mouseout", function(){
                            focus.style("opacity", 0);
                         });
                         
               quakes.append("circle")
                     .attr("r", 5)
                     .style("fill", function() {
                            return "rgb(222, 45, 38)"; // color( +d.geometry.coordinates[2] );
                     });

            setInterval(function() {
                    quakes.append("circle")
                          .attr("r", 0)
                          .style("stroke", function() {
                            return "rgb(222, 45, 38)"; // color( +d.geometry.coordinates[2] );
                           })
                          .style("stroke-width", 2)
                          .transition()
                          .ease("linear")
                          .duration(function() { return 125*radius(totalEntry[i][2]); })
                          .attr("r", function() { return 3*radius(totalEntry[i][2]); })
                          .style("stroke-opacity", 0)
                          .style("stroke-width", 0)
                          .remove();
            }, 1000);
    //}
});*/

//d3.json('assets/json/geo_feed.json', function(err, data) {
d3.text('assets/csv/csc_launch_param.csv', 'text/csv', function(d) {

    var data = d3.csv.parseRows(d);
    var quakes = svg.append("g")
            .attr("class", "quakes")
            .selectAll(".quake")
            .data(data)
            //.data(data.features.reverse())
            .enter().append("g")
            .attr("class", "quake")
            .attr("transform", function(d) {
        //console.log(d[0]);
                return "translate(" + projection([d[1],d[0],d[2]])[0] + "," + projection([d[1],d[0],d[2]])[1] + ")";
            })
            .attr("opacity", function(d) {
                return 0.5;
            })
            .on("mouseover", function() {
                focus.style("opacity", 1);
            })
            .on("mouseout", function() {
                focus.style("opacity", 0);
            })
            /*.on("mousemove", function(d) {
                var o = projection(d.geometry.coordinates);
        focus
                .text(d.properties.mag + ' ' + moment(+d.properties.time).calendar())
                .attr("dy", +20)
                .attr("text-anchor", "middle")
                .attr("transform", "translate(" + o[0] + "," + o[1] + ")");
    })*/
            ;

    quakes.append("circle")
            .attr("r", 5)
            .style("fill", function(d) {
        return "rgb(222, 45, 38)"; // color( +d.geometry.coordinates[2] );
    });

    setInterval(function() {

        quakes.append("circle")
                .attr("r", 0)
                .style("stroke", function(d) {
                    return "rgb(222, 45, 38)"; // color( +d.geometry.coordinates[2] );
                })
                .style("stroke-width", 2)
                .transition()
                .ease("linear")
                .duration(function(d) {
                    console.log(radius(d[2]));
                    
                    //console.log('d2',d[2],'radius',radius(d[2]));
                    return 2 * radius(d[2]);
                })
                .attr("r", function(d) {
                    return 1 * radius(d[2]);
                })
                .style("stroke-opacity", 0)
                .style("stroke-width", 0)
                .remove();

    }, 1000);

});