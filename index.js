#!/usr/bin/env node

const ora = require("ora");
const path = require("path");
const fsSync = require("fs");
const chalk = require("chalk");
const fs = require("fs").promises;
const inquirer = require("inquirer");
const { program } = require("commander");
const { exec } = require("child_process");

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
  .description("A CLI tool to convert videos using FFmpeg")
  .option("-i, --input <file>", "Input video file")
  .option("-o, --output <dir>", "Output directory")
  .option("-a, --aspect-ratio <ratio>", "Aspect ratio (16:9 or 9:16)")
  .parse(process.argv);

const options = program.opts();

async function main() {
  try {
    // * Step 1: If no input file is provided, prompt the user to select one
    let inputFile = options.input;
    if (!inputFile) {
      // * Get all .mp4 files in the root directory
      const rootDir = process.cwd();
      const files = fsSync.readdirSync(rootDir).filter((file) => file.endsWith(".mp4"));

      // * Add an option to manually enter a path
      files.push("Manually enter video path");

      const { selectedFile } = await inquirer.prompt([
        {
          type: "list",
          name: "selectedFile",
          message: "Choose a video file or manually enter the path:",
          choices: files,
        },
      ]);

      if (selectedFile === "Manually enter video path") {
        const { manualPath } = await inquirer.prompt([
          {
            type: "input",
            name: "manualPath",
            message: "Enter the path to your video file:",
            validate: (value) => {
              if (fsSync.existsSync(value)) return true;
              return "File does not exist. Please enter a valid file path.";
            },
          },
        ]);
        inputFile = manualPath;
      } else {
        inputFile = path.join(rootDir, selectedFile);
      }
    }

    // * Step 2: Prompt the user to enter a folder name
    const { folderName } = await inquirer.prompt([
      {
        type: "input",
        name: "folderName",
        message: "Enter the name of the output folder:",
        validate: (value) => {
          if (value.trim() === "") return "Folder name cannot be empty.";
          return true;
        },
      },
    ]);

    // * Step 3: Create the folder
    const outputDir = path.join(process.cwd(), folderName);
    await fs.mkdir(outputDir, { recursive: true });
    console.log(chalk.green(`Created folder: ${outputDir}`));

    // * Step 4: If no aspect ratio is provided, prompt the user to select one
    let aspectRatio = options.aspectRatio;
    if (!aspectRatio) {
      const { ratio } = await inquirer.prompt([
        {
          type: "list",
          name: "ratio",
          message: "Select the aspect ratio:",
          choices: [
            { name: "16:9 (Landscape)", value: "16:9" },
            { name: "9:16 (Portrait)", value: "9:16" },
          ],
        },
      ]);
      aspectRatio = ratio;
    }

    console.log(chalk.green(`\nStarting video conversion for: ${chalk.bold(inputFile)}`));
    console.log(chalk.blue(`Output directory: ${chalk.bold(outputDir)}`));
    console.log(chalk.blue(`Aspect ratio: ${chalk.bold(aspectRatio)}\n`));

    // * Step 5: Execute FFmpeg for each resolution with a loading spinner
    await execFFmpeg(inputFile, outputDir, aspectRatio);

    console.log(chalk.green("\nVideo conversion completed successfully! 🎉\n"));
  } catch (error) {
    console.error(chalk.red("Error:", error.message));
    process.exit(1);
  }
}

async function execFFmpeg(inputFile, outputDir, aspectRatio) {
  const resolutions =
    aspectRatio === "16:9"
      ? [
          { resolution: "144p", width: 256, height: 144, bitrate: "250k" },
          { resolution: "240p", width: 426, height: 240, bitrate: "500k" },
          { resolution: "360p", width: 640, height: 360, bitrate: "800k" },
          { resolution: "480p", width: 854, height: 480, bitrate: "1400k" },
          { resolution: "720p", width: 1280, height: 720, bitrate: "2800k" },
          { resolution: "1080p", width: 1920, height: 1080, bitrate: "5000k" },
        ]
      : [
          { resolution: "144p", width: 144, height: 256, bitrate: "250k" },
          { resolution: "240p", width: 240, height: 426, bitrate: "500k" },
          { resolution: "360p", width: 360, height: 640, bitrate: "800k" },
          { resolution: "480p", width: 480, height: 854, bitrate: "1400k" },
          { resolution: "720p", width: 720, height: 1280, bitrate: "2800k" },
          { resolution: "1080p", width: 1080, height: 1920, bitrate: "5000k" },
        ];

  for (const { resolution, width, height, bitrate } of resolutions) {
    const outputPath = path.join(outputDir, resolution);
    const command = `
      ffmpeg -hide_banner -y -i ${inputFile} -vf scale=w=${width}:h=${height} \
      -c:a aac -ar 48000 -c:v h264 -profile:v main -crf 20 -preset medium \
      -b:v ${bitrate} -maxrate ${Math.floor(parseInt(bitrate) * 1.1)}k \
      -bufsize ${Math.floor(parseInt(bitrate) * 1.5)}k \
      -hls_time 4 -hls_playlist_type vod -b:a 128k \
      -hls_segment_filename ${outputPath}_%03d.ts ${outputPath}.m3u8
    `;

    const spinner = ora(`Converting to ${resolution}...`).start();
    await executeCommand(command.trim());
    spinner.succeed(chalk.green(`Converted to ${resolution} successfully!`));
  }

  // * Generate the master playlist.m3u8
  const masterPlaylistPath = path.join(outputDir, "playlist.m3u8");
  const masterPlaylistContent = resolutions
    .map(({ resolution, bitrate, width, height }) => {
      return `#EXT-X-STREAM-INF:BANDWIDTH=${
        parseInt(bitrate) * 1000
      },RESOLUTION=${width}x${height}\n${resolution}.m3u8`;
    })
    .join("\n");

  await fs.writeFile(masterPlaylistPath, `#EXTM3U\n${masterPlaylistContent}`);
  console.log(chalk.green(`Master playlist created: ${masterPlaylistPath}`));
}

function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, { maxBuffer: 10024 * 10024 }, (err, output) => {
      if (err) reject(new Error(`Failed to execute command: ${err.message}`));
      else resolve();
    });
  });
}

main();
