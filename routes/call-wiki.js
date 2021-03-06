const request = require("request")
const strip = require("strip")

const regex1 = /\\\\n/g
const regex2 = /\\n/g
const regex3 = /\\s/g
const regex4 = /\\"/g
const regex5 = /\\\\"/g
const regex6 = /\\'/g

module.exports = function makeWikiHelper() {
  return {
    
    // returns text of full Wikipedia page -- plain text
    getWikiPage: (query) => {
      const options = { method: 'GET',
        url: 'https://en.wikipedia.org/w//api.php',
        qs: 
        { format: 'json',
          action: 'query',
          prop: 'extracts',
          exlimit: 'max',
          redirects: 'true',
          titles: query 
          }
        };
      return new Promise(function(resolve, reject) {
        request(options, function (error, response, body) {
          if (error) {
            reject(error)
          }

          //parsing, taking out html elements, extraneous characters with regex)
          let result;
          try {
            result = JSON.parse(body)
          } catch (error) {
            console.error(`Unusual JSON: ${body}`)
            reject(error);
          }
          let pageId = Object.keys(result.query.pages)[0]
          let preParsed = result.query.pages[pageId].extract
          if (preParsed) {
            let spacedText = preParsed.replace(/(<.+?>)/g, '$1 ')
            let text = strip(JSON.stringify(spacedText))
            let usableText = text.replace(regex1, ' ')
              .replace(regex2, ' ').replace(regex3, "'s")
              .replace(regex4, '"').replace(regex5, '"').replace(regex6, "'")
            resolve(usableText);
          } else {
            resolve('')
          }
        })
      })
    }
  }
}
