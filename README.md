# bandcamp-scraper

[![npm version](https://badge.fury.io/js/bandcamp-scraper.svg)](https://badge.fury.io/js/bandcamp-scraper)
![Test](https://github.com/masterT/bandcamp-scraper/workflows/Test/badge.svg?event=push)
![Test daily](https://github.com/masterT/bandcamp-scraper/workflows/Test/badge.svg?event=schedule)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

[![Bandcamp Logo](assets/bandcamp.png)](https://bandcamp.com)

> A scraper for https://bandcamp.com

The scraper allows you to:

- search `artist`, `album`, `track`, `fan`, `label`
- get album urls from an artist url
- get album info from an album url
- get album products from an album url
- get artist info from an artist url

#### Why ?

Because Bandcamp has shut down their public API and don't plan to reopen it.

[https://bandcamp.com/developer](https://bandcamp.com/developer)

## Installation

```bash
npm i --save bandcamp-scraper
```

## TypeScript Support

This project is now written in TypeScript and provides full type definitions. The compiled JavaScript is available in the `dist` directory.

### TypeScript Usage

```typescript
import { search, getAlbumInfo, SearchParams, AlbumInfo } from 'bandcamp-scraper';

const searchParams: SearchParams = {
  query: 'Mac DeMarco',
  page: 1
};

search(searchParams, (error: Error | null, results: any) => {
  if (error) {
    console.error('Search error:', error);
    return;
  }
  
  console.log(`Found ${results.length} results`);
});
```

### Available Types

- `SearchParams` - Parameters for search function
- `TagParams` - Parameters for tag search function
- `SearchResult` - Search result object
- `TagResult` - Tag search result object
- `AlbumInfo` - Album information object
- `TrackInfo` - Track information object
- `ArtistInfo` - Artist information object
- `AlbumProduct` - Album product object
- `MerchItem` - Merchandise item object
- `Callback<T>` - Generic callback type

## Usage

### `search(params, callback)`

Search any resources that match the given `params.query` for the current `params.page`.

- params _Object_ - query _String_ - page _Integer_ (default `1`)
- callback _Function(error, searchResults)_

#### Search Results

An array of resources that have different properties depending on their _type_ property: **artist**, **album**, **track**, **fan**, or **label**.

Every resource matches the [search-result JSON schema](/schemas/search-result.json).

#### Example

```js
const bandcamp = require('bandcamp-scraper')

const params = {
  query: 'Coeur de pirate',
  page: 1
}

bandcamp.search(params, function (error, searchResults) {
  if (error) {
    console.log(error)
  } else {
    console.log(searchResults)
  }
})
```

[View example with output](examples/search.ts).

### `getAlbumsWithTag(params, callback)`

Search for albums with the tag `params.tag` for the current `params.page`.

- params _Object_ - tag _String_ - page _Integer_ (default `1`)
- callback _Function(error, tagResults)_

#### Tag Results

An array of album information. Matches the [tag-result JSON schema](/schemas/tag-result.json).

#### Example

```js
const bandcamp = require('bandcamp-scraper')

const params = {
  tag: 'nuwrld',
  page: 1
}

bandcamp.getAlbumsWithTag(params, function (error, tagResults) {
  if (error) {
    console.log(error)
  } else {
    console.log(tagResults)
  }
})
```

[View example with output](examples/getAlbumsWithTag.ts).

### `getAlbumUrls(artistUrl, callback)`

Retrieve the album URLs from an artist URL.
Please note: for Bandcamp labels you may want to use the `getArtistsUrls` function to retrieve the list of signed artists first.

- artistUrl _String_
- callback _Function(error, albumUrls)_

#### Example

```js
const bandcamp = require('bandcamp-scraper')

const artistUrl = 'http://musique.coeurdepirate.com/'
bandcamp.getAlbumUrls(artistUrl, function (error, albumUrls) {
  if (error) {
    console.log(error)
  } else {
    console.log(albumUrls)
  }
})
```

[View example with output](examples/getAlbumUrls.ts).

### `getAlbumProducts(albumUrl, callback)`

Retrieves all the album's products from its URL.

- albumUrl _String_
- callback _Function(error, albumProducts)_

#### Album Products

An array of album products that matches the [album-product JSON schema](/schemas/album-product.json).

#### Example

```js
const bandcamp = require('bandcamp-scraper')

const albumUrl = 'http://musique.coeurdepirate.com/album/blonde'
bandcamp.getAlbumProducts(albumUrl, function (error, albumProducts) {
  if (error) {
    console.log(error)
  } else {
    console.log(albumProducts)
  }
})
```

[View example with output](examples/getAlbumProducts.ts).

### `getAlbumInfo(albumUrl, callback)`

Retrieves the album's info from its URL.

- albumUrl _String_
- callback _Function(error, albumInfo)_

#### Album Info

An _Object_ that represents the album's info. It matches the [album-info JSON schema](/schemas/album-info.json).

#### Example

```js
const bandcamp = require('bandcamp-scraper')

const albumUrl = 'http://musique.coeurdepirate.com/album/blonde'
bandcamp.getAlbumInfo(albumUrl, function (error, albumInfo) {
  if (error) {
    console.log(error)
  } else {
    console.log(albumInfo)
  }
})
```

[View example with output](examples/getAlbumInfo.ts).

### `getArtistUrls(labelUrl, callback)`

Retrieves an array of artist URLs from a label's URL for further scraping.

- labelUrl _String_
- callback _Function(error, albumInfo)_

#### Example

```js
const bandcamp = require('bandcamp-scraper')

const labelUrl = 'https://randsrecords.bandcamp.com'
bandcamp.getArtistUrls(labelUrl, function (error, artistsUrls) {
  if (error) {
    console.log(error)
  } else {
    console.log(artistsUrls)
  }
})
```

[View example with output](examples/getArtistsUrls.ts).

### `getArtistInfo(artistUrl, callback)`

Retrieves the artist's info from its URL.

- artistUrl _String_
- callback _Function(error, artistInfo)_

#### Artist Info

An _Object_ that represents the artist's info. It matches the [artist-info JSON schema](/schemas/artist-info.json).
#### Example

```js
const bandcamp = require('bandcamp-scraper')

const artistUrl = 'http://musique.coeurdepirate.com'
bandcamp.getArtistInfo(artistUrl, function (error, artistInfo) {
  if (error) {
    console.log(error)
  } else {
    console.log(artistInfo)
  }
})
```

[View example with output](examples/getArtistInfo.ts).

### `getTrackInfo(trackUrl, callback)`

Retrieves the track info from its URL.

- trackUrl _String_
- callback _Function(error, trackInfo)_

#### Track Info

An _Object_ that represents the track's info. It matches the [track-info JSON schema](/schemas/track-info.json).
#### Example

```js
const bandcamp = require('bandcamp-scraper')

const trackUrl = 'https://dafnez.bandcamp.com/track/serenade'
bandcamp.getTrackInfo(trackUrl, function (error, trackInfo) {
  if (error) {
    console.log(error)
  } else {
    console.log(trackInfo)
  }
})
```

[View example with output](examples/getTrackInfo.ts).

### `hasMerch(artistUrl, callback)`

Checks if an artist has merch available on their Bandcamp page.

- artistUrl _String_
- callback _Function(error, hasMerch)_

#### Example

```js
const bandcamp = require('bandcamp-scraper')

const artistUrl = 'https://frenetikglasgow.bandcamp.com'
bandcamp.hasMerch(artistUrl, function (error, hasMerch) {
  if (error) {
    console.log(error)
  } else {
    console.log('Has merch:', hasMerch)
  }
})
```

### `getMerch(artistUrl, callback)`

Retrieves all merch items from an artist's Bandcamp merch page.

- artistUrl _String_
- callback _Function(error, merchItems)_

#### Merch Items

An array of merch items with the following properties:
- `title` - The name of the merch item
- `type` - The type of merch (e.g., "T-Shirt/Apparel")
- `price` - The price of the item (if available)
- `status` - Availability status ("Available" or "Sold Out")
- `imageUrl` - URL to the merch item image
- `url` - Direct link to the merch item

#### Example

```js
const bandcamp = require('bandcamp-scraper')

const artistUrl = 'https://frenetikglasgow.bandcamp.com'
bandcamp.getMerch(artistUrl, function (error, merchItems) {
  if (error) {
    console.log(error)
  } else {
    console.log(merchItems)
  }
})
```

[View example with output](examples/merch-example.ts).

## Development

This project is written in TypeScript. To work on the codebase:

### Prerequisites

- Node.js (version 14 or higher)
- npm

### Setup

```bash
# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build

# Watch for changes during development
npm run dev
```

### Project Structure

- `src/` - TypeScript source files
- `dist/` - Compiled JavaScript files (generated)
- `schemas/` - JSON schemas for validation
- `examples/` - Usage examples
- `spec/` - Test files

### Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Watch mode for development
- `npm test` - Run tests (builds first)
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run linter
- `npm run lint-fix` - Fix linting issues

## Test

Feature tests are run _daily_, thanks to [GitHub Action](https://docs.github.com/en/free-pro-team@latest/actions) schedule actions. This way we know if the scraper is ever broken.

Run the test:

```bash
npm test
```

## Contributing

Contribution is welcome! Open an issue first.

## License

MIT.
