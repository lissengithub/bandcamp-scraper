import { SearchParams, TagParams, AlbumInfo } from './types';
export declare function generateSearchUrl(params: SearchParams): string;
export declare function generateTagUrl(params: TagParams): string;
/**
 * Extracts audio file URLs from AlbumInfo.
 * For tracks, returns the audio URL for the track.
 * For albums, returns an array of audio URLs for all tracks.
 *
 * @param albumInfo - The AlbumInfo object from getAlbumInfo
 * @param format - Audio format preference (default: 'mp3-128'). Options: 'mp3-128', 'mp3-v0', 'flac', etc.
 * @returns For tracks: string | null, For albums: Array<{trackName: string, url: string | null}>
 */
export declare function getAudioUrls(albumInfo: AlbumInfo, format?: string): string | null | Array<{
    trackName: string;
    url: string | null;
}>;
/**
 * Gets the download page URL for free tracks.
 * This is useful if you need to go through the official download flow.
 *
 * @param albumInfo - The AlbumInfo object from getAlbumInfo
 * @returns The download page URL or null if not available
 */
export declare function getDownloadPageUrl(albumInfo: AlbumInfo): string | null;
//# sourceMappingURL=utils.d.ts.map