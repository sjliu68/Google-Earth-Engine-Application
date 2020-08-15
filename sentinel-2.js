// first draw an aoi using the tools in the map window

// Now select your image type!

var geometry = ee.Geometry.Rectangle(-4.5,48.2,-3.4,48.9);
//var geometry = ee.Geometry.Rectangle(-4.5,48.2,-3.9,48.5);

var collection = ee.ImageCollection('COPERNICUS/S2') // searches all sentinel 2 imagery pixels...
  .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 10)) // ...filters on the metadata for pixels less than 10% cloud
  .filterDate('2017-01-01' ,'2017-01-31') //... chooses only pixels between the dates you define here
  .filterBounds(geometry) // ... that are within your aoi
  
print(collection) // this generates a JSON list of the images (and their metadata) which the filters found in the right-hand window.
  
/// so far this is finding all the images in the collection which meets the critera- the latest on top. To get a nice blended-looking mosaic, 
// try some of the tools for 'reducing' these to one pixel (or bands of pixels in a layer stack). 

var medianpixels = collection.median() // This finds the median value of all the pixels which meet the criteria. 

var medianpixelsclipped = medianpixels.clip(geometry).toInt() // this cuts up the result so that it fits neatly into your aoi
                                                                  // and divides so that values between 0 and 1      


// Now visualise the mosaic as a natural colour image. 
Map.addLayer(medianpixelsclipped, {bands: ['B8', 'B4', 'B3'], min: 0, max: 10000, gamma: 1.5}, 'Sentinel_2 mosaic')

// export it to your googledrive as a tiff for use in QGIS
// Export the image, specifying scale and region.
Export.image.toDrive({
  image: medianpixelsclipped.select("B2","B3","B4","B5","B6","B7","B8","B8A","B11","B12"),
  description: 'Sentinel-2_1',
  scale: 10,
  maxPixels: 1e11,
  region: geometry
});
