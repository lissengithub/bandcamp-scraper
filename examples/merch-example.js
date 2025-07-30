const bandcamp = require('../dist/index')

const artistUrl = 'https://driftdeeper.bandcamp.com/'

// First check if the artist has merch available
bandcamp.hasMerch(artistUrl, function (error, hasMerchItems) {
  if (error) {
    console.error('Error checking for merch:', error)
    return
  }
  
  if (hasMerchItems) {
    console.log('✅ This artist has merch available!')
    
    // If merch is available, get the merch items
    bandcamp.getMerch(artistUrl, function (error, merchItems) {
      if (error) {
        console.error('Error getting merch:', error)
        return
      }
      
      if (merchItems && merchItems.length > 0) {
        console.log(merchItems)
        console.log(`\n🛍️  Found ${merchItems.length} merch items:`)
        merchItems.forEach((item, index) => {
          console.log(`\n${index + 1}. ${item.title}`)
          console.log(`   Type: ${item.type}`)
          if (item.price) console.log(`   Price: ${item.price}`)
          console.log(`   Status: ${item.status}`)
          if (item.imageUrl) console.log(`   Image: ${item.imageUrl}`)
          if (item.url) console.log(`   URL: ${item.url}`)
        })
      } else {
        console.log('❌ No merch items found')
      }
    })
  } else {
    console.log('❌ This artist does not have merch available')
  }
}) 