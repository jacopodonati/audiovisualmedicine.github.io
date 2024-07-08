/* global chrome */
console.log('background service worker initiated')
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('received message on background!', { request, sender, sendResponse })
  if (request.message === 'forwardToServiceWorker') {
    console.log('the message was originated in popup and forwarded by the content script')
  }
})
