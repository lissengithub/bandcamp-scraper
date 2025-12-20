import { promiseDownloadTrack } from "../src/index";

/**
 * Downloads a track from Bandcamp using the scraper
 * This example demonstrates how to use the exported promiseDownloadTrack function
 */
async function downloadTrack(
  trackUrl: string,
  outputPath?: string,
  format: string = "mp3-128"
): Promise<void> {
  console.log("Fetching track info and downloading...");

  const response = await promiseDownloadTrack(trackUrl, outputPath, format);

  if (response.error) {
    throw response.error;
  }

  if (!response.data) {
    throw new Error("No data returned from download");
  }

  console.log("Track:", response.data.trackInfo.title);
  console.log("Artist:", response.data.trackInfo.artist);
  console.log("Downloaded to:", response.data.filePath);
  console.log("Download complete!");
}

// Command-line usage
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error(
    "Usage: ts-node downloadTrack.ts <track-url> [output-path] [format]"
  );
  console.error("");
  console.error("Examples:");
  console.error(
    '  ts-node downloadTrack.ts "https://fineforest.bandcamp.com/track/universal"'
  );
  console.error(
    '  ts-node downloadTrack.ts "https://fineforest.bandcamp.com/track/universal" "my-track.mp3"'
  );
  console.error(
    '  ts-node downloadTrack.ts "https://fineforest.bandcamp.com/track/universal" "my-track.flac" "flac"'
  );
  process.exit(1);
}

const trackUrl = args[0];
const outputPath = args[1];
const format = args[2] || "mp3-128";

downloadTrack(trackUrl, outputPath, format)
  .then(() => {
    console.log("Success!");
  })
  .catch((error) => {
    console.error("Failed:", error);
    process.exit(1);
  });
