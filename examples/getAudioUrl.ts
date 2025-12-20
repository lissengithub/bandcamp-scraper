import { getAlbumInfo, getAudioUrls, getDownloadPageUrl } from '../src/index'

// Example: Get audio URL for a free track
const trackUrl = 'https://fineforest.bandcamp.com/track/universal'

getAlbumInfo(trackUrl, function (error: Error | null, albumInfo) {
  if (error) {
    console.log('Error:', error)
    return
  }

  if (!albumInfo) {
    console.log('No album info found')
    return
  }

  // Get the MP3 streaming URL (this is what you can use to download)
  const audioUrl = getAudioUrls(albumInfo, 'mp3-128')
  
  if (audioUrl && typeof audioUrl === 'string') {
    console.log('Audio URL (MP3-128):', audioUrl)
    console.log('\nYou can download this file directly using:')
    console.log(`curl -o track.mp3 "${audioUrl}"`)
    console.log('or use any HTTP client to download it.')
  } else {
    console.log('No audio URL found')
  }

  // Also get the download page URL (alternative method)
  const downloadPageUrl = getDownloadPageUrl(albumInfo)
  if (downloadPageUrl) {
    console.log('\nDownload page URL:', downloadPageUrl)
    console.log('(You can visit this URL to get the official download)')
  }

  // Show available formats
  if (albumInfo.raw && albumInfo.raw.trackinfo && albumInfo.raw.trackinfo.length > 0) {
    const track = albumInfo.raw.trackinfo[0]
    console.log('\nAvailable formats:', Object.keys(track.file || {}))
  }
})

