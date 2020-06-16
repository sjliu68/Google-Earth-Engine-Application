//var region = ee.Geometry.Rectangle(110,19,116,25); //prd
//var region = ee.Geometry.Rectangle(118,29,122,32); //sh
//var region = ee.Geometry.Rectangle(143,-39,146,-36); // melbourne
//var region = ee.Geometry.Rectangle(102,29,105,32); // chengdu
//var region = ee.Geometry.Rectangle(112,37,119,42); // beijing
//var region = ee.Geometry.Rectangle(-4,50,2,54); // london
//var region = ee.Geometry.Rectangle(-113,32,-110,35); // phoneix
//var region = ee.Geometry.Rectangle(-119,32,-116,35); // LA
//var region = ee.Geometry.Rectangle(149,-35,152,-32); // Sydney
var region = ee.Geometry.Rectangle(-5,39,-2,42); // md


var dataset = ee.ImageCollection('NOAA/VIIRS/DNB/MONTHLY_V1/VCMCFG')
                  .filter(ee.Filter.date('2012-04-01', '2020-03-30'))
                  .filterBounds(region);
var nighttime = dataset.select('avg_rad');


var studyArea = ee.Feature(region, {name: 'region'});
//var nighttimeCliped = nighttime.clip(studyArea)

var nighttimeVis = {min: 0.0, max: 60.0};
Map.setCenter(112, 21, 8);
Map.addLayer(nighttime, nighttimeVis, 'Nighttime');
print(nighttime)

var nighttimeband = nighttime.toBands()

Export.image.toDrive({
  image: nighttimeband,
  description: 'viirs_md',
  maxPixels: 1e11,
  scale: 500,
  region: region
});
