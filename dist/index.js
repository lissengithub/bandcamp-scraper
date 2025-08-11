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
exports.getAlbumUrls = getAlbumUrls;
exports.promiseGetAlbumUrls = promiseGetAlbumUrls;
exports.getUrls = getUrls;
exports.getAlbumInfo = getAlbumInfo;
exports.promiseGetAlbumInfo = promiseGetAlbumInfo;
exports.getArtistUrls = getArtistUrls;
exports.hasMerch = hasMerch;
exports.getMerchInfo = getMerchInfo;
exports.promiseGetMerchInfo = promiseGetMerchInfo;
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
async function promiseGetAlbumUrls(artistUrl) {
    const musicUrl = new urlHelper.URL('/music', artistUrl).toString();
    try {
        const html = await (0, tinyreq_1.default)(musicUrl);
        if (!html) {
            return { error: new Error(`Failed to get album urls for ${artistUrl}`), data: null };
        }
        const albumUrls = htmlParser.parseAlbumUrls(html, artistUrl);
        return { error: null, data: albumUrls };
    }
    catch (error) {
        return { error: error, data: null };
    }
}
async function getUrls(artistUrl) {
    const musicUrl = new urlHelper.URL('/music', artistUrl).toString();
    try {
        const html = await (0, tinyreq_1.default)(musicUrl);
        if (!html) {
            return { error: new Error(`Failed to get album urls for ${artistUrl}`), data: null };
        }
        const albumUrls = htmlParser.parseAlbumUrlsWithOrigin(html, artistUrl);
        return { error: null, data: albumUrls };
    }
    catch (error) {
        return { error: error, data: null };
    }
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
/** Gets album or track info for a given album/track URL. */
async function promiseGetAlbumInfo(albumUrl) {
    try {
        const html = await (0, tinyreq_1.default)(albumUrl);
        if (!html) {
            return { error: new Error(`Failed to get album info for ${albumUrl}`), data: null };
        }
        const albumInfo = htmlParser.parseAlbumInfo(html, albumUrl);
        if (!albumInfo) {
            return { error: new Error(`Failed to parse album info for ${albumUrl}`), data: null };
        }
        return { error: null, data: albumInfo };
    }
    catch (error) {
        return { error: error, data: null };
    }
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
function getMerchInfo(artistUrl, cb) {
    const merchUrl = new urlHelper.URL('/merch', artistUrl).toString();
    (0, tinyreq_1.default)(merchUrl, function (error, html) {
        if (error) {
            cb(error, null);
        }
        else {
            const merchItems = htmlParser.parseMerchInfo(html, artistUrl);
            cb(null, merchItems);
        }
    });
}
async function promiseGetMerchInfo(artistUrl) {
    const merchUrl = new urlHelper.URL('/merch', artistUrl).toString();
    try {
        const html = await (0, tinyreq_1.default)(merchUrl);
        if (!html) {
            return { error: new Error(`Failed to get merch info for ${artistUrl}`), data: null };
        }
        const merchItems = htmlParser.parseMerchInfo(html, artistUrl);
        return { error: null, data: merchItems };
    }
    catch (error) {
        return { error: error, data: null };
    }
}
// Export types for consumers
__exportStar(require("./types"), exports);
//# sourceMappingURL=index.js.map