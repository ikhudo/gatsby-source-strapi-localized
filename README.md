# gatsby-source-strapi

Source plugin for pulling documents into Gatsby 2 from a Strapi API.

## Install

`npm install --save gatsby-source-strapi-localized`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-strapi`,
    options: {
      apiURL: `http://localhost:1337`,
      contentTypes: [`article`, `user`],
      availableLngs: ['en', 'de'],
      // Possibility to login with a strapi user, when content types are not publically available (optional).
      loginData: {
        identifier: '',
        password: '',
      },
    },
  },
]
```

## Strapi content
You need create fields like *title__en* and *title__de*

## How to query

You can query Document nodes created from your Strapi API like the following:

```graphql
{
  allStrapiArticles {
    edges {
      node {
        id
        locales {
          title
          content
          lng
        }
      }
    }
  }
}
```

and the response will be like:

```json
...
{
  "id": "Strapi__Articles__5bb61765593d462a14cabeb4",
  "locales": [
    {
      "title": "...",
      "content": "...",
      "lng": "en"
    },
    {
      "title": "...",
      "content": "...",
      "lng": "de"
    }
  ]
}
...
```
