import req from 'tinyreq';
import * as urlHelper from 'url';
import * as htmlParser from './htmlParser';
import * as utils from './utils';
import {
  SearchParams,
  SearchResult,
  AlbumInfo,
  Callback,
  Response,
  MerchItem
} from './types';

export function search(params: SearchParams, cb: Callback<SearchResult[]>): void {
  const url = utils.generateSearchUrl(params)
  req(url, function (error: Error | null, html: string) {
    if (error) {
      cb(error, null)
    } else {
      const searchResults = htmlParser.parseSearchResults(html)
      cb(null, searchResults)
    }
  })
}

export function getAlbumUrls(artistUrl: string, cb: Callback<string[]>): void {
  const musicUrl = new urlHelper.URL('/music', artistUrl).toString()
  req(musicUrl, function (error: Error | null, html: string) {
    if (error) {
      cb(error, null)
    } else {
      const albumUrls = htmlParser.parseAlbumUrls(html, artistUrl)
      cb(null, albumUrls)
    }
  })
}

export async function promiseGetAlbumUrls(artistUrl: string): Promise<Response<string[]>> {
  const musicUrl = new urlHelper.URL('/music', artistUrl).toString()
  try {
    const html = await req(musicUrl);
    if (!html) {
      return { error: new Error(`Failed to get album urls for ${artistUrl}`), data: null }
    }
    const albumUrls = htmlParser.parseAlbumUrls(html, artistUrl);
    return { error: null, data: albumUrls }
  } catch (error) {
    return { error: error as Error, data: null }
  }
}

export function getAlbumInfo(albumUrl: string, cb: Callback<AlbumInfo>): void {
  req(albumUrl, function (error: Error | null, html: string) {
    if (error) {
      cb(error, null)
    } else {
      const albumInfo = htmlParser.parseAlbumInfo(html, albumUrl)
      cb(null, albumInfo)
    }
  })
}

/** Gets album or track info for a given album/track URL. */
export async function promiseGetAlbumInfo(albumUrl: string): Promise<Response<AlbumInfo>> {
  try {
    const html = await req(albumUrl);
    if (!html) {
      return { error: new Error(`Failed to get album info for ${albumUrl}`), data: null }
    }
    const albumInfo = htmlParser.parseAlbumInfo(html, albumUrl);
    if (!albumInfo) {
      return { error: new Error(`Failed to parse album info for ${albumUrl}`), data: null }
    }
    return { error: null, data: albumInfo }
  } catch (error) {
    return { error: error as Error, data: null }
  }
}

export function getArtistUrls(labelUrl: string, cb: Callback<string[]>): void {
  const artistsUrl = new urlHelper.URL('/artists', labelUrl).toString()
  req(artistsUrl, function (error: Error | null, html: string) {
    if (error) {
      cb(error, null)
    } else {
      const artistUrls = htmlParser.parseArtistUrls(html, labelUrl)
      cb(null, artistUrls)
    }
  })
}

export function hasMerch(artistUrl: string, cb: Callback<boolean>): void {
  const merchUrl = new urlHelper.URL('/merch', artistUrl).toString()
  req(merchUrl, function (error: Error | null, html: string) {
    if (error) {
      cb(error, null)
    } else {
      const hasMerchItems = htmlParser.hasMerch(html)
      cb(null, hasMerchItems)
    }
  })
}

export function getMerchInfo(artistUrl: string, cb: Callback<any>): void {
  const merchUrl = new urlHelper.URL('/merch', artistUrl).toString()
  req(merchUrl, function (error: Error | null, html: string) {
    if (error) {
      cb(error, null)
    } else {
      const merchItems = htmlParser.parseMerchInfo(html, artistUrl)
      cb(null, merchItems)
    }
  })
}

export async function promiseGetMerchInfo(artistUrl: string): Promise<Response<MerchItem[]>> {
  const merchUrl = new urlHelper.URL('/merch', artistUrl).toString()
  try {
    const html = await req(merchUrl);
    const merchItems = htmlParser.parseMerchInfo(html, artistUrl)
    return { error: null, data: merchItems }
  } catch (error) {
    return { error: error as Error, data: null }
  }
}

// Export types for consumers
export * from './types'; 