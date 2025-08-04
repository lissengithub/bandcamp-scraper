import { SearchParams, SearchResult, AlbumInfo, Callback } from './types';
export declare function search(params: SearchParams, cb: Callback<SearchResult[]>): void;
export declare function getAlbumUrls(artistUrl: string, cb: Callback<string[]>): void;
export declare function getAlbumInfo(albumUrl: string, cb: Callback<AlbumInfo>): void;
export declare function getArtistUrls(labelUrl: string, cb: Callback<string[]>): void;
export declare function hasMerch(artistUrl: string, cb: Callback<boolean>): void;
export declare function getMerchInfo(artistUrl: string, cb: Callback<any>): void;
export * from './types';
//# sourceMappingURL=index.d.ts.map