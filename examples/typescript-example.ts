import { search, getAlbumInfo, SearchParams, AlbumInfo } from '../dist/index';

// Example using TypeScript with proper type checking
const searchParams: SearchParams = {
  query: 'Mac DeMarco',
  page: 1
};

console.log('Searching for:', searchParams.query);

search(searchParams, (error: Error | null, results: any) => {
  if (error) {
    console.error('Search error:', error);
    return;
  }
  
  console.log(`Found ${results.length} results`);
  
  if (results.length > 0) {
    const firstResult = results[0];
    console.log('First result:', {
      type: firstResult.type,
      name: firstResult.name,
      url: firstResult.url
    });
    
    // Get album info for the first result if it's an album
    if (firstResult.type === 'album') {
      getAlbumInfo(firstResult.url, (error: Error | null, albumInfo: AlbumInfo | null) => {
        if (error) {
          console.error('Album info error:', error);
          return;
        }
        
        if (albumInfo) {
          console.log('Album details:', {
            title: albumInfo.title,
            artist: albumInfo.artist,
            tracks: albumInfo.tracks?.length || 0,
            genre: albumInfo.genre
          });
        }
      });
    }
  }
}); 