export interface SearchParams {
    query: string;
    page?: number;
}
export interface TagParams {
    tag: string;
    page?: number;
}
export interface SearchResult {
    type: string;
    name: string;
    url: string;
    imageUrl?: string;
    tags: string[];
    genre?: string;
    subhead?: string;
    releaseDate?: string;
    numTracks?: number;
    numMinutes?: number;
}
export interface TagResult {
    type: string;
    name: string;
    url: string;
    imageUrl?: string;
    tags: string[];
    genre?: string;
    subhead?: string;
    releaseDate?: string;
    numTracks?: number;
    numMinutes?: number;
}
export interface AlbumInfo {
    title: string;
    artist: string;
    url: string;
    imageUrl?: string;
    genre?: string;
    tags: string[];
    releaseDate?: string;
    numTracks?: number;
    numMinutes?: number;
    description?: string;
    tracks?: TrackInfo[];
}
export interface TrackInfo {
    title: string;
    duration?: string;
    url?: string;
}
export interface AlbumProduct {
    title: string;
    price?: string;
    type: string;
    url?: string;
}
export interface ArtistInfo {
    name: string;
    url: string;
    imageUrl?: string;
    genre?: string;
    tags: string[];
    description?: string;
    location?: string;
    albums?: AlbumInfo[];
}
export type Callback<T> = (error: Error | null, result: T | null) => void;
//# sourceMappingURL=types.d.ts.map