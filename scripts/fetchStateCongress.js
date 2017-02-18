/**
 * usage:
 * `node ./fetchStateCongress.js "<state name>" <congress number>`
 * e.g. node ./fetchStateCongress.js "new york" 114
 */

// simple file fetching adapted from
// http://stackoverflow.com/a/22907134/222356
var https = require('https');
var fs = require('fs');

var download = function(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = https.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);  // close() is async, call cb after close completes.
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });
};


var url = "https://stuartlynn.carto.com/api/v2/sql?filename=district_json&q=SELECT+ST_MAKEVALID(ST_SIMPLIFY(the_geom, 0.001))as the_geom, lewis_dist district, turnout, vote_share, victory_margin, winner, year+FROM+stuartlynn. levi_districts_since_1948+%0D%0Awhere+state_name = '" + process.argv[2] + "'+and+congress=" + process.argv[3] + "&format=geojson";
var dest = process.argv[2] + "-" + process.argv[3] + ".geojson";
download(url, dest);
