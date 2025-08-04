import * as cheerio from 'cheerio';
import scrapeIt from 'scrape-it';
import * as urlHelper from 'url';
import linez from 'linez';
import Ajv from 'ajv';
import JSON5 from 'json5';
import { TrackInfo, MerchItem } from './types';

// add search-result Schema
const ajv = new Ajv();
ajv.addSchema(require('../schemas/search-result.json'), 'search-result');
ajv.addSchema(require('../schemas/album-product.json'), 'album-product');
ajv.addSchema(require('../schemas/album-info.json'), 'album-info');
ajv.addSchema(require('../schemas/tag-result.json'), 'tag-result');
ajv.addSchema(require('../schemas/track-info.json'), 'track-info');
ajv.addSchema(require('../schemas/merch-item.json'), 'merch-item');

linez.configure({
  newlines: ['\n', '\r\n', '\r'],
});

function removeMultipleSpace(text: string): string {
  return text.replace(/\s{2,}/g, ' ');
}

function removeNewLine(text: string): string {
  text = linez(text)
    .lines.map(function (line: any) {
      return line.text.trim();
    })
    .join(' ');
  return removeMultipleSpace(text);
}

function assignProps(objFrom: any, objTo: any, propNames: string[]): any {
  propNames.forEach(function (propName) {
    objTo[propName] = objFrom[propName];
  });
  return objTo;
}

// parse search results
export function parseSearchResults(html: string) {
  const $ = cheerio.load(html);
  const data = scrapeIt.scrapeHTML<any>($, {
    results: {
      listItem: '.result-items li',
      data: {
        type: {
          selector: '.itemtype',
          convert: function (text: string) {
            return text.toLowerCase();
          },
        },
        name: { selector: '.heading' },
        url: { selector: '.itemurl' },
        imageUrl: { selector: '.art img', attr: 'src' },
        tags: {
          selector: '.tags',
          convert: function (text: string) {
            const tags = text.replace('tags:', '').replace(/\s/g, '');
            return tags.length > 1 ? tags.split(',') : [];
          },
        },
        genre: {
          selector: '.genre',
          convert: function (text: string) {
            return removeMultipleSpace(text.replace('genre:', ''));
          },
        },
        subhead: {
          selector: '.subhead',
          convert: function (text: string) {
            return removeMultipleSpace(text);
          },
        },
        releaseDate: {
          selector: '.released',
          convert: function (text: string) {
            return text.replace('released ', '');
          },
        },
        numTracks: {
          selector: '.length',
          convert(text: string) {
            const info = text.split(',');
            if (info.length === 2) {
              return parseInt(info[0].replace(' tracks', ''));
            }
            return null;
          },
        },
        numMinutes: {
          selector: '.length',
          convert(text: string) {
            const info = text.split(',');
            if (info.length === 2) {
              return parseInt(info[1].replace(' minutes', ''));
            }
            return null;
          },
        },
      },
    },
  });

  return data.results.reduce(function (results: any, result: any) {
    // basic properties
    let object = assignProps(result, {}, [
      'type',
      'name',
      'url',
      'imageUrl',
      'tags',
    ]);
    // specific properties
    switch (result.type) {
      case 'artist':
        // genre
        object.genre = result.genre;
        // location
        object.location = removeMultipleSpace(result.subhead).trim();
        break;
      case 'album':
        // album's specific properties
        object = assignProps(result, object, [
          'releaseDate',
          'numTracks',
          'numMinutes',
        ]);
        // artist
        object.artist = result.subhead.replace('by ', '').trim();
        break;
      case 'track':
        // released date
        object.releaseDate = result.releaseDate;
        //  album & artist
        if (result.subhead) {
          const info = result.subhead.trim().split(' by ');
          if (info.length > 0) {
            object.album = removeNewLine(info[0])
              .replace('location', '')
              .replace(/^from /, '');
            info.shift();
            object.artist = removeNewLine(info.join(' by '));
          }
        }
        break;
      case 'fan':
        // genre
        object.genre = result.genre;
        break;
    }
    // validate through JSON schema
    if (ajv.validate('search-result', object)) {
      results.push(object);
    } else {
      // TODO add a flag to log only when debugging
      console.error(
        'Validation error on search result: ',
        ajv.errorsText(),
        object,
        ajv.errors
      );
    }
    return results;
  }, []);
}

