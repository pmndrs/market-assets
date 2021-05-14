const aws = require('aws-sdk')
const { S3Client } = require('@aws-sdk/client-s3')

const spacesEndpoint = new aws.Endpoint('fra1.digitaloceanspaces.com')
export const s3 = new S3Client({ endpoint: spacesEndpoint, region: 'fra1' })
