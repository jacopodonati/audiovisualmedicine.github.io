/* global chrome */
console.log('content script initiated')
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'getMeContentScript') {
    console.log('received "start" in content script')
  }
})
