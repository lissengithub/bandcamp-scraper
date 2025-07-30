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
exports.parseArtistInfo = parseArtistInfo;
exports.parseAlbumProducts = parseAlbumProducts;
const cheerio_1 = __importDefault(require("cheerio"));
const scrapeIt = __importStar(require("scrape-it"));
const urlHelper = __importStar(require("url"));
const linez_1 = __importDefault(require("linez"));
const ajv_1 = __importDefault(require("ajv"));
const JSON5 = __importStar(require("json5"));
// add search-result Schema
const ajv = new ajv_1.default();
ajv.addSchema(require('../schemas/search-result.json'), 'search-result');
ajv.addSchema(require('../schemas/album-product.json'), 'album-product');
ajv.addSchema(require('../schemas/album-info.json'), 'album-info');
ajv.addSchema(require('../schemas/tag-result.json'), 'tag-result');
ajv.addSchema(require('../schemas/track-info.json'), 'track-info');
linez_1.default.configure({
    newlines: ['\n', '\r\n', '\r']
});
const removeMultipleSpace = function (text) {
    return text.replace(/\s{2,}/g, ' ');
};
const removeNewLine = function (text) {
    const lines = (0, linez_1.default)(text).lines.map(function (line) {
        return line.text.trim();
    }).join(' ');
    return removeMultipleSpace(lines);
};
const assignProps = function (objFrom, objTo, propNames) {
    propNames.forEach(function (propName) {
        objTo[propName] = objFrom[propName];
    });
    return objTo;
};
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
                    }
                },
                name: { selector: '.heading' },
                url: { selector: '.itemurl' },
                imageUrl: { selector: '.art img', attr: 'src' },
                tags: {
                    selector: '.tags',
                    convert: function (text) {
                        const tags = text.replace('tags:', '').replace(/\s/g, '');
                        return tags.length > 1 ? tags.split(',') : [];
                    }
                },
                genre: {
                    selector: '.genre',
                    convert: function (text) {
                        return removeMultipleSpace(text.replace('genre:', ''));
                    }
                },
                subhead: {
                    selector: '.subhead',
                    convert: function (text) {
                        return removeMultipleSpace(text);
                    }
                },
                releaseDate: {
                    selector: '.released',
                    convert: function (text) {
                        return text.replace('released ', '');
                    }
                },
                numTracks: {
                    selector: '.length',
                    convert: function (text) {
                        const info = text.split(',');
                        if (info.length === 2) {
                            return parseInt(info[0].replace(' tracks', ''));
                        }
                        return undefined;
                    }
                },
                numMinutes: {
                    selector: '.length',
                    convert: function (text) {
                        const info = text.split(',');
                        if (info.length === 2) {
                            return parseInt(info[1].replace(' minutes', ''));
                        }
                        return undefined;
                    }
                }
            }
        }
    });
    return data.results.reduce(function (results, result) {
        // basic properties
        let object = assignProps(result, {}, ['type', 'name', 'url', 'imageUrl', 'tags']);
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
                object = assignProps(result, object, ['releaseDate', 'numTracks', 'numMinutes']);
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
                        object.album = removeNewLine(info[0]).replace('location', '').replace(/^from /, '');
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
        else { // TODO add a flag to log only when debugging
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
            attr: 'data-blob'
        }
    });
    const jsonRaw = JSON5.parse(data.data);
    const albums = [];
    for (const collection of jsonRaw.hub.tabs[0].collections) {
        for (const item of collection.items) {
            const album = {
                name: item.title,
                artist: item.artist,
                url: item.tralbum_url,
                artist_url: item.band_url
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
        const object = assignProps(result, {}, ['name', 'artist', 'url', 'artist_url']);
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
                    convert: function (href) {
                        if (/^\/(track|album)\/(.+)$/.exec(href)) {
                            return new urlHelper.URL(href, artistUrl).toString();
                        }
                        return undefined;
                    }
                }
            }
        }
    });
    return data.albumLinks.reduce(function (urls, link) {
        if (link.url) {
            urls.push(link.url);
        }
        return urls;
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
                    convert: function (href) {
                        if (/^\/artist\/(.+)$/.exec(href)) {
                            return new urlHelper.URL(href, labelUrl).toString();
                        }
                        return undefined;
                    }
                }
            }
        }
    });
    return data.artistLinks.reduce(function (urls, link) {
        if (link.url) {
            urls.push(link.url);
        }
        return urls;
    }, []);
}
function extractJavascriptObjectVariable(html, variableName) {
    const regex = new RegExp(variableName + '\\s*=\\s*({.+?});', 's');
    const match = html.match(regex);
    return match ? JSON5.parse(match[1]) : null;
}
function parseAlbumInfo(html, albumUrl) {
    const $ = cheerio_1.default.load(html);
    const data = scrapeIt.scrapeHTML($, {
        title: { selector: 'h2.trackTitle' },
        artist: { selector: 'h3.byArtist a' },
        imageUrl: { selector: '.popupImage img', attr: 'src' },
        genre: { selector: '.genre' },
        tags: {
            selector: '.tag',
            listItem: 'a',
            convert: function (text) {
                return text.trim();
            }
        },
        releaseDate: { selector: '.tralbumData .released' },
        numTracks: {
            selector: '.tralbumData .length',
            convert: function (text) {
                const match = text.match(/(\d+) tracks/);
                return match ? parseInt(match[1]) : undefined;
            }
        },
        numMinutes: {
            selector: '.tralbumData .length',
            convert: function (text) {
                const match = text.match(/(\d+) minutes/);
                return match ? parseInt(match[1]) : undefined;
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
                    convert: function (href) {
                        return new urlHelper.URL(href, albumUrl).toString();
                    }
                }
            }
        }
    });
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
    };
    if (ajv.validate('album-info', albumInfo)) {
        return albumInfo;
    }
    else {
        console.error('Validation error on album info: ', ajv.errorsText(), albumInfo, ajv.errors);
        return albumInfo;
    }
}
function parseTrackInfo(html, trackUrl) {
    const $ = cheerio_1.default.load(html);
    const data = scrapeIt.scrapeHTML($, {
        title: { selector: 'h2.trackTitle' },
        duration: { selector: '.time' }
    });
    const trackInfo = {
        title: data.title,
        duration: data.duration,
        url: trackUrl
    };
    if (ajv.validate('track-info', trackInfo)) {
        return trackInfo;
    }
    else {
        console.error('Validation error on track info: ', ajv.errorsText(), trackInfo, ajv.errors);
        return trackInfo;
    }
}
function parseArtistInfo(html, artistUrl) {
    const $ = cheerio_1.default.load(html);
    const data = scrapeIt.scrapeHTML($, {
        name: { selector: 'h2.artist' },
        imageUrl: { selector: '.popupImage img', attr: 'src' },
        genre: { selector: '.genre' },
        tags: {
            selector: '.tag',
            listItem: 'a',
            convert: function (text) {
                return text.trim();
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
                    convert: function (href) {
                        return new urlHelper.URL(href, artistUrl).toString();
                    }
                }
            }
        }
    });
    const artistInfo = {
        name: data.name,
        url: artistUrl,
        imageUrl: data.imageUrl,
        genre: data.genre,
        tags: data.tags || [],
        description: data.description,
        location: data.location,
        albums: data.albums || []
    };
    return artistInfo;
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
                    }
                }
            }
        }
    });
    return data.products.reduce(function (products, product) {
        const albumProduct = {
            title: product.title,
            price: product.price,
            type: product.type,
            url: product.url
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
//# sourceMappingURL=htmlParser.js.map