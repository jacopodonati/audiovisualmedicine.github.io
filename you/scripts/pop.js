/* global chrome */
console.log('popup (script) initiated')
const $ = require('jquery')
window.$ = $
const cDiv = $('<div/>', { id: 'cDiv' }).appendTo('body')
$('<button/>')
  .appendTo(cDiv)
  .text('click to send message to content script!')
  .click(() => {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
      const activeTab = tabs[0]
      chrome.tabs.sendMessage(activeTab.id, { message: 'start' })
    })
  })
$('<button/>')
  .appendTo(cDiv)
  .text('click to send message to service worker!')
  .click(() => {
    chrome.runtime.sendMessage({ greeting: 'hello from popup' })
  })
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    console.log('received message on popup!', { request, sender, sendResponse })
  }
)
