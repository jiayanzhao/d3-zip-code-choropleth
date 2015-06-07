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
    var features = topojson.feature(zipcode, zipcode.objects.zip_code_crs84).features;

    g.append("g")
        .attr("class", "zipcodes")
      .selectAll("path")
        .data(features)
      .enter().append("path")
        .attr("class", function(d) { return quantize(rateById.get(d.properties.zipcode)); })
        .attr("d", path)
        .on("click", clicked)
        .on("mouseover", function(d) { console.log(quantize(d.properties.population)); })
        .on("mouseout", mouseout);
  }

  function getZip(d) {
    return d && d.properties ? d.properties.zipcode : null;
  }

  function getColor(d) {
    return color(d);
  }

  function mouseout(d) {
    d3.select("#tooltip").remove();

    d3.select(this)
      .transition()
      .duration(250)
      .style("fill", function(d) {
          var population = d.properties.population;
          if (population) {
              return color(population);
          } else {
              return "#ddd";
          }
      });
  }

  function mouseover(d) {
    var xPosition = d3.mouse(this)[0];
    var yPosition = d3.mouse(this)[1] - 30;

    svg.append("text")
        .attr("id", "tooltip")
        .attr("x", xPosition)
        .attr("y", yPosition)
        .attr("text-anchor", "middle")
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .attr("font-weight", "bold")
        .attr("fill", "black")
        .text(d.properties.population);

    d3.select(this)
        .style("fill", "#D5708B");
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
