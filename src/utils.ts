import { SearchParams, TagParams, AlbumInfo } from './types';

function createQueryString(params: Record<string, any>): string {
  return Object.keys(params).map(function (name) {
    return name + '=' + encodeURIComponent(params[name])
  }).join('&')
}

export function generateSearchUrl(params: SearchParams): string {
  if (!params || typeof params !== 'object') {
    throw new Error('Expect params to be an object.')
  }
  // required
  if (!Object.prototype.hasOwnProperty.call(params, 'query') || typeof params.query !== 'string') {
    throw new Error('Expect params to have string property named query.')
  }
  // optional
  if (Object.prototype.hasOwnProperty.call(params, 'page') && typeof params.page !== 'number') {
    throw new Error('Expect params named page to be type number.')
  }
  const searchParams = {
    q: params.query,
    page: params.page || 1
  }
  return 'https://bandcamp.com/search?' + createQueryString(searchParams)
}

export function generateTagUrl(params: TagParams): string {
  if (!params || typeof params !== 'object') {
    throw new Error('Expect params to be an object.')
  }
  // required
  if (!Object.prototype.hasOwnProperty.call(params, 'tag') || typeof params.tag !== 'string') {
    throw new Error('Expect params to have string property named tag.')
  }
  // optional
  if (Object.prototype.hasOwnProperty.call(params, 'page') && typeof params.page !== 'number') {
    throw new Error('Expect params named page to be type number.')
  }
  const tag = params.tag
  const tagParams = {
    page: params.page || 1
  }
  return 'https://bandcamp.com/tag/' + encodeURIComponent(tag) + '?' + createQueryString(tagParams)
}

/**
 * Extracts audio file URLs from AlbumInfo.
 * For tracks, returns the audio URL for the track.
 * For albums, returns an array of audio URLs for all tracks.
 * 
 * @param albumInfo - The AlbumInfo object from getAlbumInfo
 * @param format - Audio format preference (default: 'mp3-128'). Options: 'mp3-128', 'mp3-v0', 'flac', etc.
 * @returns For tracks: string | null, For albums: Array<{trackName: string, url: string | null}>
 */
export function getAudioUrls(albumInfo: AlbumInfo, format: string = 'mp3-128'): string | null | Array<{ trackName: string; url: string | null }> {
  if (!albumInfo || !albumInfo.raw || !albumInfo.raw.trackinfo || albumInfo.raw.trackinfo.length === 0) {
    return null
  }

  // If it's a single track (trackinfo has only one item and item_type is 'track')
  if (albumInfo.raw.item_type === 'track' && albumInfo.raw.trackinfo.length === 1) {
    const track = albumInfo.raw.trackinfo[0]
    return track.file && track.file[format] ? track.file[format] : null
  }

  // If it's an album, return array of track URLs
  return albumInfo.raw.trackinfo.map(track => ({
    trackName: track.title || 'Unknown',
    url: track.file && track.file[format] ? track.file[format] : null
  }))
}

/**
 * Gets the download page URL for free tracks.
 * This is useful if you need to go through the official download flow.
 * 
 * @param albumInfo - The AlbumInfo object from getAlbumInfo
 * @returns The download page URL or null if not available
 */
export function getDownloadPageUrl(albumInfo: AlbumInfo): string | null {
  if (!albumInfo || !albumInfo.raw) {
    return null
  }
  return albumInfo.raw.freeDownloadPage || null
} 