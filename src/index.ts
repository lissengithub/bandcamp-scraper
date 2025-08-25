import req from 'tinyreq';
import * as urlHelper from 'url';
import * as htmlParser from './htmlParser';
import * as utils from './utils';
import { HttpsProxyAgent } from 'https-proxy-agent';
import {
  SearchParams,
  SearchResult,
  AlbumInfo,
  Callback,
  Response,
  MerchItem,
  ProxyConfig
} from './types';

function createRequestOptions(url: string, proxyConfig?: ProxyConfig): any {
  if (!proxyConfig?.url) {
    return url;
  }
  return {
    url,
    agent: new HttpsProxyAgent(proxyConfig.url)
  };
}

export function search(params: SearchParams, cb: Callback<SearchResult[]>, proxyConfig?: ProxyConfig): void {
  const url = utils.generateSearchUrl(params)
  const requestOptions = createRequestOptions(url, proxyConfig)
  req(requestOptions, function (error: Error | null, html: string) {
    if (error) {
      cb(error, null)
    } else {
      const searchResults = htmlParser.parseSearchResults(html)
      cb(null, searchResults)
    }
  })
}

export function getAlbumUrls(artistUrl: string, cb: Callback<string[]>, proxyConfig?: ProxyConfig): void {
  const musicUrl = new urlHelper.URL('/music', artistUrl).toString()
  const requestOptions = createRequestOptions(musicUrl, proxyConfig);
  req(requestOptions, function (error: Error | null, html: string) {
    if (error) {
      cb(error, null)
    } else {
      const albumUrls = htmlParser.parseAlbumUrls(html, artistUrl)
      cb(null, albumUrls)
    }
  })
}

export async function promiseGetAlbumUrls(artistUrl: string, proxyConfig?: ProxyConfig): Promise<Response<string[]>> {
  const musicUrl = new urlHelper.URL('/music', artistUrl).toString()
  try {
    const requestOptions = createRequestOptions(musicUrl, proxyConfig);
    const html = await req(requestOptions);
    if (!html) {
      return { error: new Error(`Failed to get album urls for ${artistUrl}`), data: null }
    }
    const albumUrls = htmlParser.parseAlbumUrls(html, artistUrl);
    return { error: null, data: albumUrls }
  } catch (error) {
    return { error: error as Error, data: null }
  }
}

export async function getUrls(artistUrl: string, proxyConfig?: ProxyConfig): Promise<Response<{ urls: string[], origin: string }>> {
  const musicUrl = new urlHelper.URL('/music', artistUrl).toString()
  try {
    const requestOptions = createRequestOptions(musicUrl, proxyConfig);
    const html = await req(requestOptions);
    if (!html) {
      return { error: new Error(`Failed to get album urls for ${artistUrl}`), data: null }
    }
    const albumUrls = htmlParser.parseAlbumUrlsWithOrigin(html, artistUrl);
    return { error: null, data: albumUrls }
  } catch (error) {
    return { error: error as Error, data: null }
  }
}

export function getAlbumInfo(albumUrl: string, cb: Callback<AlbumInfo>, proxyConfig?: ProxyConfig): void {
  const requestOptions = createRequestOptions(albumUrl, proxyConfig);
  req(requestOptions, function (error: Error | null, html: string) {
    if (error) {
      cb(error, null)
    } else {
      const albumInfo = htmlParser.parseAlbumInfo(html, albumUrl)
      cb(null, albumInfo)
    }
  })
}

/** Gets album or track info for a given album/track URL. */
export async function promiseGetAlbumInfo(albumUrl: string, proxyConfig?: ProxyConfig): Promise<Response<AlbumInfo>> {
  try {
    const requestOptions = createRequestOptions(albumUrl, proxyConfig);
    const html = await req(requestOptions);
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

export function getArtistUrls(labelUrl: string, cb: Callback<string[]>, proxyConfig?: ProxyConfig): void {
  const artistsUrl = new urlHelper.URL('/artists', labelUrl).toString()
  const requestOptions = createRequestOptions(artistsUrl, proxyConfig);
  req(requestOptions, function (error: Error | null, html: string) {
    if (error) {
      cb(error, null)
    } else {
      const artistUrls = htmlParser.parseArtistUrls(html, labelUrl)
      cb(null, artistUrls)
    }
  })
}

export function hasMerch(artistUrl: string, cb: Callback<boolean>, proxyConfig?: ProxyConfig): void {
  const merchUrl = new urlHelper.URL('/merch', artistUrl).toString()
  const requestOptions = createRequestOptions(merchUrl, proxyConfig);
  req(requestOptions, function (error: Error | null, html: string) {
    if (error) {
      cb(error, null)
    } else {
      const hasMerchItems = htmlParser.hasMerch(html)
      cb(null, hasMerchItems)
    }
  })
}

export function getMerchInfo(artistUrl: string, cb: Callback<any>, proxyConfig?: ProxyConfig): void {
  const merchUrl = new urlHelper.URL('/merch', artistUrl).toString()
  const requestOptions = createRequestOptions(merchUrl, proxyConfig);
  req(requestOptions, function (error: Error | null, html: string) {
    if (error) {
      cb(error, null)
    } else {
      const merchItems = htmlParser.parseMerchInfo(html, artistUrl)
      cb(null, merchItems)
    }
  })
}

export async function promiseGetMerchInfo(artistUrl: string, proxyConfig?: ProxyConfig): Promise<Response<MerchItem[]>> {
  const merchUrl = new urlHelper.URL('/merch', artistUrl).toString()
  try {
    const requestOptions = createRequestOptions(merchUrl, proxyConfig);
    const html = await req(requestOptions);
    if (!html) {
      return { error: new Error(`Failed to get merch info for ${artistUrl}`), data: null }
    }
    const merchItems = htmlParser.parseMerchInfo(html, artistUrl)
    return { error: null, data: merchItems }
  } catch (error) {
    return { error: error as Error, data: null }
  }
}

// Export types for consumers
export * from './types'; 