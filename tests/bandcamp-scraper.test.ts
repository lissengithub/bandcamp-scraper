import { describe, it, expect } from 'vitest'
import * as bandcamp from '../dist/index'

const artists = [
  'bonobomusic',
  'Giraffage',
  'Cœur de pirate',
  'Tiger Jazz Club',
  'Mac DeMarco',
  'Faded Paper Figures'
]

const tags = [
  'nuwrld',
  'brooklyn',
  'coldwave',
  'punk',
  'jazz'
]

const artistUrls = [
  'http://musique.coeurdepirate.com',
  'https://macdemarco.bandcamp.com',
  'https://fadedpaperfigures.bandcamp.com',
  'https://tigerjazzclub.bandcamp.com',
  'https://bonobomusic.bandcamp.com',
  'https://giraffage.bandcamp.com'
]

const albumUrls = [
  'https://bonobomusic.bandcamp.com/album/migration',
  'https://bonobomusic.bandcamp.com/album/les-l-bas-bonobo-remix',
  'https://bonobomusic.bandcamp.com/album/flashlight-ep',
  'https://bonobomusic.bandcamp.com/album/the-north-borders-tour-live',
  'https://bonobomusic.bandcamp.com/album/ten-tigers',
  'https://bonobomusic.bandcamp.com/album/the-north-borders-2',
  'https://bonobomusic.bandcamp.com/album/black-sands-remixed',
  'https://bonobomusic.bandcamp.com/album/black-sands',
  'https://bonobomusic.bandcamp.com/album/days-to-come',
  'https://bonobomusic.bandcamp.com/album/dial-m-for-monkey',
  'http://musique.coeurdepirate.com/album/roses',
  'http://musique.coeurdepirate.com/album/blonde',
  'http://musique.coeurdepirate.com/album/coeur-de-pirate',
  'https://giraffage.bandcamp.com/album/needs',
  'https://giraffage.bandcamp.com/album/comfort',
  'https://giraffage.bandcamp.com/album/pretty-things-ep',
  'https://tigerjazzclub.bandcamp.com/album/cr-me-d-lice',
  'https://tigerjazzclub.bandcamp.com/album/tiger-jazz-club',
  'https://fadedpaperfigures.bandcamp.com/album/chronos',
  'https://fadedpaperfigures.bandcamp.com/album/remnants-ep',
  'https://fadedpaperfigures.bandcamp.com/album/relics',
  'https://fadedpaperfigures.bandcamp.com/album/the-matter',
  'https://fadedpaperfigures.bandcamp.com/album/new-medium',
  'https://fadedpaperfigures.bandcamp.com/album/dynamo',
  'https://macdemarco.bandcamp.com/album/another-one',
  'https://macdemarco.bandcamp.com/album/salad-days',
  'https://macdemarco.bandcamp.com/album/2',
  'https://macdemarco.bandcamp.com/album/rock-and-roll-night-club-2',
  'https://fasterthanmusic.bandcamp.com/album/pr4kaneokastrna-ep'
]

const labelsUrls = [
  'https://planetmu.bandcamp.com',
  'https://randsrecords.bandcamp.com'
]

const trackUrls = [
  'https://dafnez.bandcamp.com/track/serenade',
  'https://xaerarch.bandcamp.com/track/devour-303-absynth-mix',
  'https://backtick.bandcamp.com/track/approx-start-06-51',
  'https://ripcordz.bandcamp.com/track/the-beta-58s-leave-me-alone'
]

function sample(array: string[]): string {
  const index = Math.floor(Math.random() * array.length)
  return array[index]
}

// Helper function to promisify callback-based functions
function promisify<T>(fn: (callback: (error: Error | null, result: T | null) => void) => void): Promise<T | null> {
  return new Promise((resolve, reject) => {
    fn((error, result) => {
      if (error) {
        reject(error)
      } else {
        resolve(result)
      }
    })
  })
}

describe('bandcamp-scraper', () => {
  describe('search', () => {
    it('scrape search results', async () => {
      const artist = sample(artists)
      const searchResults = await promisify<any[]>((callback) => 
        bandcamp.search({ query: artist }, callback)
      )
      
      if (searchResults) console.log('searchResults', searchResults)
      expect(Array.isArray(searchResults)).toBe(true)
      if (searchResults) {
        expect(searchResults.length).toBeGreaterThan(0)
      }
      // TODO validate with JSON schema
    })
  })

  describe('getAlbumsWithTag', () => {
    it('scrape tag name and artist', async () => {
      const tag = sample(tags)
      const albums = await promisify<any[]>((callback) => 
        bandcamp.getAlbumsWithTag({ tag: tag }, callback)
      )
      
      if (albums) console.log('albums', albums)
      expect(Array.isArray(albums)).toBe(true)
      if (albums) {
        expect(albums.length).toBeGreaterThan(0)
      }
      // TODO validate with JSON schema
    })
  })

  describe('getAlbumUrls', () => {
    it('scrape album urls', async () => {
      const artistUrl = sample(artistUrls)
      const albumUrls = await promisify<string[]>((callback) => 
        bandcamp.getAlbumUrls(artistUrl, callback)
      )
      
      console.log('artistUrl', artistUrl)
      if (albumUrls) console.log('albumUrls', albumUrls)
      expect(Array.isArray(albumUrls)).toBe(true)
      if (albumUrls) {
        expect(albumUrls.length).toBeGreaterThan(0)
      }
      // TODO validate with JSON schema
    })
  })

  describe('getAlbumInfo', () => {
    it('scrape album info', async () => {
      const albumUrl = sample(albumUrls)
      const albumInfo = await promisify<any>((callback) => 
        bandcamp.getAlbumInfo(albumUrl, callback)
      )
      
      console.log('albumUrl', albumUrl)
      if (albumInfo) console.log('albumInfo', albumInfo)
      expect(albumInfo).not.toBeNull()
      expect(typeof albumInfo).toEqual('object')
      // TODO validate with JSON schema
    })
  })

  describe('getAlbumProducts', () => {
    it('scrape album products', async () => {
      const albumUrl = sample(albumUrls)
      const albumProducts = await promisify<any[]>((callback) => 
        bandcamp.getAlbumProducts(albumUrl, callback)
      )
      
      console.log('albumUrl', albumUrl)
      if (albumProducts) console.log('albumProducts', albumProducts)
      expect(Array.isArray(albumProducts)).toBe(true)
      if (albumProducts) {
        expect(albumProducts.length).toBeGreaterThan(0)
      }
      // TODO validate with JSON schema
    })
  })

  describe('getArtistsUrls', () => {
    it('scrape artist urls for a label', async () => {
      const labelUrl = sample(labelsUrls)
      const artistsUrl = await promisify<string[]>((callback) => 
        bandcamp.getArtistUrls(labelUrl, callback)
      )
      
      console.log('artistUrl', artistsUrl)
      if (artistsUrl) console.log('artistsUrl', artistsUrl)
      expect(Array.isArray(artistsUrl)).toBe(true)
      if (artistsUrl) {
        expect(artistsUrl.length).toBeGreaterThan(0)
      }
      // TODO validate with JSON schema
    })
  })

  describe('getTrackInfo', () => {
    it('scrapes track info', async () => {
      const trackUrl = sample(trackUrls)
      const trackInfo = await promisify<any>((callback) => 
        bandcamp.getTrackInfo(trackUrl, callback)
      )
      
      if (trackInfo) console.log(trackInfo)
      expect(typeof trackInfo).toEqual('object')
    })
  })
}) 