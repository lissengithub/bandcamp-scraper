import { TrackInfo, AlbumProduct, MerchItem } from './types';
export declare function parseSearchResults(html: string): any;
export declare function extractAlbumUrlsFromDataBlob(html: string): {
    name: any;
    artist: any;
    url: any;
    artist_url: any;
}[];
export declare function parseTagResults(html: string): any;
export declare function parseAlbumUrls(html: string, artistUrl: string): string[];
export declare function parseArtistUrls(html: string, labelUrl: string): string[];
export declare function extractJavascriptObjectVariable(html: string, variableName: string): string | undefined;
export declare function parseAlbumInfo(html: string, albumUrl: string): any;
export declare function parseTrackInfo(html: string, trackUrl: string): TrackInfo;
export declare function parseAlbumProducts(html: string, albumUrl: string): AlbumProduct[];
export declare function hasMerch(html: string): boolean;
export declare function parseMerchInfo(html: string, artistUrl: string): MerchItem[];
//# sourceMappingURL=htmlParser.d.ts.map