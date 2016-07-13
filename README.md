# Cuckoo
## A simple clock
Changes your twitter avatar to one sourced from the current time.
You could use this to make a clock, sunrise, etc.

Uses boilerplate from [SC5 AWS Lambda Boilerplate](https://github.com/SC5/sc5-aws-lambda-boilerplate).

##Usage:

You need the AWS SDK installed to your path and configured with the proper credentials/region to use KMS and upload Lambda functions.

Create a S3 bucket and populate it with images in the format `HH-MM.png`, with no leading zeros
(it should be easy to modify the source in `src/index.js` to match any similar format).

Use AWS KMS to encrypt your twitter app and user credentials to a file called `twcreds` in the application root, this should be something like

`aws kms encrypt --key-id [your kms key id] --plaintext '{ "consumer_key": "[your consumer key", "consumer_secret": "[your consumer secret]", "token": "[your token], "token_secret": "[your token secret]" }' --query CiphertextBlob --output text | base64 -d > twcreds`

depending on your system. You can use `certutil` on Windows instead of `base64`, just copy the output of the KMS command (run without pipe) to intermediary.txt and run `-decode intermediary.txt twcreds`.

Choose an IAM role that has access to the bucket, lambda creation, and the relevant KMS key and copy its credentials to `lambdaenv.json` in the format:

```json
{
	"Role" : "[arn for the role]",
	"Region" : "[region for the role]"
}
````

Run `npm start` to test and `npm run deploy` to deploy to AWS.
You may then set it to run on a schedule via the AWS console.
Watch out for rate limits and stay safe out there !
