(function chart() {

  // var numberFormat = d3.format(".2f");
  var caChart = dc.geoChoroplethChart("#ca-chart");

  d3.csv("../data/ca_population_2010.csv", function (csv) {
    var data = crossfilter(csv);
    var zipcodes = data.dimension(function (d) { return d.zip; });
    var popSum = zipcodes.group().reduceSum(function (d) { return d.population; });

    d3.json("../data/zip_code_crs84.geojson", function (zipGeoJSON) {
      caChart.width(1000)
        .height(1200)
        .dimension(zipcodes)
        .group(popSum)
        .projection(d3.geo.albersUsa()
            .scale(6000)
            .translate([2300, 680]))
        .colors(colorbrewer.RdYlGn[9])
        .colorDomain([0, 100000])
        .overlayGeoJson(zipGeoJSON.features, "zipcode", function (d) {
            return d.properties.ZCTA5CE10.toString();
        })
        .title(function (d) {
            return "Zip: " + d.key + "\nTotal Population: " + d.value; //numberFormat(d.value ? d.value : 0);
        });

      dc.renderAll();
    });
  });

}());
