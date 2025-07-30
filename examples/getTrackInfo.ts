import { getTrackInfo, TrackInfo } from '../dist/index'

const trackUrl = 'https://dafnez.bandcamp.com/track/serenade'
getTrackInfo(trackUrl, function (error: Error | null, trackInfo: TrackInfo | null) {
  if (error) {
    console.log(error)
  } else {
    console.log(trackInfo)
  }
})

/*
{
  title: 'Serenade',
  duration: '03:45',
  url: 'https://dafnez.bandcamp.com/track/serenade'
}
*/ 