"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSearchUrl = generateSearchUrl;
exports.generateTagUrl = generateTagUrl;
function createQueryString(params) {
    return Object.keys(params).map(function (name) {
        return name + '=' + encodeURIComponent(params[name]);
    }).join('&');
}
function generateSearchUrl(params) {
    if (!params || typeof params !== 'object') {
        throw new Error('Expect params to be an object.');
    }
    // required
    if (!Object.prototype.hasOwnProperty.call(params, 'query') || typeof params.query !== 'string') {
        throw new Error('Expect params to have string property named query.');
    }
    // optional
    if (Object.prototype.hasOwnProperty.call(params, 'page') && typeof params.page !== 'number') {
        throw new Error('Expect params named page to be type number.');
    }
    const searchParams = {
        q: params.query,
        page: params.page || 1
    };
    return 'https://bandcamp.com/search?' + createQueryString(searchParams);
}
function generateTagUrl(params) {
    if (!params || typeof params !== 'object') {
        throw new Error('Expect params to be an object.');
    }
    // required
    if (!Object.prototype.hasOwnProperty.call(params, 'tag') || typeof params.tag !== 'string') {
        throw new Error('Expect params to have string property named tag.');
    }
    // optional
    if (Object.prototype.hasOwnProperty.call(params, 'page') && typeof params.page !== 'number') {
        throw new Error('Expect params named page to be type number.');
    }
    const tag = params.tag;
    const tagParams = {
        page: params.page || 1
    };
    return 'https://bandcamp.com/tag/' + encodeURIComponent(tag) + '?' + createQueryString(tagParams);
}
//# sourceMappingURL=utils.js.map