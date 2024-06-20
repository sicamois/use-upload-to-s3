'use server';

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// S3 Bucket must have CORS configuration to allow PUT requests from the client
// In the S3 console, go to the bucket, Permissions tab, CORS configuration
//
// Example working CORS configuration:
// [
//   {
//       "AllowedHeaders": [
//           "*"
//       ],
//       "AllowedMethods": [
//           "PUT"
//       ],
//       "AllowedOrigins": [
//           "*"
//       ],
//       "ExposeHeaders": [],
//       "MaxAgeSeconds": 3000
//   }
// ]

export async function getPutToS3PresignedUrlFromServer(
  file: File,
  bucketName: string,
  region: string
) {
  const accessKeyId =
    typeof process !== 'undefined'
      ? process.env.AWS_ACCESS_KEY_ID!
      : import.meta.env.AWS_ACCESS_KEY_ID ||
        import.meta.env.PUBLIC_AWS_ACCESS_KEY_ID;
  const secretAccessKey =
    typeof process !== 'undefined'
      ? process.env.AWS_SECRET_ACCESS_KEY!
      : import.meta.env.AWS_SECRET_ACCESS_KEY ||
        import.meta.env.PUBLIC_AWS_SECRET_ACCESS_KEY;

  const s3Client = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  const putCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: file.name,
  });
  // The URL will expire in 10 seconds. You can specify a different expiration time.
  return await getSignedUrl(s3Client, putCommand, { expiresIn: 10 });
}
