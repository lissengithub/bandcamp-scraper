import { promiseGetAlbumUrls } from '../src/index'

const artistUrl = 'https://lacedrecords.bandcamp.com';
(async () => {
  const { error, data } = await promiseGetAlbumUrls(artistUrl, { url:"http://sp96xbyo6k:z8i3e_FJkk43ncPcNb@dc.decodo.com:10000" })
  if (error) {
    console.log(error)
  } else {
    console.log(data)
  }
})()
/*
[ 'http://musique.coeurdepirate.com/album/roses',
  'http://musique.coeurdepirate.com/album/carry-on-2',
  'http://musique.coeurdepirate.com/album/oublie-moi-carry-on',
  'http://musique.coeurdepirate.com/album/child-of-light',
  'http://musique.coeurdepirate.com/album/trauma',
  'http://musique.coeurdepirate.com/album/blonde',
  'http://musique.coeurdepirate.com/album/coeur-de-pirate',
  'http://musique.coeurdepirate.com/album/comme-des-enfants-version-originale-et-remix-par-le-matos' ]
*/ 