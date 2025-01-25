#!/usr/bin/env node

const chalk = require("chalk");
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
