import { getArtistInfo, ArtistInfo } from '../dist/index'

const artistUrl = 'http://musique.coeurdepirate.com/'
getArtistInfo(artistUrl, function (error: Error | null, artistInfo: ArtistInfo | null) {
  if (error) {
    console.log(error)
  } else {
    console.log(artistInfo)
  }
})

/* eslint-disable no-irregular-whitespace */
/*
{
  name: 'Cœur de pirate',
  location: 'Montréal, Québec',
  description: 'Cœur de Pirate is the solo project of singer Béatrice Martin. She has ' +
    'been playing piano since age 3 and released her \n                        ' +
    'acclaimed debut album in 2008. After touring extensively, she was ' +
    'nominated for and won several awards in Canada and France.Label: Dare To ' +
    'Care Records management@daretocarerecords.com \n                        ' +
    '... more',
  coverImage: 'https://f4.bcbits.com/img/0021821004_10.jpg',
  albums: [
    {
      url: 'http://musique.coeurdepirate.com//track/tes-belle',
      coverImage: 'https://f4.bcbits.com/img/a0774650359_7.jpg',
      title: "T'es belle"
    },
    {
      url: 'http://musique.coeurdepirate.com//track/ne-mappelle-pas',
      coverImage: 'https://f4.bcbits.com/img/a2603960871_7.jpg',
      title: "Ne m'appelle pas"
    },
    {
      url: 'http://musique.coeurdepirate.com//album/en-cas-de-temp-te-ce-jardin-sera-ferm',
      coverImage: 'https://f4.bcbits.com/img/a0248413645_7.jpg',
      title: 'en cas de tempête, ce jardin sera fermé.'
    },
    {
      url: 'http://musique.coeurdepirate.com//album/somnambule',
      coverImage: 'https://f4.bcbits.com/img/a1903816474_7.jpg',
      title: 'Somnambule'
    },
    {
      url: 'http://musique.coeurdepirate.com//album/pr-monition-2',
      coverImage: 'https://f4.bcbits.com/img/a2454271957_7.jpg',
      title: 'Prémonition'
    },
    {
      url: 'http://musique.coeurdepirate.com//album/chansons-tristes-pour-no-l',
      coverImage: 'https://f4.bcbits.com/img/a2476670277_7.jpg',
      title: 'Chansons tristes pour Noël'
    },
    {
      url: 'http://musique.coeurdepirate.com//album/roses',
      coverImage: 'https://f4.bcbits.com/img/a3347055233_7.jpg',
      title: 'Roses'
    },
    {
      url: 'http://musique.coeurdepirate.com//album/carry-on-2',
      coverImage: 'https://f4.bcbits.com/img/a4277887982_7.jpg',
      title: 'Carry On'
    },
    {
      url: 'http://musique.coeurdepirate.com//album/oublie-moi-carry-on',
      coverImage: 'https://f4.bcbits.com/img/a0891943451_7.jpg',
      title: 'Oublie​-​moi (Carry On)'
    },
    {
      url: 'http://musique.coeurdepirate.com//album/child-of-light',
      coverImage: 'https://f4.bcbits.com/img/a3984758353_7.jpg',
      title: 'Child of Light'
    },
    {
      url: 'http://musique.coeurdepirate.com//album/trauma',
      coverImage: 'https://f4.bcbits.com/img/a3799110102_7.jpg',
      title: 'Trauma'
    },
    {
      url: 'http://musique.coeurdepirate.com//album/blonde',
      coverImage: 'https://f4.bcbits.com/img/a1328452291_7.jpg',
      title: 'Blonde'
    },
    {
      url: 'http://musique.coeurdepirate.com//album/comme-des-enfants-version-originale-et-remix-par-le-matos',
      coverImage: 'https://f4.bcbits.com/img/a1250129776_7.jpg',
      title: 'Comme des enfants (Version originale et remix par Le Matos)'
    },
    {
      url: 'http://musique.coeurdepirate.com//album/coeur-de-pirate',
      coverImage: 'https://f4.bcbits.com/img/a2201751482_7.jpg',
      title: 'Coeur de pirate'
    }
  ],
  shows: [
    {
      date: 'Mar 06',
      venue: "L'AVAN.C",
      venueUrl: 'https://www.songkick.com/concerts/39735361-coeur-de-pirate-at-lavanc?utm_source=1471&utm_medium=partner',
      ticketUrl: 'https://www.songkick.com/concerts/39735361-coeur-de-pirate-at-lavanc?utm_source=1471&utm_medium=partner'
    },
    {
      date: 'Mar 07',
      venue: 'MTELUS',
      venueUrl: 'https://www.songkick.com/venues/293873-mtelus?utm_source=1471&utm_medium=partner',
      ticketUrl: 'https://www.songkick.com/concerts/39735362-coeur-de-pirate-at-mtelus?utm_source=1471&utm_medium=partner'
    },
    {
      date: 'Mar 08',
      venue: 'The Concert Hall',
      venueUrl: 'https://www.songkick.com/venues/293873-the-concert-hall?utm_source=1471&utm_medium=partner',
      ticketUrl: 'https://www.songkick.com/concerts/39735363-coeur-de-pirate-at-the-concert-hall?utm_source=1471&utm_medium=partner'
    }
  ]
}
*/ 