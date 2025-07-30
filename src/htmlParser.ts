import cheerio from 'cheerio';
import * as scrapeIt from 'scrape-it';
import * as urlHelper from 'url';
import linez from 'linez';
import Ajv from 'ajv';
import JSON5 from 'json5';
import { TrackInfo, AlbumProduct, MerchItem, ArtistInfo } from './types';

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
};

function removeNewLine(text: string): string {
  text = linez(text)
    .lines.map(function (line: any) {
      return line.text.trim();
    })
    .join(' ');
  return removeMultipleSpace(text);
};

function assignProps(
  objFrom: any,
  objTo: any,
  propNames: string[]
): any {
  propNames.forEach(function (propName) {
    objTo[propName] = objFrom[propName];
  });
  return objTo;
};

// parse search results
export function parseSearchResults(html: string) {
  const $ = cheerio.load(html);
  const data = scrapeIt.scrapeHTML($, {
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
  const data = scrapeIt.scrapeHTML($, {
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
  const data = scrapeIt.scrapeHTML($, {
    albumLinks: {
      listItem: 'a',
      data: {
        url: {
          attr: 'href',
          convert(href: string) {
            if (/^\/(track|album)\/(.+)$/.exec(href)) {
              return new urlHelper.URL(href, artistUrl).toString();
            }
            return undefined;
          },
        },
      },
    },
  });
  return data.albumLinks.reduce(function (albumUrls: string[], albumLink: any) {
    const url = albumLink.url;
    if (url) {
      if (albumUrls.indexOf(url) === -1) {
        albumUrls.push(url);
      }
    }
    return albumUrls;
  }, []);
}

// parse artist urls
export function parseArtistUrls(html: string, labelUrl: string) {
  const $ = cheerio.load(html);
  const data = scrapeIt.scrapeHTML($, {
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

  return data.artistLinks.reduce(function (artistUrls: any, artistLink: any) {
    const url = artistLink.url;
    if (url) {
      if (artistUrls.indexOf(url) === -1) {
        artistUrls.push(url);
      }
    }
    return artistUrls;
  }, []);
};

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
  const data = scrapeIt.scrapeHTML($, {
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

export function parseTrackInfo(html: string, trackUrl: string): TrackInfo {
  const $ = cheerio.load(html);
  const data = scrapeIt.scrapeHTML($, {
    name: { selector: 'h2.trackTitle' },
    duration: { selector: '.time' },
  });

  const trackInfo = {
    name: data.name,
    duration: data.duration,
    url: trackUrl,
  };

  if (ajv.validate('track-info', trackInfo)) {
    return trackInfo;
  } else {
    console.error(
      'Validation error on track info: ',
      ajv.errorsText(),
      trackInfo,
      ajv.errors
    );
    return trackInfo;
  }
}

export function parseAlbumProducts(
  html: string,
  albumUrl: string
): AlbumProduct[] {
  const $ = cheerio.load(html);
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
            return new urlHelper.URL(href, albumUrl).toString();
          },
        },
      },
    },
  });

  return data.products.reduce(function (
    products: AlbumProduct[],
    product: any
  ) {
    const albumProduct = {
      title: product.title,
      price: product.price,
      type: product.type,
      url: product.url,
    };

    if (ajv.validate('album-product', albumProduct)) {
      products.push(albumProduct);
    } else {
      console.error(
        'Validation error on album product: ',
        ajv.errorsText(),
        albumProduct,
        ajv.errors
      );
    }
    return products;
  },
  []);
}

// Check if merch is available
export function hasMerch(html: string): boolean {
  const $ = cheerio.load(html);
  // Look for merch items or merch-related content
  const merchItems = $(
    '.merch-item, .buyItem, [data-item-type="merch"], .merchandise-item'
  ).length;
  const merchSection = $('.merch, .merchandise, [data-section="merch"]').length;
  const merchText = $('body').text().toLowerCase().includes('merch');
  return merchItems > 0 || merchSection > 0 || merchText;
}

// Parse merch items
export function parseMerch(html: string, merchUrl: string): MerchItem[] {
  const $ = cheerio.load(html);

  const merchItems: MerchItem[] = [];

  // Look for merch items by finding price elements and working backwards
  $('*').each(function (this: any) {
    const $element = $(this);
    const text = $element.text().trim();

    // Look for price patterns (including "Sold Out")
    if (text.match(/^(£|€|\$)\s*\d+/) || text.toLowerCase() === 'sold out') {
      const $parent = $element.parent();
      const $container = $parent.closest('div, li, article');

      if ($container.length > 0) {
        // Find the title by looking for nearby text elements
        let title = '';
        let type = 'Merchandise';
        let status =
          text.toLowerCase() === 'sold out' ? 'Sold Out' : 'Available';

        // Look for title in nearby elements
        const $titleElement = $container
          .find('h1, h2, h3, h4, .title, strong, b')
          .first();
        if ($titleElement.length > 0) {
          title = $titleElement.text().trim();
        } else {
          // Try to find title in the container's direct text content
          const containerText = $container.text().trim();
          const lines = containerText
            .split('\n')
            .map((line: string) => line.trim())
            .filter((line: string) => line.length > 0);
          if (lines.length > 0) {
            title = lines[0];
          }
        }

        // Look for type/category
        const $typeElement = $container.find('.type, .category, small').first();
        if ($typeElement.length > 0) {
          type = $typeElement.text().trim();
        }

        // Check for sold out status in the entire container
        const containerText = $container.text().toLowerCase();
        if (containerText.includes('sold out')) {
          status = 'Sold Out';
        }

        // Only add if we have a reasonable title and it's not already added
        if (
          title &&
          title.length > 3 &&
          title.length < 200 &&
          !title.includes('<!DOCTYPE') &&
          !title.includes('<html') &&
          !merchItems.some((item) => item.title === title)
        ) {
          const imageUrl = $container.find('img').first().attr('src');
          const url = $container.find('a').first().attr('href');

          const merchItem = {
            title: title,
            type: type,
            price: text.toLowerCase() === 'sold out' ? '' : text,
            status: status,
            imageUrl: imageUrl,
            url: url ? new urlHelper.URL(url, merchUrl).toString() : merchUrl,
          };

          // Validate against JSON schema
          if (ajv.validate('merch-item', merchItem)) {
            merchItems.push(merchItem);
          } else {
            console.error(
              'Validation error on merch item: ',
              ajv.errorsText(),
              merchItem,
              ajv.errors
            );
          }
        }
      }
    }
  });

  // Also look for items that might not have prices but are clearly merch
  $('*').each(function (this: any) {
    const $element = $(this);
    const text = $element.text().trim();

    // Look for T-shirt, Apparel, or other merch keywords
    if (
      text.toLowerCase().includes('t-shirt') ||
      text.toLowerCase().includes('apparel') ||
      text.toLowerCase().includes('merch') ||
      text.toLowerCase().includes('clothing')
    ) {
      const $parent = $element.parent();
      const $container = $parent.closest('div, li, article');

      if ($container.length > 0) {
        let title = '';
        let type = 'Merchandise';
        let status = 'Available';

        // Look for title
        const $titleElement = $container
          .find('h1, h2, h3, h4, .title, strong, b')
          .first();
        if ($titleElement.length > 0) {
          title = $titleElement.text().trim();
        }

        // Check if this item is already in our list
        if (title && !merchItems.some((item) => item.title === title)) {
          const containerText = $container.text().toLowerCase();
          if (containerText.includes('sold out')) {
            status = 'Sold Out';
          }

          const imageUrl = $container.find('img').first().attr('src');
          const url = $container.find('a').first().attr('href');

          const merchItem = {
            title: title,
            type: type,
            price: '',
            status: status,
            imageUrl: imageUrl,
            url: url ? new urlHelper.URL(url, merchUrl).toString() : merchUrl,
          };

          // Validate against JSON schema
          if (ajv.validate('merch-item', merchItem)) {
            merchItems.push(merchItem);
          } else {
            console.error(
              'Validation error on merch item: ',
              ajv.errorsText(),
              merchItem,
              ajv.errors
            );
          }
        }
      }
    }
  });

  // Remove duplicates and filter out invalid items
  const uniqueItems = merchItems.filter(
    (item, index, self) =>
      index === self.findIndex((t) => t.title === item.title) &&
      item.title.length > 3 &&
      !item.title.includes('<!DOCTYPE') &&
      !item.title.includes('<html') &&
      !item.title.includes('{') &&
      !item.title.includes('}')
  );

  return uniqueItems;
}
