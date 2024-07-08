/* global chrome */
console.log('popup (script) initiated')
const $ = window.$ = require('jquery')

$(document).ready(() => {
  const cDiv = $('<div/>', { id: 'cDiv' }).appendTo('body')
  $('<button/>')
    .appendTo(cDiv)
    .text('click to send message to content script!')
    .click(() => {
      chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        const activeTab = tabs[0]
        console.log({ activeTab })
        chrome.tabs.sendMessage(activeTab.id, { message: 'getMeContentScript' })
      })
    })
  $('<button/>')
    .appendTo(cDiv)
    .text('click to send message to service worker!')
    .click(() => {
      chrome.runtime.sendMessage({ message: 'forwardToServiceWorker' })
    })
  chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
      console.log('received message on popup!', { request, sender, sendResponse })
    }
  )
})
