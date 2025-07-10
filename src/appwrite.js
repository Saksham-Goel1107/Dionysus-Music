import { Client, ID, InputFile, Storage } from 'node-appwrite';

class AppwriteService {
  constructor() {
    const client = new Client();
    client
      .setEndpoint(
        process.env.APPWRITE_ENDPOINT ?? 'https://<REGION>.cloud.appwrite.io/v1'
      )
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    this.databases = new Databases(client);
    this.storage = new Storage(client);
  }

  async createFile(bucketId, blob) {
    const file = await InputFile.fromBuffer(blob, 'audio.flac');
    return await this.storage.createFile(bucketId, ID.unique(), file);
  }
}

export default AppwriteService;
