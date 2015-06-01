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


  svg.append("rect")
      .attr("class", "background")
      .attr("width", width)
      .attr("height", height)
      .on("click", clicked);

  var g = svg.append("g");

  queue()
      .defer(d3.json, "../data/zip_code_crs84.topojson")
      .defer(d3.csv, "../data/ca_population_2010.csv", function(d) { rateById.set(d.zip.toString(), +d.population); })
      .await(ready);

  function ready(error, zipcode) {
    g.append("g")
        .attr("class", "zipcodes")
      .selectAll("path")
        .data(topojson.feature(zipcode, zipcode.objects.zip_code_crs84).features)
      .enter().append("path")
        .attr("class", function(d) { return quantize(rateById.get(d.properties.zipcode)); })
        .attr("d", path)
        .on("click", clicked);
  }

  function clicked(d) {
    var x, y, k;

    if (d && centered !== d) {
      var centroid = path.centroid(d);
      x = centroid[0];
      y = centroid[1];
      k = 4;
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
