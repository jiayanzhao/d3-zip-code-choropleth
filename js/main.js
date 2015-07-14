(function chart() {

  var width = 1000,
      height = 1200,
      centered;

  var rateById = d3.map();

  var quantize = d3.scale.quantize()
      .domain([0, 100000])
      .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));

  var projection = d3.geo.albersUsa()
      .scale(6000)
      .translate([2300, 680]);

  var path = d3.geo.path()
      .projection(projection);

  var svg = d3.select("#ca-chart").append("svg")
      .attr("width", width)
      .attr("height", height);

  var tooltip = d3.select("#ca-chart").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

  svg.append("rect")
      .attr("class", "background")
      .attr("width", width)
      .attr("height", height)
      .on("click", clicked);

  var g = svg.append("g");

  queue()
      .defer(d3.json, "../shapefile/foo.topojson")
      // .defer(d3.json, "../data/zip_code_crs84.topojson")
      .defer(d3.csv, "../data/ca_population_2010.csv", function(d) { rateById.set(d.zip.toString(), +d.population); })
      .await(ready);

  function ready(error, zipcode) {
    // var features = topojson.feature(zipcode, zipcode.objects.zip_code_crs84).features;

    g.append("g")
        .attr("class", "state")
      .selectAll("path")
        .data(topojson.feature(zipcode, zipcode.objects.state).features)
      .enter().append("path")
        .attr("d", path)
        .attr("stroke", "#333")
        .attr("stroke-width", "1.5px")
        .attr("fill", "#fff");

    var features = topojson.feature(zipcode, zipcode.objects.zip).features;

    g.append("g")
        .attr("class", "zipcodes")
      .selectAll("path")
        .data(features)
      .enter().append("path")
        .attr("class", getColorClass)
        .attr("d", path)
        .on("click", clicked)
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);
  }

  function getColorClass(d) {
    return quantize(rateById.get(d.properties.zipcode));
  }

  function getPopulation(d) {
    return rateById.get(getZip(d)).toString();
  }

  function getZip(d) {
    return d && d.properties ? d.properties.zipcode : null;
  }

  function mouseout(d) {
    d3.select(this)
        .style("stroke", null);

    tooltip.transition()
        .duration(250)
        .style("opacity", 0);
  }

  function mouseover(d) {
    d3.select(this.parentNode.appendChild(this))
        .style("stroke", "#F00");

    tooltip.transition()
        .duration(250)
        .style("opacity", 1);

    tooltip
        .html("<p><strong>Zipcode: " + getZip(d) + "<br>Population: "  + getPopulation(d) + "</strong></p>")
        .style("left", (d3.event.pageX + 25) + "px")
        .style("top",  (d3.event.pageY - 28) + "px");
    }

  function clicked(d) {
    var x, y, k;

    if (d && centered !== d) {
      var centroid = path.centroid(d);
      x = centroid[0];
      y = centroid[1];
      k = 8;    // control zoom depth
      centered = d;
    } else {
      x = width / 2;
      y = height / 2;
      k = 1;
      centered = null;
    }

    g.selectAll("path")
        .classed("active", centered && function(d) { return d === centered; });

    g.transition()
        .duration(750)
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
        .style("stroke-width", 1.5 / k + "px");
  }

  d3.select(self.frameElement).style("height", height + "px");

}());
