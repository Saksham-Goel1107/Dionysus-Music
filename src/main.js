import { fetch } from 'undici';
import AppwriteService from './appwrite.js';

const HUGGINGFACE_API = 'https://api-inference.huggingface.co';

export default async ({ req, res, error }) => {
  const bucketId = process.env.APPWRITE_BUCKET_ID ?? 'generated_music';

  const response = await fetch(
    `${HUGGINGFACE_API}/models/facebook/musicgen-small`,
    {
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_ACCESS_TOKEN}`,
      },
      method: 'POST',
      body: JSON.stringify({
        inputs: req.body.prompt,
      }),
    }
  );

  const blob = await response.blob();
  const appwrite = new AppwriteService();
  const file = await appwrite.createFile(bucketId, blob);

  return res.json({
    ok: true,
    fileId: file.$id,
  });
};
