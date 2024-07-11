/* global chrome */
console.log('background service worker initiated')
const fnet = chrome.fnet = require('./fnetwork.js')

let currentTabId
let currentStep

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('received message on background!', { request, sender, sendResponse })
  if (!request.background) return
  const { command } = request
  if (command === 'login') {
    chrome.storage.sync.set({ lastScrapped: new Date().toJSON() }, () => {
      chrome.windows.create({ url: 'https://www.facebook.com/profile.php' }).then(r => {
        currentTabId = r.tabs[0].id
        currentStep = command
      })
    })
  } else if (command === 'logout') {
    chrome.storage.sync.remove(['userData', 'lastScrapped'], () => {
      console.log('yeah, logged out')
    })
  } else if (command === 'scrappeFriends') {
    chrome.storage.sync.get(['userData'], ({ userData }) => {
      const { sid, nid } = userData
      let url
      if (sid) {
        url = `https://www.facebook.com/${sid}/friends`
      } else {
        url = `https://www.facebook.com/profile.php?id=${nid}&sk=friends`
      }
      chrome.tabs.create({ url }).then(r => {
        currentTabId = r.id
        currentStep = command
      })
    })
  } else if (command === 'absorb') {
    fnet.absorb(request.structs)
  }
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (tabId !== currentTabId || changeInfo.status !== 'complete') return
  chrome.scripting.executeScript({
    target: { tabId },
    files: ['scripts/ok/content.js']
  }, () => {
    chrome.tabs.sendMessage(tabId, { command: currentStep, content: true })
  })
})
