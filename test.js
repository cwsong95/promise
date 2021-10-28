// Tests
var PromiseDemo = require('./promiseDemo')

const readFile = (filename, encoding) => new PromiseDemo((resolve, reject) => {
  require('fs').readFile(filename, encoding, (err, value) => {
    if (err) {
      return reject(err);
    }
    resolve(value);
  })
});

// chaining method with .then
readFile(require('path').join(__dirname, 'promiseDemo.js'), 'utf8')
  .then(text => {
    console.log(`${text.length} characters read`);
    return text.replace(/[aeiou]/g, '');
  })
  .then(newText => {
    console.log(newText.slice(0, 200));
  })
  .catch(err => {
    console.error('An error occured!');
    console.error(err);
  })
  .finally(() => {
    console.log('---- All done! ----');
  });

var myPromises = PromiseDemo.all([
  'Sendbird',
  3.14,
  undefined,
  null,
  1,
]);

// testing for edge case where array is empty
var myEmptyPromises = PromiseDemo.all([]);

myPromises
  .then(res => console.log("resolved: ", res))
  .catch(err => console.log("rejected: ", err));

myEmptyPromises
  .then(res => console.log("resolved: ", res))
  .catch(err => console.log("rejected: ", err));


// example code from developer.mozilla.org web
  let myFirstPromise = new PromiseDemo((resolve, reject) => {
    setTimeout( function() {
      resolve("Success!")
    }, 250)
  })
  
  myFirstPromise.then((successMessage) => {
    console.log("Yay! " + successMessage)
  });
