# useUploadToS3

A simple react hook `useUploadToS3` that levrage React Server Component to securely upload files to a private S3 bucket from the client while keeping the secret keys on the server.

> [!WARNING]
>
> This hook uses React 19 Server Actions and thus will only work with **Next.js 15.**

## Installation

```bash
pnpm add @sicamois/use-upload-to-s3
```

## Usage

### Configure S3 Bucket and IAM User

- Create a private S3 bucket.
- Create a new IAM user with the following policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": ["arn:aws:s3:::YOUR_BUCKET_NAME/*"]
    },
    {
      "Effect": "Allow",
      "Action": ["s3:GetBucketCORS", "s3:PutBucketCORS"],
      "Resource": ["arn:aws:s3:::YOUR_BUCKET_NAME"]
    }
  ]
}
```

- Save the `Access Key ID` and `Secret Access Key`.

### Add Environment Variables

- Create a `.env.local` file in the root of your project, with the following environment variables:

```env
AWS_ACCESS_KEY_ID=<YOUR_ACCESS_KEY_ID>
AWS_SECRET_ACCESS_KEY=<YOUR_SECRET_ACCESS_KEY>
AWS_REGION=<YOUR_REGION>
```

### Quickstart

```jsx
'use client';

import { useUploadToS3 } from '@sicamois/use-upload-to-s3';

export default function UploadFile() {
  const [handleInputChange, s3key, isPending, error] =
    useUploadToS3('YOUR_BUCKET_NAME');

  return (
    <div>
      <input type='file' onChange={handleInputChange} />
      <p>s3key: {s3key}</p>
      {isPending ? <p>Uploading...</p> : null}
      {error ? <p>Error: {error.message}</p> : null}
    </div>
  );
}
```

> [!NOTE]
>
> - `handleInputChange` is a convenience function that makes all the magic happen. It triggers a call to a Server Action to create a secured URL to upload the file to S3.
> - `s3key` is the key of the file in the S3 bucket (so you can get it later).
> - `isPending` is a state that indicates if the file is being uploaded. As a state, it triggers a re-render when it changes.
> - `error` is a state that contains the error message if something goes wrong. It is also a state to be more convient to handle.

## Options

### `accept`

The file types to accept, defaults to all files.

> [!NOTE]
>
> It accepts a string with the file MIME types (separated by a comma)

### `sizeLimit`

The maximum file size in bytes, defaults to 1MB.

> [!NOTE]
>
> It accepts a string with the size in bytes, or a string with the size in KB, MB, GB, etc.

> [!WARNING]
> Server Actions have a default size limit of 1MB.  
> To change that you have to set it in the next.config.js (or next.config.mjs) file.  
> see https://nextjs.org/docs/app/api-reference/next-config-js/serverActions#bodysizelimit

## Motivations

- To provide a simple, efficient & secure way to upload files to a private S3 from the client.
- Makes everything that needs to be done on the server (using secrets, etc) to be done... on the server side !
- The upload is done from the client, so the file never touches the server.
  - Circumvent the limitation on **Vercel** serverless functions to 4.5MB upload size.
- The hook is built with React Server Components, so it's generate a very small overhead in the bundle size on the client.
- It removes the need to make your S3 bucket public, and thus remove the need for a trade-off between security and convenience.
