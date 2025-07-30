import { getMerchInfo } from '../src/index'

const merchUrl = 'https://sophomorelounge.bandcamp.com'
getMerchInfo(merchUrl, function (error: Error | null, merchInfo) {
  if (error) {
    console.log(error)
  } else {
    console.log(JSON.stringify(merchInfo, null, 2))
  }
})

/*

*/ 