import { Bucket } from "encore.dev/storage/objects";

export const videoBucket = new Bucket("videos", {
  public: true,
});

export const thumbnailBucket = new Bucket("thumbnails", {
  public: true,
});
