import { promiseGetMerchInfo } from '../src/index'

const merchUrl = 'https://sophomorelounge.bandcamp.com';
(async () => {
  const { error, data} = await promiseGetMerchInfo(merchUrl);
  if (error) {  
    console.log(error)
  } else {
    console.log(data)
    console.log(data.length)
  }
})()

/*

*/ 