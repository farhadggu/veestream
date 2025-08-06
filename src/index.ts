import fs from 'fs';
import ora from 'ora';
import path from 'path';
import chalk from 'chalk';
import prompts from 'prompts';

import { program } from 'commander';
import { exec } from 'child_process';

console.log(
  chalk.blueBright(`
██╗   ██╗███████╗███████╗███████╗████████╗██████╗ ███████╗ █████╗ ███╗   ███╗
██║   ██║██╔════╝██╔════╝██╔════╝╚══██╔══╝██╔══██╗██╔════╝██╔══██╗████╗ ████║
██║   ██║█████╗  █████╗  ███████╗   ██║   ██████╔╝█████╗  ███████║██╔████╔██║
╚██╗ ██╔╝██╔══╝  ██╔══╝  ╚════██║   ██║   ██╔══██╗██╔══╝  ██╔══██║██║╚██╔╝██║
 ╚████╔╝ ███████╗███████╗███████║   ██║   ██║  ██║███████╗██║  ██║██║ ╚═╝ ██║
  ╚═══╝  ╚══════╝╚══════╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝    
`)
);

program
  .description('A CLI tool to convert videos using FFmpeg')
  .option('-i, --input <file>', 'input mp4 file')
  .option('-o, --output <dir>', 'output directory')
  .option('-a, --aspect-ratio <ratio>', 'aspect ratio (16:9 or 9:16)')
  .parse(process.argv);

type Options = { input: string; output: string; aspectRatio: string };

const options = program.opts<Options>();

async function main() {
  try {
    // * Step 1: If no input file is provided, prompt the user to enter one
    let input = options.input;

    if (!input) {
      const { _input } = await prompts(
        {
          type: 'text',
          name: '_input',
          message: 'Enter input file (.mp4)',
        },
        { onCancel: () => process.exit(1) }
      );

      input = _input;
    }

    if (!fs.existsSync(input)) throw new Error(`No such file \`${input}\` exists`);

    // * Step 2: Prompt the user to enter output directory
    let output = options.output;

    if (!output) {
      const { _output } = await prompts(
        {
          type: 'text',
          name: '_output',
          message: 'Enter output directory',
        },
        { onCancel: () => process.exit(1) }
      );

      output = _output;
    }

    // * Step 3: Create the output directory
    await fs.promises.mkdir(output, { recursive: true });
    console.log(chalk.green(`Created folder: ${output}`));

    // * Step 4: If no aspect ratio is provided, prompt the user to pick one
    let aspectRatio = options.aspectRatio;

    if (!aspectRatio) {
      const { _aspectRatio } = await prompts(
        {
          type: 'select',
          name: '_aspectRatio',
          message: 'Pick an aspect ratio:',
          choices: [
            { title: '16:9', value: '16:9' },
            { title: '9:16', value: '9:16' },
          ],
        },
        { onCancel: () => process.exit(1) }
      );

      aspectRatio = _aspectRatio;
    }

    console.log(chalk.green(`\nStarting video conversion for: ${chalk.bold(input)}`));
    console.log(chalk.blue(`Output directory: ${chalk.bold(output)}`));
    console.log(chalk.blue(`Aspect ratio: ${chalk.bold(aspectRatio)}\n`));

    // * Step 5: Execute FFmpeg for each resolution with a loading spinner
    await execFFmpeg(input, output, aspectRatio);

    console.log(chalk.green('\nVideo conversion completed successfully! 🎉\n'));
  } catch (error) {
    console.error(chalk.red(error));
    process.exit(1);
  }
}

async function execFFmpeg(input: string, output: string, aspectRatio: string) {
  let resolutions = [
    { resolution: '144p', width: 256, height: 144, bitrate: '250k' },
    { resolution: '240p', width: 426, height: 240, bitrate: '500k' },
    { resolution: '360p', width: 640, height: 360, bitrate: '800k' },
    { resolution: '480p', width: 854, height: 480, bitrate: '1400k' },
    { resolution: '720p', width: 1280, height: 720, bitrate: '2800k' },
    { resolution: '1080p', width: 1920, height: 1080, bitrate: '5000k' },
  ];

  if (aspectRatio === '9:16') {
    resolutions = resolutions.map(res => {
      const temp = res.width;
      res.width = res.height;
      res.height = temp;

      return res;
    });
  }

  for (const { resolution, width, height, bitrate } of resolutions) {
    const outFile = path.join(output, resolution);

    const command = `
      ffmpeg -hide_banner -y -i ${input} -vf scale=w=${width}:h=${height} \
      -c:a aac -ar 48000 -c:v h264 -profile:v main -crf 20 -preset medium \
      -b:v ${bitrate} -maxrate ${Math.floor(parseInt(bitrate) * 1.1)}k \
      -bufsize ${Math.floor(parseInt(bitrate) * 1.5)}k \
      -hls_time 4 -hls_playlist_type vod -b:a 128k \
      -hls_segment_filename ${outFile}_%03d.ts ${outFile}.m3u8
    `;

    const spinner = ora(`Converting to ${resolution}...`).start();
    await executeCommand(command.trim());

    spinner.succeed(chalk.green(`Converted to ${resolution} successfully!`));
  }

  // * Generate the master playlist.m3u8
  const masterPlaylistPath = path.join(output, 'playlist.m3u8');

  const masterPlaylist = resolutions
    .map(({ resolution, bitrate, width, height }) => {
      return `#EXT-X-STREAM-INF:BANDWIDTH=${
        parseInt(bitrate) * 1000
      },RESOLUTION=${width}x${height}\n${resolution}.m3u8`;
    })
    .join('\n');

  await fs.promises.writeFile(masterPlaylistPath, `#EXTM3U\n${masterPlaylist}`);

  console.log(chalk.green(`Master playlist created at ${masterPlaylistPath}`));
}

function executeCommand(command: string) {
  return new Promise<void>((resolve, reject) => {
    exec(command, { maxBuffer: 10024 * 10024 }, err => {
      if (err) reject(new Error(`Failed to execute command: ${err.message}`));
      else resolve();
    });
  });
}

main();
