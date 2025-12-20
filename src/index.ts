import req from "tinyreq";
import * as urlHelper from "url";
import * as htmlParser from "./htmlParser";
import * as utils from "./utils";
import { HttpsProxyAgent } from "https-proxy-agent";
import * as https from "https";
import * as http from "http";
import * as fs from "fs";
import {
  SearchParams,
  SearchResult,
  AlbumInfo,
  Callback,
  Response,
  MerchItem,
  ProxyConfig,
} from "./types";

function createRequestOptions(url: string, proxyConfig?: ProxyConfig): any {
  if (!proxyConfig?.url) {
    return url;
  }
  return {
    url,
    agent: new HttpsProxyAgent(proxyConfig.url),
  };
}

export function search(
  params: SearchParams,
  cb: Callback<SearchResult[]>,
  proxyConfig?: ProxyConfig
): void {
  const url = utils.generateSearchUrl(params);
  const requestOptions = createRequestOptions(url, proxyConfig);
  req(requestOptions, function (error: Error | null, html: string) {
    if (error) {
      cb(error, null);
    } else {
      const searchResults = htmlParser.parseSearchResults(html);
      cb(null, searchResults);
    }
  });
}

export function getAlbumUrls(
  artistUrl: string,
  cb: Callback<string[]>,
  proxyConfig?: ProxyConfig
): void {
  const musicUrl = new urlHelper.URL("/music", artistUrl).toString();
  const requestOptions = createRequestOptions(musicUrl, proxyConfig);
  req(requestOptions, function (error: Error | null, html: string) {
    if (error) {
      cb(error, null);
    } else {
      const albumUrls = htmlParser.parseAlbumUrls(html, artistUrl);
      cb(null, albumUrls);
    }
  });
}

export async function promiseGetAlbumUrls(
  artistUrl: string,
  proxyConfig?: ProxyConfig
): Promise<Response<string[]>> {
  const musicUrl = new urlHelper.URL("/music", artistUrl).toString();
  try {
    const requestOptions = createRequestOptions(musicUrl, proxyConfig);
    const html = await req(requestOptions);
    if (!html) {
      return {
        error: new Error(`Failed to get album urls for ${artistUrl}`),
        data: null,
      };
    }
    const albumUrls = htmlParser.parseAlbumUrls(html, artistUrl);
    return { error: null, data: albumUrls };
  } catch (error) {
    return { error: error as Error, data: null };
  }
}

export async function getUrls(
  artistUrl: string,
  proxyConfig?: ProxyConfig
): Promise<Response<{ urls: string[]; origin: string }>> {
  const musicUrl = new urlHelper.URL("/music", artistUrl).toString();
  try {
    const requestOptions = createRequestOptions(musicUrl, proxyConfig);
    const html = await req(requestOptions);
    if (!html) {
      return {
        error: new Error(`Failed to get album urls for ${artistUrl}`),
        data: null,
      };
    }
    const albumUrls = htmlParser.parseAlbumUrlsWithOrigin(html, artistUrl);
    return { error: null, data: albumUrls };
  } catch (error) {
    return { error: error as Error, data: null };
  }
}

export function getAlbumInfo(
  albumUrl: string,
  cb: Callback<AlbumInfo>,
  proxyConfig?: ProxyConfig
): void {
  const requestOptions = createRequestOptions(albumUrl, proxyConfig);
  req(requestOptions, function (error: Error | null, html: string) {
    if (error) {
      cb(error, null);
    } else {
      const albumInfo = htmlParser.parseAlbumInfo(html, albumUrl);
      cb(null, albumInfo);
    }
  });
}

/** Gets album or track info for a given album/track URL. */
export async function promiseGetAlbumInfo(
  albumUrl: string,
  proxyConfig?: ProxyConfig
): Promise<Response<AlbumInfo>> {
  try {
    const requestOptions = createRequestOptions(albumUrl, proxyConfig);
    const html = await req(requestOptions);
    if (!html) {
      return {
        error: new Error(`Failed to get album info for ${albumUrl}`),
        data: null,
      };
    }
    const albumInfo = htmlParser.parseAlbumInfo(html, albumUrl);
    if (!albumInfo) {
      return {
        error: new Error(`Failed to parse album info for ${albumUrl}`),
        data: null,
      };
    }
    return { error: null, data: albumInfo };
  } catch (error) {
    return { error: error as Error, data: null };
  }
}

