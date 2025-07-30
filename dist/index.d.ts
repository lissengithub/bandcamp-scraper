import { SearchParams, TagParams, SearchResult, TagResult, AlbumInfo, AlbumProduct, ArtistInfo, TrackInfo, Callback } from './types';
export declare function search(params: SearchParams, cb: Callback<SearchResult[]>): void;
export declare function getAlbumsWithTag(params: TagParams, cb: Callback<TagResult[]>): void;
export declare function getAlbumUrls(artistUrl: string, cb: Callback<string[]>): void;
export declare function getAlbumInfo(albumUrl: string, cb: Callback<AlbumInfo>): void;
export declare function getAlbumProducts(albumUrl: string, cb: Callback<AlbumProduct[]>): void;
export declare function getArtistUrls(labelUrl: string, cb: Callback<string[]>): void;
export declare function getArtistInfo(artistUrl: string, cb: Callback<ArtistInfo>): void;
export declare function getTrackInfo(trackUrl: string, cb: Callback<TrackInfo>): void;
export * from './types';
//# sourceMappingURL=index.d.ts.map