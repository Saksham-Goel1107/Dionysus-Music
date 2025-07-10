import { Client, ID, InputFile, Storage, Databases } from 'node-appwrite';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { Readable } from 'stream';

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

  async convertFlacToMp3(flacBuffer) {
    return new Promise((resolve, reject) => {
      ffmpeg.setFfmpegPath(ffmpegInstaller.path);
      const inputStream = new Readable();
      inputStream.push(flacBuffer);
      inputStream.push(null);
      const chunks = [];
      ffmpeg(inputStream)
        .inputFormat('flac')
        .format('mp3')
        .on('error', reject)
        .on('end', () => resolve(Buffer.concat(chunks)))
        .pipe()
        .on('data', (chunk) => chunks.push(chunk));
    });
  }

  async createFile(bucketId, blob) {
    let flacBuffer;
    if (blob instanceof Buffer) {
      flacBuffer = blob;
    } else if (blob instanceof Uint8Array) {
      flacBuffer = Buffer.from(blob);
    } else if (blob instanceof Blob) {
      const arrayBuffer = await blob.arrayBuffer();
      flacBuffer = Buffer.from(arrayBuffer);
    } else if (typeof blob === 'string') {
      flacBuffer = Buffer.from(blob);
    } else {
      flacBuffer = Buffer.from(blob);
    }

    console.log('FLAC buffer length:', flacBuffer.length);
    console.log('FLAC buffer magic:', flacBuffer.slice(0, 4).toString());

    if (flacBuffer.length < 4 || flacBuffer.slice(0, 4).toString() !== 'fLaC') {
      throw new Error('Input is not a valid FLAC file.');
    }

    const mp3Buffer = await this.convertFlacToMp3(flacBuffer);
    const file = InputFile.fromBuffer(mp3Buffer, 'audio.mp3');
    return await this.storage.createFile(bucketId, ID.unique(), file);
  }
}

export default AppwriteService;
