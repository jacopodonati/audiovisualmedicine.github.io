/* global chrome */
console.log('content script initiated')
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.message === 'start') {
      console.log('received start in content script, now sending a message to service worker!')
      chrome.runtime.sendMessage({ greeting: 'hello from content script' })
    }
  }
)
