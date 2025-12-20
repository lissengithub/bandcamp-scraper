import { SearchParams, SearchResult, AlbumInfo, Callback, Response, MerchItem, ProxyConfig } from "./types";
export declare function search(params: SearchParams, cb: Callback<SearchResult[]>, proxyConfig?: ProxyConfig): void;
export declare function getAlbumUrls(artistUrl: string, cb: Callback<string[]>, proxyConfig?: ProxyConfig): void;
export declare function promiseGetAlbumUrls(artistUrl: string, proxyConfig?: ProxyConfig): Promise<Response<string[]>>;
export declare function getUrls(artistUrl: string, proxyConfig?: ProxyConfig): Promise<Response<{
    urls: string[];
    origin: string;
}>>;
export declare function getAlbumInfo(albumUrl: string, cb: Callback<AlbumInfo>, proxyConfig?: ProxyConfig): void;
/** Gets album or track info for a given album/track URL. */
export declare function promiseGetAlbumInfo(albumUrl: string, proxyConfig?: ProxyConfig): Promise<Response<AlbumInfo>>;
export declare function getArtistUrls(labelUrl: string, cb: Callback<string[]>, proxyConfig?: ProxyConfig): void;
export declare function hasMerch(artistUrl: string, cb: Callback<boolean>, proxyConfig?: ProxyConfig): void;
export declare function getMerchInfo(artistUrl: string, cb: Callback<any>, proxyConfig?: ProxyConfig): void;
export declare function promiseGetMerchInfo(artistUrl: string, proxyConfig?: ProxyConfig): Promise<Response<MerchItem[]>>;
/**
 * Downloads a track's audio file to a local file path.
 *
 * @param trackUrl - The Bandcamp track URL
 * @param outputPath - Where to save the file (optional, defaults to "Artist - Title.mp3")
 * @param format - Audio format to download (default: 'mp3-128')
 * @param proxyConfig - Optional proxy configuration
 * @returns Promise with the file path where the track was saved
 */
export declare function promiseDownloadTrack(trackUrl: string, outputPath?: string, format?: string, proxyConfig?: ProxyConfig): Promise<Response<{
    filePath: string;
    trackInfo: AlbumInfo;
}>>;
/**
 * Downloads a track's audio file and returns it as a Buffer.
 * Useful for cloud functions that need to upload to cloud storage.
 *
 * @param trackUrl - The Bandcamp track URL
 * @param format - Audio format to download (default: 'mp3-128')
 * @param proxyConfig - Optional proxy configuration
 * @returns Promise with the audio file as a Buffer and track metadata
 */
export declare function promiseGetTrackBuffer(trackUrl: string, format?: string, proxyConfig?: ProxyConfig): Promise<Response<{
    buffer: Buffer;
    trackInfo: AlbumInfo;
    mimeType: string;
}>>;
export * from "./types";
export * from "./utils";
//# sourceMappingURL=index.d.ts.map