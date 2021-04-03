const fs = require('fs');
// Use this if on Angular < 11
const f = 'node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/browser.js';

// Use this if on Angular 11+
// const f ='node_modules/@angular-devkit/build-angular/src/webpack/configs/browser.js';
 
fs.readFile(f, 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  let result = data.replace(/node: false/g, "node: { crypto: true, stream: true, assert: true }");
 
  fs.writeFile(f, result, 'utf8', function (err) {
    if (err) return console.log(err);
  });
});