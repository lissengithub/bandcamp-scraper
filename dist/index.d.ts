import { SearchParams, TagParams, SearchResult, TagResult, AlbumInfo, AlbumProduct, TrackInfo, MerchItem, Callback } from './types';
export declare function search(params: SearchParams, cb: Callback<SearchResult[]>): void;
export declare function getAlbumsWithTag(params: TagParams, cb: Callback<TagResult[]>): void;
export declare function getAlbumUrls(artistUrl: string, cb: Callback<string[]>): void;
export declare function getAlbumInfo(albumUrl: string, cb: Callback<AlbumInfo>): void;
export declare function getAlbumProducts(albumUrl: string, cb: Callback<AlbumProduct[]>): void;
export declare function getArtistUrls(labelUrl: string, cb: Callback<string[]>): void;
export declare function getTrackInfo(trackUrl: string, cb: Callback<TrackInfo>): void;
export declare function hasMerch(artistUrl: string, cb: Callback<boolean>): void;
export declare function getMerch(artistUrl: string, cb: Callback<MerchItem[]>): void;
export * from './types';
//# sourceMappingURL=index.d.ts.map