export function extractAlbumUrlsFromDataBlob(html: string) {
  const $ = cheerio.load(html);
  const data = scrapeIt.scrapeHTML<{ data: string }>($, {
    data: {
      selector: '#pagedata',
      attr: 'data-blob',
    },
  });

  const jsonRaw = JSON5.parse(data.data);
  const albums = [];
  for (const collection of jsonRaw.hub.tabs[0].collections) {
    for (const item of collection.items) {
      const album = {
        name: item.title,
        artist: item.artist,
        url: item.tralbum_url,
        artist_url: item.band_url,
      };
      albums.push(album);
    }
  }
  return albums;
}

// parse tag results
export function parseTagResults(html: string) {
  const data = { results: extractAlbumUrlsFromDataBlob(html) };

  return data.results.reduce(function (results: any, result: any) {
    const object = assignProps(result, {}, [
      'name',
      'artist',
      'url',
      'artist_url',
    ]);
    if (ajv.validate('tag-result', object)) {
      results.push(object);
    } else {
      console.error(
        'Validation error on tag result: ',
        ajv.errorsText(),
        object,
        ajv.errors
      );
    }
    return results;
  }, []);
}

// parse album urls
export function parseAlbumUrls(html: string, artistUrl: string) {
  const $ = cheerio.load(html);
  const data = scrapeIt.scrapeHTML<{ albumLinks: { url: string }[], raw: string[] }>($, {
    raw: {
      selector: '#music-grid',
      attr: 'data-client-items',
      convert(text: string) {
        if (!text) {
          return [];
        }
        return JSON5.parse(text).map((item: { page_url: string }) => {
          return new urlHelper.URL(item.page_url, artistUrl).toString();
        });
      },
    },
    albumLinks: {
      listItem: 'a',
      data: {
        url: {
          attr: 'href',
          convert(href: string) {
            if (/^\/(track|album)\/(.+)$/.exec(href) && !href.includes('?')) {
              return new urlHelper.URL(href, artistUrl).toString();
            }
            return undefined;
          },
        },
      },
    },
  });

  return data.albumLinks.map(x => x.url).concat(data.raw).reduce((albumUrls: string[], link) => {
    if (link && albumUrls.indexOf(link) === -1) {
      albumUrls.push(link);
    }
    return albumUrls;
  }, []);
}

// parse artist urls
export function parseArtistUrls(html: string, labelUrl: string) {
  const $ = cheerio.load(html);
  const data = scrapeIt.scrapeHTML<{ artistLinks: { url: string }[] }>($, {
    artistLinks: {
      listItem: 'a',
      data: {
        url: {
          attr: 'href',
          convert(href: string) {
            if (/tab=artists*$/.exec(href)) {
              return new urlHelper.URL(href, labelUrl).toString();
            }
            return undefined;
          },
        },
      },
    },
  });

  return data.artistLinks.reduce(function (artistUrls: string[], artistLink) {
    const url = artistLink.url;
    if (url && artistUrls.indexOf(url) === -1) {
      artistUrls.push(url);
    }
    return artistUrls;
  }, []);
}

export function extractJavascriptObjectVariable(
  html: string,
  variableName: string
) {
  const regex = new RegExp(
    'var ' + variableName + '\\s*=\\s*(\\{[\\s\\S]*?\\})\\s*;'
  );
  const matches = html.match(regex);
  if (matches && matches.length === 2) {
    return matches[1];
  }
  return undefined;
}

