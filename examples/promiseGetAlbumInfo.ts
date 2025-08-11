import { promiseGetAlbumInfo } from '../src/index'

// https://chezmonplaisir.bandcamp.com/track/where-im-high Track on album with no price
// https://lacedrecords.bandcamp.com/track/runescape-runefest-medley-remix - Single with set price
// https://bonobomusic.bandcamp.com/track/d-song - Track on an album with set price
// https://coeurdepirate.bandcamp.com/track/l-ve-les-voiles - Track on an album
// https://coeurdepirate.bandcamp.com/album/blonde - Album
const albumUrl = 'https://lacedrecords.bandcamp.com/track/let-the-good-times-roll';

(async () => {
  const { error, data } = await promiseGetAlbumInfo(albumUrl)
  if (error) {
    console.log(error)
  } else {
    console.log(JSON.stringify(data, null, 2))
  }
})()