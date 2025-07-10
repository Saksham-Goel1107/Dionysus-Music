import { Client, ID, InputFile, Storage, Databases } from 'node-appwrite';
import axios from 'axios';

class AppwriteService {
  constructor() {
    const client = new Client();
    client
      .setEndpoint(
        process.env.APPWRITE_ENDPOINT ?? 'https://nyc.cloud.appwrite.io/v1'
      )
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    this.databases = new Databases(client);
    this.storage = new Storage(client);
  }

  async generateMusicFromPrompt(prompt) {
    const HF_API_TOKEN = process.env.HUGGINGFACE_ACCESS_TOKEN;
    try {
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/facebook/musicgen-small',
        { inputs: prompt },
        {
          responseType: 'arraybuffer',
          headers: {
            Authorization: `Bearer ${HF_API_TOKEN}`,
            Accept: 'audio/mpeg',
          },
        }
      );
      return Buffer.from(response.data);
    } catch (err) {
      if (err.response) {
        console.error('Hugging Face API error:', err.response.status, err.response.data);
        throw new Error(
          `Hugging Face API error: ${err.response.status} - ${JSON.stringify(err.response.data)}`
        );
      } else {
        console.error('Hugging Face API request failed:', err.message);
        throw new Error('Hugging Face API request failed: ' + err.message);
      }
    }
  }

  async createMp3FromPromptAndUpload(bucketId, prompt) {
    const mp3Buffer = await this.generateMusicFromPrompt(prompt);
    const file = InputFile.fromBuffer(mp3Buffer, 'audio.mp3');
    return await this.storage.createFile(bucketId, ID.unique(), file);
  }
}

export default AppwriteService;
