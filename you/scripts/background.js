/* global chrome */
console.log('background service worker initiated')
const fnet = chrome.fnet = require('./fnetwork.js')

let currentTabId
let currentStep
// let visitCount

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
  } else if (command === 'scrappeFriendships') {
    const url = fnet.getNextURL()
    console.log({ url })
    chrome.tabs.create({ url }).then(r => {
      currentTabId = r.id
      currentStep = command
    })
    // visitCount = 1
  } else if (command === 'seeNetwork') {
    // write net to database (send to content or popup to do so)
    // then open tab with url
    chrome.runtime.sendMessage({
      command: 'writeNet',
      net: fnet.graph.toJSON(),
      popup: true
    })
  } else if (command === 'absorb') {
    const { structs } = request
    console.log('absorb', { structs })
    fnet.absorb(structs)
    chrome.storage.sync.set({
      nfriends: fnet.graph.order,
      nfriendships: fnet.graph.size,
      nscrapped: fnet.nScrapped()
    }, () => {
      console.log('friends(ships) absorbed in network, and their number written to storage:', { structs })
      // if (fnet.graph.size) { // was getting friendship
      //   if (visitCount === 10) {
      //     visitCount = undefined
      //   } else {
      //     const url = fnet.getNextURL()
      //     chrome.tabs.create({ url }).then(r => {
      //       currentTabId = r.id
      //       currentStep = command
      //     })
      //     visitCount++
      //   }
      // }
    })
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
