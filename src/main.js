import AppwriteService from './appwrite.js';

export default async ({ req, res, error }) => {
  const bucketId = process.env.APPWRITE_BUCKET_ID ?? 'generated_music';
  const appwrite = new AppwriteService();
  const file = await appwrite.createMp3FromPromptAndUpload(bucketId, req.body.prompt);

  return res.json({
    ok: true,
    fileId: file.$id,
  });
};
