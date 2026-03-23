import AWS from "aws-sdk";

const s3 = new AWS.S3({ accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY });

export async function uploadVideo(file, userId) {
  const key = `videos/${userId}/${Date.now()}-${file.originalname}`;
  const params = { Bucket: process.env.AWS_S3_BUCKET, Key: key, Body: file.buffer, ContentType: file.mimetype, ACL: "private" };
  try {
    const result = await s3.upload(params).promise();
    return { success: true, videoId: key, url: result.Location };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function getVideoUrl(videoId) {
  const params = { Bucket: process.env.AWS_S3_BUCKET, Key: videoId, Expires: 3600 };
  try {
    const url = s3.getSignedUrl("getObject", params);
    return { success: true, url };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function deleteVideo(videoId) {
  const params = { Bucket: process.env.AWS_S3_BUCKET, Key: videoId };
  try {
    await s3.deleteObject(params).promise();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function listVideos(userId) {
  const params = { Bucket: process.env.AWS_S3_BUCKET, Prefix: `videos/${userId}/` };
  try {
    const result = await s3.listObjectsV2(params).promise();
    const videos = result.Contents.map(obj => ({ key: obj.Key, size: obj.Size, lastModified: obj.LastModified }));
    return { success: true, videos };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
