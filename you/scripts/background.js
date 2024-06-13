/* global chrome */
console.log('background service worker initiated')
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    console.log('received message on background!', { request, sender, sendResponse })
  }
)
