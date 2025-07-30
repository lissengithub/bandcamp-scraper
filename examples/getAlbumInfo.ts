import { getAlbumInfo } from '../src/index'

const albumUrl = 'https://coeurdepirate.bandcamp.com/album/blonde'
getAlbumInfo(albumUrl, function (error: Error | null, albumInfo) {
  if (error) {
    console.log(error)
  } else {
    console.log(JSON.stringify(albumInfo, null, 2))
  }
})

/*

*/ 