const { createRemoteFileNode } = require(`gatsby-source-filesystem`)
import createNodeHelpers from 'gatsby-node-helpers'

const { generateNodeId } = createNodeHelpers({
  typePrefix: 'StrapiMedia',
})

// Downloads media from image type fields
exports.downloadMediaFiles = async ({
  entities,
  apiURL,
  store,
  cache,
  createNode,
  touchNode,
  jwtToken: auth,
}) =>
  Promise.all(
    entities.map(async entity => {
      for (let item of entity) {
        // loop item over fields
        for (const key of Object.keys(item)) {
          const field = item[key]

          // image fields have a mime property among other
          // maybe should find a better test
          if (field !== null && field.hasOwnProperty('mime')) {
            let fileNodeID
            // using field on the cache key for multiple image field
            const mediaDataCacheKey = `strapi-media-${item.id}-${key}`
            const cacheMediaData = await cache.get(mediaDataCacheKey)

            // If we have cached media data and it wasn't modified, reuse
            // previously created file node to not try to redownload
            if (
              cacheMediaData &&
              field.updatedAt === cacheMediaData.updatedAt
            ) {
              fileNodeID = cacheMediaData.fileNodeID
              touchNode(cacheMediaData.fileNodeID)
            }

            // If we don't have cached data, download the file
            if (!fileNodeID) {
              try {
                // full media url
                const source_url = apiURL + field.url
                const fileNode = await createRemoteFileNode({
                  url: source_url,
                  store,
                  cache,
                  createNode,
                  createNodeId: generateNodeId,
                  auth,
                })
                console.log('@@@ fileNode', fileNode)

                // If we don't have cached data, download the file
                if (fileNode) {
                  fileNodeID = fileNode.id

                  await cache.set(mediaDataCacheKey, {
                    fileNodeID,
                    modified: field.updatedAt,
                  })
                }
              } catch (e) {
                // Ignore
              }
            }
            console.log('@@@ key', key)

            if (fileNodeID) {
              item[`${key}___NODE`] = fileNodeID
            }

            console.log('@@@ item', item)
          }
        }
      }
      return entity
    })
  )
