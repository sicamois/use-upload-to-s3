# useUploadToS3

A simple react hook `useUploadToS3` that levrage React Server Component to securely upload files to a private S3 bucket from the client while keeping the secret keys on the server.

## Installation

```bash
npm i @sicamois/use-upload-to-s3
```

or if you want to sintall it from jsr

```bash
npx jsr add @dapofactory/react-hook-upload-to-s3
```

## Usage

### Configure S3 Bucket

- Create a private S3 bucket.
- Create a new IAM user with the following policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

- Save the `Access Key ID` and `Secret Access Key`.
- In the S3 console, add the following CORS configuration to your bucket → go to the bucket, Permissions tab, CORS configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3000
  }
]
```

> [!WARNING] > `"AllowedOrigins": ["*"]` is necessary if you don't know the origin of the request (like in this case). If you know the origin, you should replace `*` with the origin.

### Add Environment Variables

- Create a `.env` file in the root of your project, with the following environment variables:

```env
AWS_ACCESS_KEY_ID=<YOUR_ACCESS_KEY_ID>
AWS_SECRET_ACCESS_KEY=<YOUR_SECRET_ACCESS_KEY>
```

### Quickstart

```jsx
'use client';

import { useUploadToS3 } from '@sicamois/use-upload-to-s3';

export default function UploadFile() {
  const [handleInputChange, s3key, isPending, error] = useUploadToS3(
    'YOUR_BUCKET_NAME',
    'YOUR_AWS_REGION'
  );

  return (
    <form>
      <input type='file' onChange={handleInputChange} />
      <p>s3key: {s3key}</p>
      {isPending ? <p>Uploading...</p> : null}
      {error ? <p>Error: {error.message}</p> : null}
    </form>
  );
}
```

> [!NOTE]
>
> - `handleInputChange` is a convenience function that makes all the magic happen. It triggers a call to a Server Action to create a secured URL to upload the file to S3.
> - `s3key` is the key of the file in the S3 bucket (so you can get it later).
> - `isPending` is a state that indicates if the file is being uploaded. As a state, it triggers a re-render when it changes.
> - `error` is a state that contains the error message if something goes wrong. It is also a state to be more convient to handle.

## Motivations

- To provide a simple, efficient & secure way to upload files to a private S3 from the client.
- Makes everything that needs to be done on the server (using secrets, etc) to be done... on the server side !
- The upload is done from the client, so the file never touches the server.
  - Circumvent the limitation on **Vercel** serverless functions to 4.5MB upload size.
- The hook is built with React Server Components, so it's generate a very small overhead in the bundle size on the client.
- It removes the need to make your S3 bucket public, and thus remove the need for a trade-off between security and convenience.