export function parseAlbumInfo(html: string, albumUrl: string) {
  const $ = cheerio.load(html);
  const data = scrapeIt.scrapeHTML<{
    album: {
      artist: string;
      title: string;
      imageUrl: string;
      tags: string[];
      tracks: { name: string; url?: string; duration?: string }[];
      nonPlayableTracks: { name: string }[];
    };
  }>($, {
    album: {
      selector: 'body',
      data: {
        artist: { selector: '#name-section span' },
        title: { selector: '#name-section .trackTitle' },
        imageUrl: {
          selector: '#tralbumArt img',
          attr: 'src',
          convert(src: string) {
            if (src) {
              return src.replace(/_\d{1,3}\./, '_2.'); // use small version
            }
            return undefined;
          },
        },
        tags: {
          listItem: '.tag',
        },
        tracks: {
          listItem: 'table#track_table tr.track_row_view',
          data: {
            name: {
              selector: 'span.track-title',
            },
            url: {
              selector: '.info_link a',
              attr: 'href',
              convert(href: string) {
                if (!href) return null;
                return new urlHelper.URL(href, albumUrl).toString();
              },
            },
            duration: {
              selector: '.time',
              convert(duration: any) {
                if (!duration) return null;
                return duration;
              },
            },
          },
        },
        nonPlayableTracks: {
          listItem: 'table#track_table tr.track_row_view',
          data: {
            name: {
              selector: '.title>span:not(.time)',
            },
          },
        },
      },
    },
  });

  for (const nonPlayableTrack of data.album.nonPlayableTracks) {
    data.album.tracks.push(nonPlayableTrack);
  }

  const object = assignProps(data.album, {}, [
    'tags',
    'artist',
    'title',
    'imageUrl',
    'tracks',
  ]);
  // Remove undefined/null properties.

  // remove non-playable tracks that would have been caught in "tracks" (in case of preview albums)
  object.tracks = object.tracks.filter((x: any) => x.name !== '');

  for (let i = 0; i < object.tracks.length; i++) {
    // Remove tracks properties.
    for (const key in object.tracks[i]) {
      if (Object.prototype.hasOwnProperty.call(object.tracks[i], key)) {
        if (!object.tracks[i][key]) {
          delete object.tracks[i][key];
        }
      }
    }
  }
  // Parse raw.
  const scriptWithRaw = $('script[data-tralbum]');
  if (scriptWithRaw.length > 0) {
    object.raw = scriptWithRaw.data('tralbum');
  } else {
    let raw = extractJavascriptObjectVariable(html, 'TralbumData');
    // The only javascript in the variable is the concatenation of the base url
    // with the current album path. We nned to do it yourself.
    // Ex:
    //  url: "http://musique.coeurdepirate.com" + "/album/blonde",
    raw = raw ? raw.replace('" + "', '') : '';
    try {
      object.raw = JSON5.parse(raw);
    } catch (error) {
      console.error(error);
    }
  }

  object.url = albumUrl;
  // validate through JSON schema
  if (ajv.validate('album-info', object)) {
    return object;
  } else {
    // TODO add a flag to log only when debugging
    console.error('Validation error on album info: ', ajv.errorsText(), object);
    return null;
  }
}

// Check if merch is available
export function hasMerch(html: string): boolean {
  const $ = cheerio.load(html);
  // look for a merch anchor tag <a href="/merch">merch</a>
  const merchAnchor = $('a[href*="/merch"]').length;
  return merchAnchor > 0;
}

// Parse merch items
export function parseMerchInfo(html: string, artistUrl: string) {
  const $ = cheerio.load(html);
  const data = scrapeIt.scrapeHTML<{
    merchItems: {
      id: string;
      title: string;
      price: string;
      url: string;
      merchType: string;
      imageUrl: string;
      backupImageUrl: string;
    }[];
  }>($, {
    merchItems: {
      listItem: '.merch-grid-item',
      data: {
        id: {
          attr: 'data-item-id',
        },
        title: {
          selector: 'p.title',
          convert: function (text: string) {
            return removeNewLine(text);
          },
        },
        price: {
          selector: 'span.price, .sold-out',
          convert: function (price: string) {
            return price ? price.trim() : undefined;
          },
        },
        url: {
          selector: 'a',
          attr: 'href',
          convert(href: string) {
            if (!href) return null;
            return new urlHelper.URL(href, artistUrl).toString();
          },
        },
        merchType: {
          selector: 'div.merchtype',
          convert(text: string) {
            return text.trim();
          },
        },
        imageUrl: {
          selector: 'img',
          attr: 'src',
          convert(src: string) {
            if (!src.includes('https')) {
              return ''
            }
            return src;
          }
        },
        backupImageUrl: {
          selector: 'img',
          attr: 'data-original',
        }
      },
    },
  });
  // Convert the scraped data to MerchItem objects with only price information
  const merchItems: MerchItem[] = data.merchItems
    .filter((item) => item.price) // Only include items with prices
    .map((item) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      url: item.url,
      type: item.merchType,
      imageUrl: item.imageUrl || item.backupImageUrl,
    }));

  // Validate each item through JSON schema
  const items = merchItems.filter((item: MerchItem) => {
    if (ajv.validate('merch-item', item)) {
      return true;
    } else {
      console.error('Validation error on merch item: ', ajv.errorsText(), item);
      return false;
    }
  });

  return items;
}
