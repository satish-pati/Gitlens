Details for: Add other GIF providers
📄 File: src/components/giphy-toolbar-item.js
+ Added Lines:


Tenor
- Removed Lines:

📄 File: src/lib/giphy.js → src/lib/providers/giphy.js
📄 File: src/lib/providers/tenor.js
+ Added Lines:

export default class Tenor {
constructor(apiToken) {
if (!apiToken) {
throw new Error('[Tenor] API Token required')
}
this.apiToken = apiToken
}

async search(q, offset = 0) {
const params = new URLSearchParams({
q: q,
key: this.apiToken,
client_key: "my_test_app",
limit: 50,
pos: offset,
})
const response = await fetch(`https://tenor.googleapis.com/v2/search?${params.toString()}`)
const decodedResponse = await response.json()

return decodedResponse.results.map(Tenor.convertToGiphyObj)
}

async getTrending(offset = 0) {
const params = new URLSearchParams({
key: this.apiToken,
client_key: "my_test_app",
limit: 50,
})

if (offset > 0) {
params.pos = offset
}

const response = await fetch(`https://tenor.googleapis.com/v2/featured?${params.toString()}`)
const decodedResponse = await response.json()

return decodedResponse.results.map(Tenor.convertToGiphyObj)
}

static convertToGiphyObj(item) {
return {
images: {
original: {
size: item.media_formats.gif.size,
url: item.media_formats.gif.url,
},
downsized_medium: {
size: item.media_formats.mediumgif.size,
url: item.media_formats.mediumgif.url,
},
fixed_width: {
size: item.media_formats.tinygif.size,
url: item.media_formats.tinygif.url,
height: item.media_formats.tinygif.dims[1],
width: item.media_formats.tinygif.dims[0],
},
fixed_width_downsampled: {
size: item.media_formats.tinygif.size,
url: item.media_formats.tinygif.url,
},
}
}
}
}
📄 File: src/main.js
+ Added Lines:

import Giphy from './lib/providers/giphy.js'
import Tenor from './lib/providers/tenor.js'
const providers = {
tenor: new Tenor('AIzaSyDPNP-ivCtCACDvIV-M0i86TgKbZv5a-0Q'),
giphy: new Giphy('Mpy5mv1k9JRY2rt7YBME2eFRGNs7EGvQ')
};

let provider = providers.tenor;

const gifs = awaitprovider.getTrending()
?provider.getTrending()
:provider.search(searchQuery))
?provider.search(searchQuery, offset)
:provider.getTrending(offset))
/**
* Updates the GIF provider
*/
function changeProvider(e) {
provider = providers[e.target.value]
}

delegate('.ghg-provider-selector', 'change', changeProvider)
- Removed Lines:

import Giphy from './lib/giphy.js'
// Create a new Giphy Client
const giphyClient = new Giphy('Mpy5mv1k9JRY2rt7YBME2eFRGNs7EGvQ')
const gifs = awaitgiphyClient.getTrending()
?giphyClient.getTrending()
:giphyClient.search(searchQuery))
?giphyClient.search(searchQuery, offset)
:giphyClient.getTrending(offset))
📄 File: src/manifest.json
+ Added Lines:

"https://api.giphy.com/*",
"https://tenor.googleapis.com/*"
- Removed Lines:

"https://api.giphy.com/*"
PR Description:
Pull Request Analysis: Add other GIF providers
Overview
The pull request adds support for multiple GIF providers, including Tenor and Giphy. The changes affect the functionality, structure, and performance of the codebase. In this analysis, we will highlight the improvements, potential issues, and security concerns, and suggest best practices and optimizations.

Functionality Changes
Added support for multiple GIF providers: The code now allows users to select between Tenor and Giphy as their GIF provider.
Introduced a provider selector: A dropdown menu has been added to allow users to switch between providers.
Updated API calls: The code now uses the selected provider's API to fetch GIFs.
Structure Changes
Refactored Giphy code into a separate module: The Giphy code has been moved into its own module, `src/lib/providers/giphy.js`.
Added a new module for Tenor: A new module, `src/lib/providers/tenor.js`, has been added to handle Tenor API calls.
Updated main code to use providers: The main code now uses the selected provider to fetch GIFs.
Performance Changes
Improved modularity: The code is now more modular, with each provider having its own module.
Potential performance impact: The added complexity of supporting multiple providers may have a performance impact, depending on the implementation.
Improvements
Increased flexibility: The code now allows users to choose their preferred GIF provider.
Improved maintainability: The modular structure makes it easier to maintain and update the code.
Potential Issues
API key exposure: The API keys for Giphy and Tenor are hardcoded in the code, which is a security risk.
Provider implementation differences: The implementation of each provider may differ, which could lead to inconsistencies in the user experience.
Error handling: The code may not handle errors properly, which could lead to unexpected behavior.
Security Concerns
API key exposure: As mentioned earlier, the API keys are hardcoded in the code, which is a security risk.
Potential for API abuse: The code may not have proper rate limiting or abuse prevention measures in place, which could lead to API abuse.
Best Practices and Optimizations
Use environment variables for API keys: Instead of hardcoding API keys, use environment variables to store them securely.
Implement rate limiting and abuse prevention: Add measures to prevent API abuse and rate limiting to ensure the code does not exceed API limits.
Improve error handling: Implement proper error handling to ensure the code behaves as expected in case of errors.
Consider using a more robust provider implementation: Instead of implementing providers separately, consider using a more robust implementation that can handle multiple providers.
Conclusion
The pull request adds support for multiple GIF providers, which is a significant improvement. However, there are potential issues and security concerns that need to be addressed. By following best practices and optimizing the code, we can ensure the code is maintainable, efficient, and secure.
