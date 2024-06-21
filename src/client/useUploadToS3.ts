'use client';

import { useState, useTransition } from 'react';
import { getPutToS3PresignedUrlFromServer } from '../server/getPutToS3PresignedUrlFromServer.js';

function returnFileSize(number: number) {
  if (number < 1024) {
    return `${number} bytes`;
  } else if (number >= 1024 && number < 1048576) {
    return `${(number / 1024).toFixed(1)} KB`;
  } else if (number >= 1048576) {
    return `${(number / 1048576).toFixed(1)} MB`;
  }
}

// WARNING : Server Actions have a default size limit of 1MB
// To change that you have to set it in the next.config.js (or next.config.mjs) file
// see https://nextjs.org/docs/app/api-reference/next-config-js/serverActions#bodysizelimit

/**
 * Upload a file to a private S3 bucket from the client using a presigned URL.
 *
 * @param bucket The name of the S3 bucket
 * @param region The region of the S3 bucket
 * @param options Options for the upload
 * @param options.accept The file types to accept, defaults to all files
 * @param options.sizeLimit The maximum file size in bytes, defaults to 1MB
 * @returns A tuple containing the file input change handler, the S3 key of the uploaded file, a boolean indicating if the upload is pending, and an error if the upload failed
 * @example
 * ```tsx
 * const [handleInputChange, s3key, isPending, error] = useUploadToS3('my-bucket', 'us-east-1', {
 *  accept: 'image/*',
 *  sizeLimit: 5_242_880,
 * });
 * ```
 */
export function useUploadToS3(
  bucket: string,
  region: string,
  options: {
    accept?: string;
    sizeLimit?: number;
  } = {}
): [
  (event: React.ChangeEvent<HTMLInputElement>) => void,
  string | undefined,
  boolean,
  Error | null
] {
  const { accept = '*/*', sizeLimit = 1_048_576 } = options;
  const [error, setError] = useState<Error | null>(null);
  const [s3key, setS3key] = useState<string | undefined>(undefined);

  const [isPending, startTransition] = useTransition();

  const handleInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const acceptedFiletypes = accept.split(',');
    for (let i = 0; i < acceptedFiletypes.length; i++) {
      acceptedFiletypes[i] = acceptedFiletypes[i]!.trim();
    }
    const passAcceptation = acceptedFiletypes.reduce(
      (acc, acceptedFiletype) => {
        const cleanType = acceptedFiletype.trim();
        if (
          !file.type.includes(cleanType.replace('*', '')) &&
          cleanType !== '*/*' &&
          !file.name.includes(cleanType) &&
          !file.type.endsWith(cleanType)
        ) {
          return acc || false;
        }
        return acc || true;
      },
      false
    );

    if (!passAcceptation) {
      setError(new Error(`Only ${accept} files are accepted`));
      return;
    }

    if (file.size > sizeLimit) {
      setError(
        new Error(
          `File "${file.name}" is too big - max ${returnFileSize(
            sizeLimit
          )} allowed`
        )
      );
      return;
    }

    setError(null);
    setS3key(undefined);

    startTransition(async () => {
      try {
        const uploadUrl = await getPutToS3PresignedUrlFromServer(
          file,
          bucket,
          region
        );
        const response = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
        });

        if (!response.ok) {
          throw new Error(
            `Failed to upload file to S3: ${response.status} ${response.statusText}`
          );
        }

        setS3key(file.name);
      } catch (error) {
        console.error(error);
        setError(error as Error);
      }
    });
  };

  return [handleInputChange, s3key, isPending, error] as [
    (event: React.ChangeEvent<HTMLInputElement>) => void,
    string | undefined,
    boolean,
    Error | null
  ];
}
