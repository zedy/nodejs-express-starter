export interface AWSUploadParams {
  Bucket: string;
  Body: ReadStream | string;
  Key: string;
  CacheControl: string;
  ContentType: string;
  ACL?: string;
};

export interface DefaultW {
  body: string;
}