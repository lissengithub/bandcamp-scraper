import { promiseGetAlbumInfo } from '../src/index'

const albumUrl = 'https://coeurdepirate.bandcamp.com/album/blonde';

(async () => {
  const { error, data } = await promiseGetAlbumInfo(albumUrl)
  if (error) {
    console.log(error)
  } else {
    console.log(JSON.stringify(data, null, 2))
  }
})()