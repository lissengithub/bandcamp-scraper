import { SearchParams, SearchResult, AlbumInfo, Callback, Response, MerchItem } from './types';
export declare function search(params: SearchParams, cb: Callback<SearchResult[]>): void;
export declare function getAlbumUrls(artistUrl: string, cb: Callback<string[]>): void;
export declare function promiseGetAlbumUrls(artistUrl: string): Promise<Response<string[]>>;
export declare function getAlbumInfo(albumUrl: string, cb: Callback<AlbumInfo>): void;
/** Gets album or track info for a given album/track URL. */
export declare function promiseGetAlbumInfo(albumUrl: string): Promise<Response<AlbumInfo>>;
export declare function getArtistUrls(labelUrl: string, cb: Callback<string[]>): void;
export declare function hasMerch(artistUrl: string, cb: Callback<boolean>): void;
export declare function getMerchInfo(artistUrl: string, cb: Callback<any>): void;
export declare function promiseGetMerchInfo(artistUrl: string): Promise<Response<MerchItem[]>>;
export * from './types';
//# sourceMappingURL=index.d.ts.map