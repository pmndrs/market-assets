require('dotenv').config()
const aws = require('aws-sdk')
const { S3Client } = require('@aws-sdk/client-s3')

const spacesEndpoint = new aws.Endpoint('fra1.digitaloceanspaces.com')
export const s3 = new S3Client({
  endpoint: spacesEndpoint,
  region: 'fra1',
  credentials: {
    accessKeyId: process.env.VERCEL_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.VERCEL_AWS_SECRET_ACCESS_KEY,
  },
})
