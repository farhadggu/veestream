# VeeStream: The Ultimate Video Conversion CLI Tool

![VeeStream GIF](https://github.com/farhadggu/veestream/raw/main/public/logo.jpg)

Welcome to **VeeStream**, the command-line companion you never knew you needed! With its power, you can convert videos effortlessly into various resolutions and generate HLS playlists for seamless streaming on the web. Whether you're a developer optimizing video streams or someone who just wants a quick way to prepare videos for multi-quality playback, **VeeStream** has your back.

<a href="https://www.npmjs.com/package/veestream" rel="nofollow"><img src="https://img.shields.io/npm/v/veestream.svg?style=flat" alt="NPM version" style="max-width: 100%;"></a>

<!-- <a href="https://npmjs.org/package/veestream" rel="nofollow"><img src="https://img.shields.io/npm/dm/veestream.svg?style=flat" alt="NPM monthly downloads" style="max-width: 100%;"></a>
<a href="https://npmjs.org/package/veestream" rel="nofollow"><img src="https://img.shields.io/npm/dt/veestream.svg?style=flat" alt="NPM total downloads" style="max-width: 100%;"></a> -->

---

## 🚀 What Does VeeStream Do?

VeeStream is a CLI tool designed to:

1. **Convert videos into multiple resolutions** (144p, 240p, 360p, 480p, 720p, and 1080p).
2. **Maintain aspect ratios** (e.g., 16:9 or 9:16) for both landscape and portrait orientations.
3. **Generate HLS (HTTP Live Streaming) playlists**, including resolution-specific `.m3u8` files and a master playlist for adaptive streaming.

In short, it takes your video file and prepares it for modern streaming needs, allowing users to choose their desired quality while streaming online.

---

## 🎯 Why Should You Use It?

- **Saves Time:** No more manual FFmpeg commands or figuring out aspect ratios.
- **Web-Ready Outputs:** Perfect for video platforms where users can select quality (just like YouTube or Netflix).
- **Simple Yet Powerful:** A straightforward CLI interface combined with the power of FFmpeg.
- **Supports Both Beginners and Experts:** Even if you’re new to video conversion, VeeStream guides you through the process interactively.

---

## 📦 Installation

First, ensure you have [Node.js](https://nodejs.org/) and [FFmpeg](https://ffmpeg.org/) installed.

Then install VeeStream globally via npm:

```bash
npm install -g veestream
```

Boom! You're all set.

---

## 💻 Usage

Using VeeStream is as simple as having a video file and a goal in mind. Here’s how you can start:

### Basic Command

```bash
veestream -i <input-video-file> -o <output-directory>
```

### Options

| Option               | Description                                            |
| -------------------- | ------------------------------------------------------ |
| `-i, --input <file>` | Input video file (e.g., `video.mp4`).                  |
| `-o, --output <dir>` | Output directory for converted files.                  |
| `-a, --aspect-ratio` | Aspect ratio: `16:9` (landscape) or `9:16` (portrait). |

### Example

Convert `movie.mp4` to multiple resolutions and store the output in the `streaming-files` folder:

```bash
veestream -i movie.mp4 -o streaming-files -a 16:9
```

If you don’t provide certain options, VeeStream will interactively guide you through the process. For instance, it will:

1. Let you pick a video file from the current directory or manually enter a path.
2. Prompt you to specify an output folder name.
3. Ask for the desired aspect ratio if not provided.

---

## 🎥 How It Works

Here’s what happens under the hood:

1. **Input File:** You provide a video file or select one from the current directory.
2. **Resolution Scaling:** The video is scaled into multiple resolutions based on the aspect ratio:
   - **Landscape (16:9):** 144p, 240p, 360p, 480p, 720p, 1080p.
   - **Portrait (9:16):** 144p, 240p, 360p, 480p, 720p, 1080p.
3. **HLS Playlist Generation:** Each resolution gets its own `.m3u8` playlist, and a master playlist (`playlist.m3u8`) ties it all together for adaptive streaming.
4. **Output:** All files are neatly organized in the specified output folder.

**Example Output Structure:**

```
streaming-files/
├── 144p.m3u8
├── 240p.m3u8
├── 360p.m3u8
├── 480p.m3u8
├── 720p.m3u8
├── 1080p.m3u8
├── 144p_001.ts
├── 240p_001.ts
├── ...
└── playlist.m3u8
```

![VeeStream GIF](https://github.com/farhadggu/veestream/raw/main/public/veestream.gif)

---

## 🛠 Behind the Scenes

VeeStream uses the **magic of FFmpeg** to handle video conversion. Each resolution is encoded with:

- **H.264 video codec:** High compatibility with most devices.
- **AAC audio codec:** Crisp sound quality.
- **HLS segmentation:** Breaks videos into small chunks (`.ts` files) for efficient streaming.

The master playlist (`playlist.m3u8`) ensures adaptive streaming. Users can switch between resolutions based on their internet speed.

---

## 😄 Why Should Developers Care?

If you’ve ever struggled with setting up video streams or faced complaints like _"Why isn’t there a quality option on my video player?"_, VeeStream is here to save your day. It bridges the gap between technical complexities and simple implementation.

Also, let’s be honest, as do you really want to write FFmpeg commands manually? (Hint: The answer is "No.")

---

## 💡 Fun Fact

Did you know that if you watch videos at 144p, you’re saving your internet for future generations? Okay, maybe not. But now you can tell your users they have the option!

---

## 📝 License

VeeStream is open-source and free to use under the MIT License.

---

## 👏 Contribute

We’d love your help to make VeeStream even better! Check out our GitHub repo to get started:

[GitHub Repository](https://github.com/farhadggu/veestream)

---

## 💬 Questions or Feedback?

Reach out or file an issue on GitHub. Let’s make video streaming a breeze for everyone.

---

Happy streaming! 🎥✨
