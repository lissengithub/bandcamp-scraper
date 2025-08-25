import { SearchParams, SearchResult, AlbumInfo, Callback, Response, MerchItem, ProxyConfig } from './types';
export declare function search(params: SearchParams, cb: Callback<SearchResult[]>, proxyConfig?: ProxyConfig): void;
export declare function getAlbumUrls(artistUrl: string, cb: Callback<string[]>, proxyConfig?: ProxyConfig): void;
export declare function promiseGetAlbumUrls(artistUrl: string, proxyConfig?: ProxyConfig): Promise<Response<string[]>>;
export declare function getUrls(artistUrl: string, proxyConfig?: ProxyConfig): Promise<Response<{
    urls: string[];
    origin: string;
}>>;
export declare function getAlbumInfo(albumUrl: string, cb: Callback<AlbumInfo>, proxyConfig?: ProxyConfig): void;
/** Gets album or track info for a given album/track URL. */
export declare function promiseGetAlbumInfo(albumUrl: string, proxyConfig?: ProxyConfig): Promise<Response<AlbumInfo>>;
export declare function getArtistUrls(labelUrl: string, cb: Callback<string[]>, proxyConfig?: ProxyConfig): void;
export declare function hasMerch(artistUrl: string, cb: Callback<boolean>, proxyConfig?: ProxyConfig): void;
export declare function getMerchInfo(artistUrl: string, cb: Callback<any>, proxyConfig?: ProxyConfig): void;
export declare function promiseGetMerchInfo(artistUrl: string, proxyConfig?: ProxyConfig): Promise<Response<MerchItem[]>>;
export * from './types';
//# sourceMappingURL=index.d.ts.map