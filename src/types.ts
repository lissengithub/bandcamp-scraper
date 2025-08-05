type SuccessResponse<T> = {
  error: null;
  data: T;
}

type ErrorResponse = {
  error: Error;
  data: null;
}

export type Response<T> = SuccessResponse<T> | ErrorResponse;

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

export interface AlbumProduct {
  title: string;
  price?: string;
  type: string;
  url?: string;
}

export interface MerchItem {
  id: string;
  title: string;
  type: string;
  price: string;
  imageUrl: string;
  url: string;
}

export interface Track {
  name: string;
  url: string;
  duration: string;
}

export interface TrackInfo {
  id: number;
  track_id: number;
  file: {
    [key: string]: string; // e.g., "mp3-128": "url"
  };
  artist: string;
  title: string;
  encodings_id: number;
  license_type: number;
  private: null | boolean;
  track_num: null | number;
  album_preorder: boolean;
  unreleased_track: boolean;
  title_link: string;
  has_lyrics: boolean;
  has_info: boolean;
  streaming: number;
  is_downloadable: boolean;
  has_free_download: null | boolean;
  free_album_download: boolean;
  duration: number;
  lyrics: null | string;
  sizeof_lyrics: number;
  is_draft: boolean;
  video_source_type: null | string;
  video_source_id: null | string;
  video_mobile_url: null | string;
  video_poster_url: null | string;
  video_id: null | string;
  video_caption: null | string;
  video_featured: null | boolean;
  alt_link: null | string;
  encoding_error: null | string;
  encoding_pending: null | boolean;
  play_count: number;
  is_capped: boolean;
  track_license_id: null | number;
}

export interface CurrentInfo {
  audit: number;
  title: string;
  new_date: string;
  mod_date: string;
  publish_date: string;
  private: null | boolean;
  killed: null | boolean;
  download_pref: number;
  require_email: null | boolean;
  is_set_price: null | number;
  set_price: null | number;
  minimum_price: number;
  minimum_price_nonzero: number;
  require_email_0: null | boolean;
  artist: null | string;
  about: string;
  credits: null | string;
  auto_repriced: null | boolean;
  new_desc_format: number;
  band_id: number;
  selling_band_id: number;
  art_id: number;
  download_desc_id: null | number;
  release_date: string;
  upc: string;
  purchase_url: null | string;
  purchase_title: null | string;
  featured_track_id: number;
  id: number;
  type: 'album' | 'track';
  // Additional fields that may appear for tracks
  track_number?: null | number;
  file_name?: null | string;
  lyrics?: null | string;
  album_id?: null | number;
  encodings_id?: number;
  pending_encodings_id?: null | number;
  license_type?: number;
  isrc?: string;
  preorder_download?: null | boolean;
  streaming?: number;
}

export interface Package {
  id: number;
  url: string;
  url_for_app: string;
  type_id: number;
  type_name: string;
  title: string;
  // Add more package fields as needed
}

export interface PlayCapData {
  streaming_limits_enabled: boolean;
  streaming_limit: number;
}

export interface RawData {
  "for the curious": string;
  current: CurrentInfo;
  preorder_count: null | number;
  hasAudio: boolean;
  art_id: number;
  packages: null | Package[];
  defaultPrice: number;
  freeDownloadPage: null | string;
  FREE: number;
  PAID: number;
  artist: string;
  item_type: 'album' | 'track';
  id: number;
  last_subscription_item: null | any;
  has_discounts: boolean;
  is_bonus: null | boolean;
  play_cap_data: PlayCapData;
  is_purchased: null | boolean;
  items_purchased: null | any;
  is_private_stream: null | boolean;
  is_band_member: null | boolean;
  licensed_version_ids: null | any;
  package_associated_license_id: null | any;
  has_video: null | boolean;
  tralbum_subscriber_only: null | boolean;
  album_is_preorder?: null | boolean;
  album_release_date?: null | string;
  trackinfo?: TrackInfo[];
  playing_from?: string;
  album_url?: null | string;
  album_upsell_url?: null | string;
  url?: string;
}

export interface AlbumInfo {
  tags: string[];
  artist: string;
  title: string;
  imageUrl: string;
  tracks: Track[];
  raw: RawData;
  url?: string; // May be present for tracks
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