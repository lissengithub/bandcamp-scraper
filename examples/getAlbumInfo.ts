import { getAlbumInfo } from '../src/index'


const albumUrl = 'https://kevinpike.bandcamp.com/track/emergence-from-the-basement'
getAlbumInfo(albumUrl, function (error: Error | null, albumInfo) {
  if (error) {
    console.log(error)
  } else {
    console.log(JSON.stringify(albumInfo, null, 2))
  }
})

/*

*/ 