export function getArtistUrls(
  labelUrl: string,
  cb: Callback<string[]>,
  proxyConfig?: ProxyConfig
): void {
  const artistsUrl = new urlHelper.URL("/artists", labelUrl).toString();
  const requestOptions = createRequestOptions(artistsUrl, proxyConfig);
  req(requestOptions, function (error: Error | null, html: string) {
    if (error) {
      cb(error, null);
    } else {
      const artistUrls = htmlParser.parseArtistUrls(html, labelUrl);
      cb(null, artistUrls);
    }
  });
}

export function hasMerch(
  artistUrl: string,
  cb: Callback<boolean>,
  proxyConfig?: ProxyConfig
): void {
  const merchUrl = new urlHelper.URL("/merch", artistUrl).toString();
  const requestOptions = createRequestOptions(merchUrl, proxyConfig);
  req(requestOptions, function (error: Error | null, html: string) {
    if (error) {
      cb(error, null);
    } else {
      const hasMerchItems = htmlParser.hasMerch(html);
      cb(null, hasMerchItems);
    }
  });
}

export function getMerchInfo(
  artistUrl: string,
  cb: Callback<any>,
  proxyConfig?: ProxyConfig
): void {
  const merchUrl = new urlHelper.URL("/merch", artistUrl).toString();
  const requestOptions = createRequestOptions(merchUrl, proxyConfig);
  req(requestOptions, function (error: Error | null, html: string) {
    if (error) {
      cb(error, null);
    } else {
      const merchItems = htmlParser.parseMerchInfo(html, artistUrl);
      cb(null, merchItems);
    }
  });
}

export async function promiseGetMerchInfo(
  artistUrl: string,
  proxyConfig?: ProxyConfig
): Promise<Response<MerchItem[]>> {
  const merchUrl = new urlHelper.URL("/merch", artistUrl).toString();
  try {
    const requestOptions = createRequestOptions(merchUrl, proxyConfig);
    const html = await req(requestOptions);
    if (!html) {
      return {
        error: new Error(`Failed to get merch info for ${artistUrl}`),
        data: null,
      };
    }
    const merchItems = htmlParser.parseMerchInfo(html, artistUrl);
    return { error: null, data: merchItems };
  } catch (error) {
    return { error: error as Error, data: null };
  }
}

/**
 * Downloads a track's audio file to a local file path.
 *
 * @param trackUrl - The Bandcamp track URL
 * @param outputPath - Where to save the file (optional, defaults to "Artist - Title.mp3")
 * @param format - Audio format to download (default: 'mp3-128')
 * @param proxyConfig - Optional proxy configuration
 * @returns Promise with the file path where the track was saved
 */
export async function promiseDownloadTrack(
  trackUrl: string,
  outputPath?: string,
  format: string = "mp3-128",
  proxyConfig?: ProxyConfig
): Promise<Response<{ filePath: string; trackInfo: AlbumInfo }>> {
  try {
    // Get album info using the scraper
    const albumInfoResponse = await promiseGetAlbumInfo(trackUrl, proxyConfig);

    if (albumInfoResponse.error) {
      return { error: albumInfoResponse.error, data: null };
    }

    if (!albumInfoResponse.data) {
      return { error: new Error("No album info found"), data: null };
    }

    const albumInfo = albumInfoResponse.data;

    // Extract audio URL
    const audioUrl = utils.getAudioUrls(albumInfo, format);

    if (!audioUrl || typeof audioUrl !== "string") {
      return {
        error: new Error("No audio URL found for this track"),
        data: null,
      };
    }

    // Determine output filename
    const extension = format === "flac" ? "flac" : "mp3";
    const filename =
      outputPath ||
      `${albumInfo.artist} - ${albumInfo.title}.${extension}`.replace(
        /[^\w\s.-]/g,
        ""
      );

    // Download the file
    await downloadFileToPath(audioUrl, filename, proxyConfig);

    return { error: null, data: { filePath: filename, trackInfo: albumInfo } };
  } catch (error) {
    return { error: error as Error, data: null };
  }
}

