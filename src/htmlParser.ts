import cheerio from 'cheerio';
import * as scrapeIt from 'scrape-it';
import * as urlHelper from 'url';
import linez from 'linez';
import Ajv from 'ajv';
import * as JSON5 from 'json5';
import { SearchResult, TagResult, AlbumInfo, TrackInfo, ArtistInfo, AlbumProduct } from './types';

// add search-result Schema
const ajv = new Ajv();
ajv.addSchema(require('../schemas/search-result.json'), 'search-result');
ajv.addSchema(require('../schemas/album-product.json'), 'album-product');
ajv.addSchema(require('../schemas/album-info.json'), 'album-info');
ajv.addSchema(require('../schemas/tag-result.json'), 'tag-result');
ajv.addSchema(require('../schemas/track-info.json'), 'track-info');

linez.configure({
  newlines: ['\n', '\r\n', '\r']
});

const removeMultipleSpace = function (text: string): string {
  return text.replace(/\s{2,}/g, ' ')
}

const removeNewLine = function (text: string): string {
  const lines = linez(text).lines.map(function (line: any) {
    return line.text.trim()
  }).join(' ')
  return removeMultipleSpace(lines)
}

const assignProps = function (objFrom: any, objTo: any, propNames: string[]): any {
  propNames.forEach(function (propName) {
    objTo[propName] = objFrom[propName]
  })
  return objTo
}

// parse search results
export function parseSearchResults(html: string): SearchResult[] {
  const $ = cheerio.load(html)
  const data = scrapeIt.scrapeHTML($, {
    results: {
      listItem: '.result-items li',
      data: {
        type: {
          selector: '.itemtype',
          convert: function (text: string) {
            return text.toLowerCase()
          }
        },
        name: { selector: '.heading' },
        url: { selector: '.itemurl' },
        imageUrl: { selector: '.art img', attr: 'src' },
        tags: {
          selector: '.tags',
          convert: function (text: string) {
            const tags = text.replace('tags:', '').replace(/\s/g, '')
            return tags.length > 1 ? tags.split(',') : []
          }
        },
        genre: {
          selector: '.genre',
          convert: function (text: string) {
            return removeMultipleSpace(text.replace('genre:', ''))
          }
        },
        subhead: {
          selector: '.subhead',
          convert: function (text: string) {
            return removeMultipleSpace(text)
          }
        },
        releaseDate: {
          selector: '.released',
          convert: function (text: string) {
            return text.replace('released ', '')
          }
        },
        numTracks: {
          selector: '.length',
          convert: function (text: string) {
            const info = text.split(',')
            if (info.length === 2) {
              return parseInt(info[0].replace(' tracks', ''))
            }
            return undefined
          }
        },
        numMinutes: {
          selector: '.length',
          convert: function (text: string) {
            const info = text.split(',')
            if (info.length === 2) {
              return parseInt(info[1].replace(' minutes', ''))
            }
            return undefined
          }
        }
      }
    }
  })
  return data.results.reduce(function (results: SearchResult[], result: any) {
    // basic properties
    let object = assignProps(result, {}, ['type', 'name', 'url', 'imageUrl', 'tags'])
    // specific properties
    switch (result.type) {
      case 'artist':
        // genre
        object.genre = result.genre
        // location
        object.location = removeMultipleSpace(result.subhead).trim()
        break
      case 'album':
        // album's specific properties
        object = assignProps(result, object, ['releaseDate', 'numTracks', 'numMinutes'])
        // artist
        object.artist = result.subhead.replace('by ', '').trim()
        break
      case 'track':
        // released date
        object.releaseDate = result.releaseDate
        //  album & artist
        if (result.subhead) {
          const info = result.subhead.trim().split(' by ')
          if (info.length > 0) {
            object.album = removeNewLine(info[0]).replace('location', '').replace(/^from /, '')
            info.shift()
            object.artist = removeNewLine(info.join(' by '))
          }
        }
        break
      case 'fan':
        // genre
        object.genre = result.genre
        break
    }
    // validate through JSON schema
    if (ajv.validate('search-result', object)) {
      results.push(object)
    } else { // TODO add a flag to log only when debugging
      console.error('Validation error on search result: ', ajv.errorsText(), object, ajv.errors)
    }
    return results
  }, [])
}

export function extractAlbumUrlsFromDataBlob(html: string): any[] {
  const $ = cheerio.load(html)
  const data = scrapeIt.scrapeHTML($, {
    data: {
      selector: '#pagedata',
      attr: 'data-blob'
    }
  })

  const jsonRaw = JSON5.parse(data.data)
  const albums = []
  for (const collection of jsonRaw.hub.tabs[0].collections) {
    for (const item of collection.items) {
      const album = {
        name: item.title,
        artist: item.artist,
        url: item.tralbum_url,
        artist_url: item.band_url
      }
      albums.push(album)
    }
  }
  return albums
}

// parse tag results
export function parseTagResults(html: string): TagResult[] {
  const data = { results: extractAlbumUrlsFromDataBlob(html) }

  return data.results.reduce(function (results: TagResult[], result: any) {
    const object = assignProps(result, {}, ['name', 'artist', 'url', 'artist_url'])
    if (ajv.validate('tag-result', object)) {
      results.push(object)
    } else {
      console.error('Validation error on tag result: ', ajv.errorsText(), object, ajv.errors)
    }
    return results
  }, [])
}

// parse album urls
export function parseAlbumUrls(html: string, artistUrl: string): string[] {
  const $ = cheerio.load(html)
  const data = scrapeIt.scrapeHTML($, {
    albumLinks: {
      listItem: 'a',
      data: {
        url: {
          attr: 'href',
          convert: function (href: string) {
            if (/^\/(track|album)\/(.+)$/.exec(href)) {
              return new urlHelper.URL(href, artistUrl).toString()
            }
            return undefined
          }
        }
      }
    }
  })

  return data.albumLinks.reduce(function (urls: string[], link: any) {
    if (link.url) {
      urls.push(link.url)
    }
    return urls
  }, [])
}

