import axios from 'axios'
import { isObject, startsWith, forEach } from 'lodash'

module.exports = async ({ apiURL, contentType, jwtToken, availableLngs }) => {
  console.time('Fetch Strapi data')
  console.log(`Starting to fetch data from Strapi (${contentType})`)

  // Define API endpoint.
  const apiEndpoint = `${apiURL}/${contentType}`

  // Set authorization token
  let fetchRequestConfig = {}
  if (jwtToken !== null) {
    fetchRequestConfig.headers = {
      Authorization: `Bearer ${jwtToken}`,
    }
  }

  // Make API request.
  const documents = await axios(apiEndpoint, fetchRequestConfig)

  // Query all documents from client.
  console.timeEnd('Fetch Strapi data')

  // Map and clean data.
  return documents.data.map(item => {
    const cleanItem = clean(item)

    if (availableLngs.length) {
      cleanItem.locales = availableLngs.map(lng => ({
        lng,
      }))

      return localize(cleanItem)
    }

    return cleanItem
  })
}

/**
 * Remove fields starting with `_` symbol.
 *
 * @param {object} item - Entry needing clean
 * @returns {object} output - Object cleaned
 */
const clean = item => {
  forEach(item, (value, key) => {
    if (startsWith(key, `__`)) {
      delete item[key]
    } else if (startsWith(key, `_`)) {
      delete item[key]
      item[key.slice(1)] = value
    } else if (isObject(value)) {
      item[key] = clean(value)
    }
    if (key === 'data') {
      item.data = JSON.stringify(value)
    }
  })

  return item
}

const localize = item => {
  forEach(item, (value, key) => {
    const fieldSplit = key.split('__')
    const fieldName = fieldSplit[0]
    const fieldLocale = fieldSplit[1]

    if (item.locales && item.locales.length && fieldLocale) {
      item.locales = item.locales.map(locale => {
        if (fieldLocale === locale.lng) {
          return {
            ...locale,
            [fieldName]: value,
          }
        }

        return locale
      })

      delete item[key]
    }
  })
  return item
}
