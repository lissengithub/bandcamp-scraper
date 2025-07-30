import { SearchResult, TagResult, AlbumInfo, TrackInfo, ArtistInfo, AlbumProduct } from './types';
export declare function parseSearchResults(html: string): SearchResult[];
export declare function extractAlbumUrlsFromDataBlob(html: string): any[];
export declare function parseTagResults(html: string): TagResult[];
export declare function parseAlbumUrls(html: string, artistUrl: string): string[];
export declare function parseArtistUrls(html: string, labelUrl: string): string[];
export declare function extractJavascriptObjectVariable(html: string, variableName: string): any;
export declare function parseAlbumInfo(html: string, albumUrl: string): AlbumInfo;
export declare function parseTrackInfo(html: string, trackUrl: string): TrackInfo;
export declare function parseArtistInfo(html: string, artistUrl: string): ArtistInfo;
export declare function parseAlbumProducts(html: string, albumUrl: string): AlbumProduct[];
//# sourceMappingURL=htmlParser.d.ts.map