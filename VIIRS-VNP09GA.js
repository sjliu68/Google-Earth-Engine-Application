// change latitude and longitude
var region = ee.Geometry.Rectangle(113.5,22,114.5,23)

// change data date
var dataset = ee.ImageCollection('NOAA/VIIRS/001/VNP09GA')
                  .filter(ee.Filter.date('2013-01-01', '2013-12-31'))
                  .filterBounds(region);

var rgb = dataset.select(['M5', 'M4', 'M3']); //recommended
//var rgb = dataset.select(['M5']); // use only single band
//var rgb = dataset.select(['I3', 'I2', 'I1']); // false color map

var toband = rgb.toBands() // covert data to multiple-channel image

var rgbVis = {
  min: 0.0,
  max: 3000.0,
};
print(toband) // see console check for the total number of channels

Map.setCenter(113.5, 22, 10);  // show image in GEE, *arguments: center longitude, center latitude, zoom level (the larger the closer)
Map.addLayer(rgb, rgbVis, 'RGB'); // show image in GEE

Export.image.toDrive(
  {
    image: toband,
    description: 'cloud2013b', // export to Google Drive with this file name
    scale: 500, // resolution, fixed to 500 (m) is okay
    fileFormat: 'GeoTIFF',
    maxPixels: 3784216672400,
    region: region,
    crs: 'EPSG:4326'
  }
);