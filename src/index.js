var fs = require('fs');
var AWS = require('aws-sdk');
var kms = new AWS.KMS({region:'us-west-2'});
var s3bucket = new AWS.S3({params: {Bucket: 'clock-a'}});
var encryptedSecret = fs.readFileSync('./wgcreds');
var TwitterPicProfile = require('twitter-pic-profile');

var params = {
  CiphertextBlob: encryptedSecret
};

var t;

function handle(event, context) {
  var d = new Date();
  var utc = d.getTime() + ((d.getTimezoneOffset() - 240) * 60000);
  var time = new Date(utc);
  kms.decrypt(params, function(err, data) {

    if (err) {
      console.log(err);
      return;
    }

    //console.log(data['Plaintext'].toString());
    var creds = JSON.parse(data['Plaintext'].toString());
    var t = new TwitterPicProfile({
      consumer_key:    creds.consumer_key,
      consumer_secret: creds.consumer_secret,
      token:           creds.token,
      token_secret:    creds.token_secret,
    });
    var key = time.getHours() + '-' + time.getMinutes() + '.png';
    console.log(key)
    s3bucket.getObject(
      {
        Bucket: 'clock-a',
        Key: key
      },
      function(err, data) {
        if(err) {
          console.log(err);
          context.fail(err);
          return;
        }

        t.update(
          { status: 'new', image: new Buffer(data.Body.toString('base64'), 'base64')},
          function(err, res) {
            if(err) {
              console.log(err);
              context.fail(err);
            }
            console.log(res);
        });
      }
    );
  })
};

module.exports = exports = {
    handler : handle
};
