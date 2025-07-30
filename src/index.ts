import req from 'tinyreq';
import * as urlHelper from 'url';
import * as htmlParser from './htmlParser';
import * as utils from './utils';
import {
  SearchParams,
  TagParams,
  SearchResult,
  TagResult,
  AlbumInfo,
  AlbumProduct, 
  ArtistInfo, 
  TrackInfo,
  MerchItem,
  Callback 
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

export function getAlbumsWithTag(params: TagParams, cb: Callback<TagResult[]>): void {
  const url = utils.generateTagUrl(params)
  req(url, function (error: Error | null, html: string) {
    if (error) {
      cb(error, null)
    } else {
      const tagResults = htmlParser.parseTagResults(html)
      cb(null, tagResults)
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

export function getAlbumProducts(albumUrl: string, cb: Callback<AlbumProduct[]>): void {
  req(albumUrl, function (error: Error | null, html: string) {
    if (error) {
      cb(error, null)
    } else {
      const products = htmlParser.parseAlbumProducts(html, albumUrl)
      cb(null, products)
    }
  })
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

export function getTrackInfo(trackUrl: string, cb: Callback<TrackInfo>): void {
  req(trackUrl, function (error: Error | null, html: string) {
    if (error) {
      cb(error, null)
    } else {
      const trackInfo = htmlParser.parseTrackInfo(html, trackUrl)
      cb(null, trackInfo)
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

export function getMerch(artistUrl: string, cb: Callback<MerchItem[]>): void {
  const merchUrl = new urlHelper.URL('/merch', artistUrl).toString()
  req(merchUrl, function (error: Error | null, html: string) {
    if (error) {
      cb(error, null)
    } else {
      const merchItems = htmlParser.parseMerch(html, merchUrl)
      cb(null, merchItems)
    }
  })
}

// Export types for consumers
export * from './types'; 