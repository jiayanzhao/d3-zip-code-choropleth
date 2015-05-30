# dc.js zip code shapefile example

Based on [US Venture Capital Landscape 2011](http://dc-js.github.io/dc.js/vc/).

### Sources

* CA Population [Data](http://www.dof.ca.gov/research/demographic/state_census_data_center/census_2010/documents/2010Census_DemoProfile1_ZCTA.xls)
* CA Zip Code [Shapefile](http://geocommons.com/overlays/305142.zip)

Must transform shapefile into geojson format using `ogr2ogr`:
```bash
$ ogr2ogr -f GeoJSON -s_srs crs:84 -t_srs crs:84 zip_code_crs84.geojson <input-shapefile-here>.shp
```

### Todo

- [ ] integrate [mousewheel-zoom + click-to-center](http://bl.ocks.org/mbostock/2206340) into dc.js viz
- [ ] add data dimensions to filter


 