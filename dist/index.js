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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = search;
exports.getAlbumsWithTag = getAlbumsWithTag;
exports.getAlbumUrls = getAlbumUrls;
exports.getAlbumInfo = getAlbumInfo;
exports.getAlbumProducts = getAlbumProducts;
exports.getArtistUrls = getArtistUrls;
exports.getArtistInfo = getArtistInfo;
exports.getTrackInfo = getTrackInfo;
exports.hasMerch = hasMerch;
exports.getMerch = getMerch;
const tinyreq_1 = __importDefault(require("tinyreq"));
const urlHelper = __importStar(require("url"));
const htmlParser = __importStar(require("./htmlParser"));
const utils = __importStar(require("./utils"));
function search(params, cb) {
    const url = utils.generateSearchUrl(params);
    (0, tinyreq_1.default)(url, function (error, html) {
        if (error) {
            cb(error, null);
        }
        else {
            const searchResults = htmlParser.parseSearchResults(html);
            cb(null, searchResults);
        }
    });
}
function getAlbumsWithTag(params, cb) {
    const url = utils.generateTagUrl(params);
    (0, tinyreq_1.default)(url, function (error, html) {
        if (error) {
            cb(error, null);
        }
        else {
            const tagResults = htmlParser.parseTagResults(html);
            cb(null, tagResults);
        }
    });
}
function getAlbumUrls(artistUrl, cb) {
    const musicUrl = new urlHelper.URL('/music', artistUrl).toString();
    (0, tinyreq_1.default)(musicUrl, function (error, html) {
        if (error) {
            cb(error, null);
        }
        else {
            const albumUrls = htmlParser.parseAlbumUrls(html, artistUrl);
            cb(null, albumUrls);
        }
    });
}
function getAlbumInfo(albumUrl, cb) {
    (0, tinyreq_1.default)(albumUrl, function (error, html) {
        if (error) {
            cb(error, null);
        }
        else {
            const albumInfo = htmlParser.parseAlbumInfo(html, albumUrl);
            cb(null, albumInfo);
        }
    });
}
function getAlbumProducts(albumUrl, cb) {
    (0, tinyreq_1.default)(albumUrl, function (error, html) {
        if (error) {
            cb(error, null);
        }
        else {
            const products = htmlParser.parseAlbumProducts(html, albumUrl);
            cb(null, products);
        }
    });
}
function getArtistUrls(labelUrl, cb) {
    const artistsUrl = new urlHelper.URL('/artists', labelUrl).toString();
    (0, tinyreq_1.default)(artistsUrl, function (error, html) {
        if (error) {
            cb(error, null);
        }
        else {
            const artistUrls = htmlParser.parseArtistUrls(html, labelUrl);
            cb(null, artistUrls);
        }
    });
}
function getArtistInfo(artistUrl, cb) {
    (0, tinyreq_1.default)(artistUrl, function (error, html) {
        if (error) {
            cb(error, null);
        }
        else {
            const artistInfo = htmlParser.parseArtistInfo(html, artistUrl);
            cb(null, artistInfo);
        }
    });
}
function getTrackInfo(trackUrl, cb) {
    (0, tinyreq_1.default)(trackUrl, function (error, html) {
        if (error) {
            cb(error, null);
        }
        else {
            const trackInfo = htmlParser.parseTrackInfo(html, trackUrl);
            cb(null, trackInfo);
        }
    });
}
function hasMerch(artistUrl, cb) {
    const merchUrl = new urlHelper.URL('/merch', artistUrl).toString();
    (0, tinyreq_1.default)(merchUrl, function (error, html) {
        if (error) {
            cb(error, null);
        }
        else {
            const hasMerchItems = htmlParser.hasMerch(html);
            cb(null, hasMerchItems);
        }
    });
}
function getMerch(artistUrl, cb) {
    const merchUrl = new urlHelper.URL('/merch', artistUrl).toString();
    (0, tinyreq_1.default)(merchUrl, function (error, html) {
        if (error) {
            cb(error, null);
        }
        else {
            const merchItems = htmlParser.parseMerch(html, merchUrl);
            cb(null, merchItems);
        }
    });
}
// Export types for consumers
__exportStar(require("./types"), exports);
//# sourceMappingURL=index.js.map