// parse artist urls
export function parseArtistUrls(html: string, labelUrl: string): string[] {
  const $ = cheerio.load(html)
  const data = scrapeIt.scrapeHTML($, {
    artistLinks: {
      listItem: 'a',
      data: {
        url: {
          attr: 'href',
          convert: function (href: string) {
            if (/^\/artist\/(.+)$/.exec(href)) {
              return new urlHelper.URL(href, labelUrl).toString()
            }
            return undefined
          }
        }
      }
    }
  })

  return data.artistLinks.reduce(function (urls: string[], link: any) {
    if (link.url) {
      urls.push(link.url)
    }
    return urls
  }, [])
}

export function extractJavascriptObjectVariable(html: string, variableName: string): any {
  const regex = new RegExp(variableName + '\\s*=\\s*({.+?});', 's')
  const match = html.match(regex)
  return match ? JSON5.parse(match[1]) : null
}

export function parseAlbumInfo(html: string, albumUrl: string): AlbumInfo {
  const $ = cheerio.load(html)
  const data = scrapeIt.scrapeHTML($, {
    title: { selector: 'h2.trackTitle' },
    artist: { selector: 'h3.byArtist a' },
    imageUrl: { selector: '.popupImage img', attr: 'src' },
    genre: { selector: '.genre' },
    tags: {
      selector: '.tag',
      listItem: 'a',
      convert: function (text: string) {
        return text.trim()
      }
    },
    releaseDate: { selector: '.tralbumData .released' },
    numTracks: {
      selector: '.tralbumData .length',
      convert: function (text: string) {
        const match = text.match(/(\d+) tracks/)
        return match ? parseInt(match[1]) : undefined
      }
    },
    numMinutes: {
      selector: '.tralbumData .length',
      convert: function (text: string) {
        const match = text.match(/(\d+) minutes/)
        return match ? parseInt(match[1]) : undefined
      }
    },
    description: { selector: '.tralbumAbout' },
    tracks: {
      listItem: '.track_list .track_row_view',
      data: {
        title: { selector: '.title' },
        duration: { selector: '.time' },
        url: {
          selector: 'a',
          attr: 'href',
          convert: function (href: string) {
            return new urlHelper.URL(href, albumUrl).toString()
          }
        }
      }
    }
  })

  const albumInfo = {
    title: data.title,
    artist: data.artist,
    url: albumUrl,
    imageUrl: data.imageUrl,
    genre: data.genre,
    tags: data.tags || [],
    releaseDate: data.releaseDate,
    numTracks: data.numTracks,
    numMinutes: data.numMinutes,
    description: data.description,
    tracks: data.tracks || []
  }

  if (ajv.validate('album-info', albumInfo)) {
    return albumInfo
  } else {
    console.error('Validation error on album info: ', ajv.errorsText(), albumInfo, ajv.errors)
    return albumInfo
  }
}

export function parseTrackInfo(html: string, trackUrl: string): TrackInfo {
  const $ = cheerio.load(html)
  const data = scrapeIt.scrapeHTML($, {
    title: { selector: 'h2.trackTitle' },
    duration: { selector: '.time' }
  })

  const trackInfo = {
    title: data.title,
    duration: data.duration,
    url: trackUrl
  }

  if (ajv.validate('track-info', trackInfo)) {
    return trackInfo
  } else {
    console.error('Validation error on track info: ', ajv.errorsText(), trackInfo, ajv.errors)
    return trackInfo
  }
}

export function parseArtistInfo(html: string, artistUrl: string): ArtistInfo {
  const $ = cheerio.load(html)
  const data = scrapeIt.scrapeHTML($, {
    name: { selector: 'h2.artist' },
    imageUrl: { selector: '.popupImage img', attr: 'src' },
    genre: { selector: '.genre' },
    tags: {
      selector: '.tag',
      listItem: 'a',
      convert: function (text: string) {
        return text.trim()
      }
    },
    description: { selector: '.bioText' },
    location: { selector: '.location' },
    albums: {
      listItem: '.album',
      data: {
        title: { selector: '.title' },
        url: {
          selector: 'a',
          attr: 'href',
          convert: function (href: string) {
            return new urlHelper.URL(href, artistUrl).toString()
          }
        }
      }
    }
  })

  const artistInfo = {
    name: data.name,
    url: artistUrl,
    imageUrl: data.imageUrl,
    genre: data.genre,
    tags: data.tags || [],
    description: data.description,
    location: data.location,
    albums: data.albums || []
  }

  return artistInfo
}

export function parseAlbumProducts(html: string, albumUrl: string): AlbumProduct[] {
  const $ = cheerio.load(html)
  const data = scrapeIt.scrapeHTML($, {
    products: {
      listItem: '.buyItem',
      data: {
        title: { selector: '.title' },
        price: { selector: '.price' },
        type: { selector: '.type' },
        url: {
          selector: 'a',
          attr: 'href',
          convert: function (href: string) {
            return new urlHelper.URL(href, albumUrl).toString()
          }
        }
      }
    }
  })

  return data.products.reduce(function (products: AlbumProduct[], product: any) {
    const albumProduct = {
      title: product.title,
      price: product.price,
      type: product.type,
      url: product.url
    }

    if (ajv.validate('album-product', albumProduct)) {
      products.push(albumProduct)
    } else {
      console.error('Validation error on album product: ', ajv.errorsText(), albumProduct, ajv.errors)
    }
    return products
  }, [])
} 