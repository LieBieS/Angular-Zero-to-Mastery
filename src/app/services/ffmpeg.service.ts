import { Injectable } from '@angular/core';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

@Injectable({
  providedIn: 'root',
})
export class FfmpegService {
  isReady: boolean = false;
  private ffmpeg;
  constructor() {
    this.ffmpeg = createFFmpeg({ log: true });
  }

  async init() {
    if (this.isReady) {
      return;
    }
    await this.ffmpeg.load();
    this.isReady = true;
  }
  async getScreenShots(file: File) {
    const data = await fetchFile(file);
    this.ffmpeg.FS('writeFile', file.name, data);
    const seconds = [3, 6, 9];
    const commands: string[] = [];
    seconds.forEach(s => {
      commands.push(
        // Input
        '-i',
        file.name,
        // Output options
        '-ss',
        `00:00:0${s}`,
        '-frames:v',
        '1',
        '-filter:v',
        'scale=510:-1',
        // Output Image
        `output_0${s}.png`
      )
    });

    await this.ffmpeg.run(...commands);

    const screenShots: string[] = []
    seconds.forEach(s => {
      const screenshotFile = this.ffmpeg.FS('readFile', `output_0${s}.png`);
      const screenshotBlob = new Blob(
        [screenshotFile.buffer], {
        type: "image/png"
      }
      );
      const screenshot_url = URL.createObjectURL(screenshotBlob);
      screenShots.push(screenshot_url);
    });
    return screenShots;
  }
}
