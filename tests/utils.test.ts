import { describe, it, expect } from 'vitest'
import * as utils from '../dist/utils'

describe('utils', () => {
  describe('generateSearchUrl', () => {
    it('throws an Error without params', () => {
      expect(() => {
        utils.generateSearchUrl(undefined as any)
      }).toThrowError('Expect params to be an object.')
    })

    it('throws an Error without param.query', () => {
      expect(() => {
        utils.generateSearchUrl({} as any)
      }).toThrowError('Expect params to have string property named query.')
    })

    it('throws an Error with invalid param.query', () => {
      expect(() => {
        utils.generateSearchUrl({ query: null } as any)
      }).toThrowError('Expect params to have string property named query.')
    })

    it('does not throw an Error without param.page', () => {
      expect(() => {
        utils.generateSearchUrl({ query: 'mac demarco' })
      }).not.toThrowError()
    })

    it('throws an Error with invalid param.page', () => {
      expect(() => {
        utils.generateSearchUrl({ query: 'mac demarco', page: null as any })
      }).toThrowError('Expect params named page to be type number.')
    })

    it('generate url without params.page', () => {
      expect(utils.generateSearchUrl({ query: 'mac demarco' }))
        .toEqual('https://bandcamp.com/search?q=mac%20demarco&page=1')
    })

    it('generates url with all params', () => {
      expect(utils.generateSearchUrl({ query: 'mac demarco', page: 1 }))
        .toEqual('https://bandcamp.com/search?q=mac%20demarco&page=1')
    })
  })

  describe('generateTagUrl', () => {
    it('throws an Error without params', () => {
      expect(() => {
        utils.generateTagUrl(undefined as any)
      }).toThrowError('Expect params to be an object.')
    })

    it('throws an Error without param.tag', () => {
      expect(() => {
        utils.generateTagUrl({} as any)
      }).toThrowError('Expect params to have string property named tag.')
    })

    it('throws an Error with invalid param.tag', () => {
      expect(() => {
        utils.generateTagUrl({ tag: null } as any)
      }).toThrowError('Expect params to have string property named tag.')
    })

    it('does not throw an Error without param.page', () => {
      expect(() => {
        utils.generateTagUrl({ tag: 'jazz' })
      }).not.toThrowError()
    })

    it('throws an Error with invalid param.page', () => {
      expect(() => {
        utils.generateTagUrl({ tag: 'jazz', page: null as any })
      }).toThrowError('Expect params named page to be type number.')
    })

    it('generate url without params.page', () => {
      expect(utils.generateTagUrl({ tag: 'jazz' }))
        .toEqual('https://bandcamp.com/tag/jazz?page=1')
    })

    it('generates url with all params', () => {
      expect(utils.generateTagUrl({ tag: 'jazz', page: 2 }))
        .toEqual('https://bandcamp.com/tag/jazz?page=2')
    })
  })
}) 