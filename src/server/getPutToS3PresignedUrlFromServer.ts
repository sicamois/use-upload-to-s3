'use server';

import {
  DeleteBucketCorsCommand,
  GetBucketCorsCommand,
  PutBucketCorsCommand,
  PutObjectCommand,
  S3Client,
  type CORSRule,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const accessKeyId = process.env.AWS_ACCESS_KEY_ID!;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY!;
const region = process.env.AWS_REGION!;

const s3Client = new S3Client({
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  region,
});

let initialCORSRules: CORSRule[] | undefined = undefined;

export async function getPutToS3PresignedUrlFromServer(
  key: string,
  bucketName: string
) {
  const getInitialCorsConfigurationCommand = new GetBucketCorsCommand({
    Bucket: bucketName,
  });
  try {
    const response = await s3Client.send(getInitialCorsConfigurationCommand);
    initialCORSRules = response.CORSRules;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    /* empty */
  }
  const putTmpCorsCommand = new PutBucketCorsCommand({
    Bucket: bucketName,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedHeaders: ['*'],
          AllowedMethods: ['PUT'],
          AllowedOrigins: ['*'],
          ExposeHeaders: [],
          MaxAgeSeconds: 3000,
        },
      ],
    },
  });
  await s3Client.send(putTmpCorsCommand);

  const putCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
  // The URL will expire in 10 seconds. You can specify a different expiration time.
  return await getSignedUrl(s3Client, putCommand, { expiresIn: 10 });
}

export async function removeTmpCors(bucketName: string) {
  if (!initialCORSRules) {
    const command = new DeleteBucketCorsCommand({
      Bucket: bucketName,
    });
    await s3Client.send(command);
  } else {
    const command = new PutBucketCorsCommand({
      Bucket: bucketName,
      CORSConfiguration: {
        CORSRules: initialCORSRules,
      },
    });
    await s3Client.send(command);
  }
}
