import { Injectable, UnsupportedMediaTypeException } from '@nestjs/common';

import AWS from 'aws-sdk';
import { env } from 'process';
import { v4 as uuid } from 'uuid';

const s3 = new AWS.S3({
  accessKeyId: env.ACCESS_KEY_ID,
  secretAccessKey: env.SECRET_ACCESS_KEY,
  region: env.AWS_REGION,
  signatureVersion: 'v4',
});

@Injectable()
export class S3Service {
  //async uploadImageToS3(image: string) {}
  async getSignedUrlForImage(
    contentType: string,
    filePath: string,
    filename: string,
  ): Promise<{ presignedUrl: string; fileName: string }> {
    // if (!contentType) {
    //   throw new HttpException('Missing contentType', 400);
    // }

    // if (!filePath) {
    //   throw new HttpException('Missing filePath', 400);
    // }

    const filetype: string = contentType.split('/')[1];

    // Rename file, I just want to show there is a way to rename file before you it into S3
    // Renaming file might be necessary for SEO
    const fileName = filename
      ? filename.split('/').pop()
      : `${uuid()}.${filetype}`;

    if (contentType.split('/')[0] !== 'image')
      throw new UnsupportedMediaTypeException();

    const params = {
      Bucket: env.S3_UPDATE_BUCKET,
      Key: fileName,
      Expires: 600,
      ContentType: 'image/*',
      //ACL: 'public-read',
    };

    const s3Url = await s3.getSignedUrlPromise('putObject', params);

    return { presignedUrl: s3Url, fileName };
  }
}
