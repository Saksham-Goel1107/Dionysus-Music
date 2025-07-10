import { Client, ID, InputFile, Storage, Databases } from 'node-appwrite';

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

  async createFile(bucketId, blob) {
    let file;
    
    if (blob instanceof Buffer) {
      file = InputFile.fromBuffer(blob, 'audio.flac');
    } else if (blob instanceof Uint8Array) {
      file = InputFile.fromBuffer(Buffer.from(blob), 'audio.flac');
    } else if (blob instanceof Blob) {
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      file = InputFile.fromBuffer(buffer, 'audio.flac');
    } else if (typeof blob === 'string') {
      file = InputFile.fromBuffer(Buffer.from(blob), 'audio.flac');
    } else {
      file = InputFile.fromBuffer(Buffer.from(blob), 'audio.flac');
    }
    
    return await this.storage.createFile(bucketId, ID.unique(), file);
  }
}

export default AppwriteService;
