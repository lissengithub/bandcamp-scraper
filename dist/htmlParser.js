"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSearchResults = parseSearchResults;
exports.extractAlbumUrlsFromDataBlob = extractAlbumUrlsFromDataBlob;
exports.parseTagResults = parseTagResults;
exports.parseAlbumUrlsWithOrigin = parseAlbumUrlsWithOrigin;
exports.parseAlbumUrls = parseAlbumUrls;
exports.parseArtistUrls = parseArtistUrls;
exports.extractJavascriptObjectVariable = extractJavascriptObjectVariable;
exports.parseAlbumInfo = parseAlbumInfo;
exports.hasMerch = hasMerch;
exports.parseMerchInfo = parseMerchInfo;
const cheerio = __importStar(require("cheerio"));
const scrape_it_1 = __importDefault(require("scrape-it"));
const urlHelper = __importStar(require("url"));
const linez_1 = __importDefault(require("linez"));
const ajv_1 = __importDefault(require("ajv"));
const json5_1 = __importDefault(require("json5"));
const merchTypeIds_json_1 = __importDefault(require("./merchTypeIds.json"));
// add search-result Schema
const ajv = new ajv_1.default();
ajv.addSchema(require('../schemas/search-result.json'), 'search-result');
ajv.addSchema(require('../schemas/album-product.json'), 'album-product');
ajv.addSchema(require('../schemas/album-info.json'), 'album-info');
ajv.addSchema(require('../schemas/tag-result.json'), 'tag-result');
ajv.addSchema(require('../schemas/merch-item.json'), 'merch-item');
linez_1.default.configure({
    newlines: ['\n', '\r\n', '\r'],
});
function removeMultipleSpace(text) {
    return text.replace(/\s{2,}/g, ' ');
}
function removeNewLine(text) {
    text = (0, linez_1.default)(text)
        .lines.map(function (line) {
        return line.text.trim();
    })
        .join(' ');
    return removeMultipleSpace(text);
}
function assignProps(objFrom, objTo, propNames) {
    propNames.forEach(function (propName) {
        objTo[propName] = objFrom[propName];
    });
    return objTo;
}
// parse search results
function parseSearchResults(html) {
    const $ = cheerio.load(html);
    const data = scrape_it_1.default.scrapeHTML($, {
        results: {
            listItem: '.result-items li',
            data: {
                type: {
                    selector: '.itemtype',
                    convert: function (text) {
                        return text.toLowerCase();
                    },
                },
                name: { selector: '.heading' },
                url: { selector: '.itemurl' },
                imageUrl: { selector: '.art img', attr: 'src' },
                tags: {
                    selector: '.tags',
                    convert: function (text) {
                        const tags = text.replace('tags:', '').replace(/\s/g, '');
                        return tags.length > 1 ? tags.split(',') : [];
                    },
                },
                genre: {
                    selector: '.genre',
                    convert: function (text) {
                        return removeMultipleSpace(text.replace('genre:', ''));
                    },
                },
                subhead: {
                    selector: '.subhead',
                    convert: function (text) {
                        return removeMultipleSpace(text);
                    },
                },
                releaseDate: {
                    selector: '.released',
                    convert: function (text) {
                        return text.replace('released ', '');
                    },
                },
                numTracks: {
                    selector: '.length',
                    convert(text) {
                        const info = text.split(',');
                        if (info.length === 2) {
                            return parseInt(info[0].replace(' tracks', ''));
                        }
                        return null;
                    },
                },
                numMinutes: {
                    selector: '.length',
                    convert(text) {
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
    return data.results.reduce(function (results, result) {
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
        }
        else {
            // TODO add a flag to log only when debugging
            console.error('Validation error on search result: ', ajv.errorsText(), object, ajv.errors);
        }
        return results;
    }, []);
}
function extractAlbumUrlsFromDataBlob(html) {
    const $ = cheerio.load(html);
    const data = scrape_it_1.default.scrapeHTML($, {
        data: {
            selector: '#pagedata',
            attr: 'data-blob',
        },
    });
    const jsonRaw = json5_1.default.parse(data.data);
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
function parseTagResults(html) {
    const data = { results: extractAlbumUrlsFromDataBlob(html) };
    return data.results.reduce(function (results, result) {
        const object = assignProps(result, {}, [
            'name',
            'artist',
            'url',
            'artist_url',
        ]);
        if (ajv.validate('tag-result', object)) {
            results.push(object);
        }
        else {
            console.error('Validation error on tag result: ', ajv.errorsText(), object, ajv.errors);
        }
        return results;
    }, []);
}
function parseAlbumUrlsWithOrigin(html, artistUrl) {
    const $ = cheerio.load(html);
    const data = scrape_it_1.default.scrapeHTML($, {
        raw: {
            selector: '#music-grid',
            attr: 'data-client-items',
            convert(text) {
                if (!text) {
                    return [];
                }
                return json5_1.default.parse(text).map((item) => {
                    return new urlHelper.URL(item.page_url, artistUrl).toString();
                });
            },
        },
        albumLinks: {
            listItem: 'a',
            data: {
                url: {
                    attr: 'href',
                    convert(href) {
                        if (/^\/(track|album)\/(.+)$/.exec(href) && !href.includes('?')) {
                            return new urlHelper.URL(href, artistUrl).toString();
                        }
                        return undefined;
                    },
                },
            },
        },
        origin: {
            selector: 'meta[property="og:url"]',
            attr: 'content'
        }
    });
    const urls = data.albumLinks.map(x => x.url).concat(data.raw).reduce((albumUrls, link) => {
        if (link && albumUrls.indexOf(link) === -1) {
            albumUrls.push(link);
        }
        return albumUrls;
    }, []);
    return {
        urls,
        origin: data.origin
    };
}
// parse album urls
function parseAlbumUrls(html, artistUrl) {
    const $ = cheerio.load(html);
    const data = scrape_it_1.default.scrapeHTML($, {
        raw: {
            selector: '#music-grid',
            attr: 'data-client-items',
            convert(text) {
                if (!text) {
                    return [];
                }
                return json5_1.default.parse(text).map((item) => {
                    return new urlHelper.URL(item.page_url, artistUrl).toString();
                });
            },
        },
        albumLinks: {
            listItem: 'a',
            data: {
                url: {
                    attr: 'href',
                    convert(href) {
                        if (/^\/(track|album)\/(.+)$/.exec(href) && !href.includes('?')) {
                            return new urlHelper.URL(href, artistUrl).toString();
                        }
                        return undefined;
                    },
                },
            },
        },
    });
    return data.albumLinks.map(x => x.url).concat(data.raw).reduce((albumUrls, link) => {
        if (link && albumUrls.indexOf(link) === -1) {
            albumUrls.push(link);
        }
        return albumUrls;
    }, []);
}
// parse artist urls
function parseArtistUrls(html, labelUrl) {
    const $ = cheerio.load(html);
    const data = scrape_it_1.default.scrapeHTML($, {
        artistLinks: {
            listItem: 'a',
            data: {
                url: {
                    attr: 'href',
                    convert(href) {
                        if (/tab=artists*$/.exec(href)) {
                            return new urlHelper.URL(href, labelUrl).toString();
                        }
                        return undefined;
                    },
                },
            },
        },
    });
    return data.artistLinks.reduce(function (artistUrls, artistLink) {
        const url = artistLink.url;
        if (url && artistUrls.indexOf(url) === -1) {
            artistUrls.push(url);
        }
        return artistUrls;
    }, []);
}
function extractJavascriptObjectVariable(html, variableName) {
    const regex = new RegExp('var ' + variableName + '\\s*=\\s*(\\{[\\s\\S]*?\\})\\s*;');
    const matches = html.match(regex);
    if (matches && matches.length === 2) {
        return matches[1];
    }
    return undefined;
}
function parseAlbumInfo(html, albumUrl) {
    const $ = cheerio.load(html);
    const data = scrape_it_1.default.scrapeHTML($, {
        album: {
            selector: 'body',
            data: {
                artist: { selector: '#name-section span' },
                title: { selector: '#name-section .trackTitle' },
                imageUrl: {
                    selector: '#tralbumArt img',
                    attr: 'src',
                    convert(src) {
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
                            convert(href) {
                                if (!href)
                                    return null;
                                return new urlHelper.URL(href, albumUrl).toString();
                            },
                        },
                        duration: {
                            selector: '.time',
                            convert(duration) {
                                if (!duration)
                                    return null;
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
    object.tracks = object.tracks.filter((x) => x.name !== '');
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
    }
    else {
        let raw = extractJavascriptObjectVariable(html, 'TralbumData');
        // The only javascript in the variable is the concatenation of the base url
        // with the current album path. We nned to do it yourself.
        // Ex:
        //  url: "http://musique.coeurdepirate.com" + "/album/blonde",
        raw = raw ? raw.replace('" + "', '') : '';
        try {
            object.raw = json5_1.default.parse(raw);
        }
        catch (error) {
            console.error(error);
        }
    }
    object.url = albumUrl;
    // validate through JSON schema
    if (ajv.validate('album-info', object)) {
        return object;
    }
    else {
        // TODO add a flag to log only when debugging
        console.error('Validation error on album info: ', ajv.errorsText(), object);
        return null;
    }
}
// Check if merch is available
function hasMerch(html) {
    const $ = cheerio.load(html);
    // look for a merch anchor tag <a href="/merch">merch</a>
    const merchAnchor = $('a[href*="/merch"]').length;
    return merchAnchor > 0;
}
// Parse merch items
function parseMerchInfo(html, artistUrl) {
    const $ = cheerio.load(html);
    const data = scrape_it_1.default.scrapeHTML($, {
        merchItems: {
            listItem: '.merch-grid-item',
            data: {
                id: {
                    attr: 'data-item-id',
                },
                title: {
                    selector: 'p.title',
                    convert: function (text) {
                        return removeNewLine(text);
                    },
                },
                price: {
                    selector: 'span.price, .sold-out',
                    convert: function (price) {
                        if (price === 'Sold Out') {
                            return 'Sold Out';
                        }
                        // removing any non-numeric characters
                        return price.replace(/[^0-9.]/g, '');
                    },
                },
                currency: {
                    selector: 'span.currency',
                },
                url: {
                    selector: 'a',
                    attr: 'href',
                    convert(href) {
                        if (!href)
                            return null;
                        return new urlHelper.URL(href, artistUrl).toString();
                    },
                },
                merchType: {
                    selector: 'div.merchtype',
                    convert(text) {
                        return text.trim() || 'unknown';
                    },
                },
                imageUrl: {
                    selector: 'img',
                    attr: 'src',
                    convert(src) {
                        if (!src.includes('https')) {
                            return '';
                        }
                        return src;
                    }
                },
                backupImageUrl: {
                    selector: 'img',
                    attr: 'data-original',
                },
            },
        },
        raw: {
            selector: '#merch-grid',
            attr: 'data-client-items',
            convert(text) {
                if (!text) {
                    return [];
                }
                try {
                    const json = json5_1.default.parse(text);
                    return json.map((item) => {
                        return {
                            id: String(item.id),
                            title: item.title,
                            price: item.sold_out ? 'Sold Out' : String(item.price),
                            currency: item.currency,
                            url: new urlHelper.URL(item.url, artistUrl).toString(),
                            type: merchTypeIds_json_1.default.find((type) => type.type_id === item.type_id)?.name || 'Unknown',
                            imageUrl: `https://f4.bcbits.com/img/${item.img_id}_37.jpg`,
                        };
                    });
                }
                catch (error) {
                    return [];
                }
            },
        },
        baseCurrency: {
            // select the first tag with attribute data-band-currency
            selector: 'script[data-band-currency]',
            attr: 'data-band-currency',
            convert(text) {
                return text.trim() || 'USD';
            }
        }
    });
    // Convert the scraped data to MerchItem objects with only price information
    const merchItems = data.merchItems
        .filter((item) => item.price) // Only include items with prices
        .map((item) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        currency: item.currency || data.baseCurrency,
        url: item.url,
        type: item.merchType,
        imageUrl: item.imageUrl || item.backupImageUrl,
    }));
    // Validate each item through JSON schema
    const items = merchItems.concat(data.raw).filter((item) => {
        if (ajv.validate('merch-item', item)) {
            return true;
        }
        else {
            console.error('Validation error on merch item: ', ajv.errorsText(), item);
            return false;
        }
    });
    return items;
}
//# sourceMappingURL=htmlParser.js.map