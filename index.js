#!/usr/bin/env node

const fsSync = require("fs");
const chalk = require("chalk");
const inquirer = require("inquirer");
const { program } = require("commander");

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

    console.log(chalk.green("\nVideo conversion completed successfully! 🎉\n"));
  } catch (error) {
    console.error(chalk.red("Error:", error.message));
    process.exit(1);
  }
}

main();