/**
 * Downloads a track's audio file and returns it as a Buffer.
 * Useful for cloud functions that need to upload to cloud storage.
 *
 * @param trackUrl - The Bandcamp track URL
 * @param format - Audio format to download (default: 'mp3-128')
 * @param proxyConfig - Optional proxy configuration
 * @returns Promise with the audio file as a Buffer and track metadata
 */
export async function promiseGetTrackBuffer(
  trackUrl: string,
  format: string = "mp3-128",
  proxyConfig?: ProxyConfig
): Promise<
  Response<{ buffer: Buffer; trackInfo: AlbumInfo; mimeType: string }>
> {
  try {
    // Get album info using the scraper
    const albumInfoResponse = await promiseGetAlbumInfo(trackUrl, proxyConfig);

    if (albumInfoResponse.error) {
      return { error: albumInfoResponse.error, data: null };
    }

    if (!albumInfoResponse.data) {
      return { error: new Error("No album info found"), data: null };
    }

    const albumInfo = albumInfoResponse.data;

    // Extract audio URL
    const audioUrl = utils.getAudioUrls(albumInfo, format);

    if (!audioUrl || typeof audioUrl !== "string") {
      return {
        error: new Error("No audio URL found for this track"),
        data: null,
      };
    }

    // Download to buffer
    const buffer = await downloadFileToBuffer(audioUrl, proxyConfig);
    const mimeType = format === "flac" ? "audio/flac" : "audio/mpeg";

    return { error: null, data: { buffer, trackInfo: albumInfo, mimeType } };
  } catch (error) {
    return { error: error as Error, data: null };
  }
}

/**
 * Downloads a file from a URL to a local file path
 */
function downloadFileToPath(
  fileUrl: string,
  outputPath: string,
  proxyConfig?: ProxyConfig
): Promise<void> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(fileUrl);
    const client = urlObj.protocol === "https:" ? https : http;

    const file = fs.createWriteStream(outputPath);

    const requestOptions: any = {};
    if (proxyConfig?.url && urlObj.protocol === "https:") {
      requestOptions.agent = new HttpsProxyAgent(proxyConfig.url);
    }

    client
      .get(fileUrl, requestOptions, (response) => {
        if (response.statusCode !== 200) {
          fs.unlink(outputPath, () => {}); // Delete the file on error
          reject(
            new Error(
              `Failed to download: ${response.statusCode} ${response.statusMessage}`
            )
          );
          return;
        }

        response.pipe(file);

        file.on("finish", () => {
          file.close();
          resolve();
        });
      })
      .on("error", (err) => {
        fs.unlink(outputPath, () => {}); // Delete the file on error
        reject(err);
      });
  });
}

/**
 * Downloads a file from a URL and returns it as a Buffer
 */
function downloadFileToBuffer(
  fileUrl: string,
  proxyConfig?: ProxyConfig
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(fileUrl);
    const client = urlObj.protocol === "https:" ? https : http;

    const chunks: Buffer[] = [];

    const requestOptions: any = {};
    if (proxyConfig?.url && urlObj.protocol === "https:") {
      requestOptions.agent = new HttpsProxyAgent(proxyConfig.url);
    }

    client
      .get(fileUrl, requestOptions, (response) => {
        if (response.statusCode !== 200) {
          reject(
            new Error(
              `Failed to download: ${response.statusCode} ${response.statusMessage}`
            )
          );
          return;
        }

        response.on("data", (chunk: Buffer) => {
          chunks.push(chunk);
        });

        response.on("end", () => {
          resolve(Buffer.concat(chunks));
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

// Export types and utilities for consumers
export * from "./types";
export * from "./utils";
