// Function returns true if leap year, false otherwise.
var isLeapYear = function(year) {
  return (year % 4 === 0 && year !== 100) || year % 400 === 0;
};

// Gets the number of days in any month in a year.
var getDaysInMonth = function(year, month) {
  var leapYear = isLeapYear(parseInt(year, 10));
  var daysInMonth = 0;
  var monthNumber = parseInt(month, 10);

  if (monthNumber === 2) {
    daysInMonth = 28;
    //leapyear ? daysInMonth = 29 : daysInMonth = 28;
  }
  else if (
    monthNumber === 4 ||
    monthNumber === 6 ||
    monthNumber === 9 ||
    monthNumber === 11
  ){
    daysInMonth = 30;
  }
  else {
    daysInMonth = 31;
  }
  
  return (daysInMonth);
};


// Adds rectangle (the study area) and create a Feature object using the rectangle.
var region = ee.Geometry.Rectangle(-4.5,48.2,-3.4,48.9); //-4.82,48.1,-3.4,48.9
var studyArea = ee.Feature(region, { name: 'france'});


/* Show object properies in the Console. */
print(studyArea);

/* Sets the map view to the center
 * of the study area. */
Map.setCenter(-3.5,48.5,9);
//Map.centerObject(studyArea);


// Loads the Sentinel-1 image collection.
var sentinel1 = ee.ImageCollection('COPERNICUS/S1_GRD');

/* Coordinate pairs, set start and end date
 * for filtering the collection. */
var point = ee.Geometry.Point(-3.5, 48.5);

var currentYear = new Date().getFullYear();

// User inputs: year and month. Data is available from 12/2014!
var year = prompt('Which year you want to process (between 2014 and ' + currentYear + ')?');
// Use leading 0 if month number < than 10!
var month = prompt('Which month you want to process?', '07');

var daysInMonth = getDaysInMonth(year, month);

var start = ee.Date(year + '-' + month + '-01');
var finish = ee.Date(year + '-' + month + '-' + daysInMonth);
print(finish);
print(daysInMonth);

 // Filtering based on metadata properties.
var vh = sentinel1
  // Filter to get images with VV and VH dual polarization.
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
  // Filter to get images collected in interferometric wide swath mode.
  .filter(ee.Filter.eq('instrumentMode', 'IW'))
  .filterBounds(point)
  .filterDate(start, finish);

// Filter to get images from different look angles.
var vhAscending = vh.filter(ee.Filter.eq('orbitProperties_pass', 'ASCENDING'));
var vhDescending = vh.filter(ee.Filter.eq('orbitProperties_pass', 'DESCENDING'));


// Create a composite from means at different polarizations and look angles.
var composite = ee.Image.cat([
  vhAscending.select('VH').mean(),
  ee.ImageCollection(vhAscending.select('VV').merge(vhDescending.select('VV'))).mean(),
  vhDescending.select('VV').mean()
]).focal_median();


// Clip composite image with our study area.
var compositeClipped = composite.clip(studyArea);

// Display as a composite of polarization and backscattering characteristics.
Map.addLayer(
  compositeClipped,
  {
    min: [-25, -20, -25],
    max: [0, 10, 0]
  },
  'composite'
);

// Create an empty image into which to paint the features, cast to byte.
var empty = ee.Image().byte();

// Paint all the polygon edges with the same number and width, display.
var outline = empty.paint(
  {
    featureCollection: studyArea,
    color: "black",
    width: 2
  }
);

Map.addLayer(outline, { palette: 'f00' }, 'Study Area');
print(compositeClipped);


// Save the composite image as GeoTIFF.
Export.image.toDrive(
  {
    image: compositeClipped,
    description: 'Sentinel'+year+month,
    scale: 10,
    fileFormat: 'GeoTIFF',
    maxPixels: 3784216672400,
    region: studyArea
  }
);
