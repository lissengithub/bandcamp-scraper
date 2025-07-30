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
exports.parseAlbumUrls = parseAlbumUrls;
exports.parseArtistUrls = parseArtistUrls;
exports.extractJavascriptObjectVariable = extractJavascriptObjectVariable;
exports.parseAlbumInfo = parseAlbumInfo;
exports.parseTrackInfo = parseTrackInfo;
exports.parseAlbumProducts = parseAlbumProducts;
exports.hasMerch = hasMerch;
exports.parseMerch = parseMerch;
const cheerio_1 = __importDefault(require("cheerio"));
const scrapeIt = __importStar(require("scrape-it"));
const urlHelper = __importStar(require("url"));
const linez_1 = __importDefault(require("linez"));
const ajv_1 = __importDefault(require("ajv"));
const json5_1 = __importDefault(require("json5"));
// add search-result Schema
const ajv = new ajv_1.default();
ajv.addSchema(require('../schemas/search-result.json'), 'search-result');
ajv.addSchema(require('../schemas/album-product.json'), 'album-product');
ajv.addSchema(require('../schemas/album-info.json'), 'album-info');
ajv.addSchema(require('../schemas/tag-result.json'), 'tag-result');
ajv.addSchema(require('../schemas/track-info.json'), 'track-info');
ajv.addSchema(require('../schemas/merch-item.json'), 'merch-item');
linez_1.default.configure({
    newlines: ['\n', '\r\n', '\r'],
});
function removeMultipleSpace(text) {
    return text.replace(/\s{2,}/g, ' ');
}
;
function removeNewLine(text) {
    text = (0, linez_1.default)(text)
        .lines.map(function (line) {
        return line.text.trim();
    })
        .join(' ');
    return removeMultipleSpace(text);
}
;
function assignProps(objFrom, objTo, propNames) {
    propNames.forEach(function (propName) {
        objTo[propName] = objFrom[propName];
    });
    return objTo;
}
;
// parse search results
function parseSearchResults(html) {
    const $ = cheerio_1.default.load(html);
    const data = scrapeIt.scrapeHTML($, {
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
    const $ = cheerio_1.default.load(html);
    const data = scrapeIt.scrapeHTML($, {
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
// parse album urls
function parseAlbumUrls(html, artistUrl) {
    const $ = cheerio_1.default.load(html);
    const data = scrapeIt.scrapeHTML($, {
        albumLinks: {
            listItem: 'a',
            data: {
                url: {
                    attr: 'href',
                    convert(href) {
                        if (/^\/(track|album)\/(.+)$/.exec(href)) {
                            return new urlHelper.URL(href, artistUrl).toString();
                        }
                        return undefined;
                    },
                },
            },
        },
    });
    return data.albumLinks.reduce(function (albumUrls, albumLink) {
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
function parseArtistUrls(html, labelUrl) {
    const $ = cheerio_1.default.load(html);
    const data = scrapeIt.scrapeHTML($, {
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
        if (url) {
            if (artistUrls.indexOf(url) === -1) {
                artistUrls.push(url);
            }
        }
        return artistUrls;
    }, []);
}
;
function extractJavascriptObjectVariable(html, variableName) {
    const regex = new RegExp('var ' + variableName + '\\s*=\\s*(\\{[\\s\\S]*?\\})\\s*;');
    const matches = html.match(regex);
    if (matches && matches.length === 2) {
        return matches[1];
    }
    return undefined;
}
function parseAlbumInfo(html, albumUrl) {
    const $ = cheerio_1.default.load(html);
    const data = scrapeIt.scrapeHTML($, {
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
function parseTrackInfo(html, trackUrl) {
    const $ = cheerio_1.default.load(html);
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
    }
    else {
        console.error('Validation error on track info: ', ajv.errorsText(), trackInfo, ajv.errors);
        return trackInfo;
    }
}
function parseAlbumProducts(html, albumUrl) {
    const $ = cheerio_1.default.load(html);
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
                    convert: function (href) {
                        return new urlHelper.URL(href, albumUrl).toString();
                    },
                },
            },
        },
    });
    return data.products.reduce(function (products, product) {
        const albumProduct = {
            title: product.title,
            price: product.price,
            type: product.type,
            url: product.url,
        };
        if (ajv.validate('album-product', albumProduct)) {
            products.push(albumProduct);
        }
        else {
            console.error('Validation error on album product: ', ajv.errorsText(), albumProduct, ajv.errors);
        }
        return products;
    }, []);
}
// Check if merch is available
function hasMerch(html) {
    const $ = cheerio_1.default.load(html);
    // Look for merch items or merch-related content
    const merchItems = $('.merch-item, .buyItem, [data-item-type="merch"], .merchandise-item').length;
    const merchSection = $('.merch, .merchandise, [data-section="merch"]').length;
    const merchText = $('body').text().toLowerCase().includes('merch');
    return merchItems > 0 || merchSection > 0 || merchText;
}
// Parse merch items
function parseMerch(html, merchUrl) {
    const $ = cheerio_1.default.load(html);
    const merchItems = [];
    // Look for merch items by finding price elements and working backwards
    $('*').each(function () {
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
                let status = text.toLowerCase() === 'sold out' ? 'Sold Out' : 'Available';
                // Look for title in nearby elements
                const $titleElement = $container
                    .find('h1, h2, h3, h4, .title, strong, b')
                    .first();
                if ($titleElement.length > 0) {
                    title = $titleElement.text().trim();
                }
                else {
                    // Try to find title in the container's direct text content
                    const containerText = $container.text().trim();
                    const lines = containerText
                        .split('\n')
                        .map((line) => line.trim())
                        .filter((line) => line.length > 0);
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
                if (title &&
                    title.length > 3 &&
                    title.length < 200 &&
                    !title.includes('<!DOCTYPE') &&
                    !title.includes('<html') &&
                    !merchItems.some((item) => item.title === title)) {
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
                    }
                    else {
                        console.error('Validation error on merch item: ', ajv.errorsText(), merchItem, ajv.errors);
                    }
                }
            }
        }
    });
    // Also look for items that might not have prices but are clearly merch
    $('*').each(function () {
        const $element = $(this);
        const text = $element.text().trim();
        // Look for T-shirt, Apparel, or other merch keywords
        if (text.toLowerCase().includes('t-shirt') ||
            text.toLowerCase().includes('apparel') ||
            text.toLowerCase().includes('merch') ||
            text.toLowerCase().includes('clothing')) {
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
                    }
                    else {
                        console.error('Validation error on merch item: ', ajv.errorsText(), merchItem, ajv.errors);
                    }
                }
            }
        }
    });
    // Remove duplicates and filter out invalid items
    const uniqueItems = merchItems.filter((item, index, self) => index === self.findIndex((t) => t.title === item.title) &&
        item.title.length > 3 &&
        !item.title.includes('<!DOCTYPE') &&
        !item.title.includes('<html') &&
        !item.title.includes('{') &&
        !item.title.includes('}'));
    return uniqueItems;
}
//# sourceMappingURL=htmlParser.js.map