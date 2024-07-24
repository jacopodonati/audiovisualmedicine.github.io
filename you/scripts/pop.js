/* global chrome */
console.log('popup (script) initiated')
const $ = window.$ = require('jquery')
const fAll = require('../../scripts/modules/transfer.js').fAll
const { stdDiv, mkGrid, gridDivider, chooseUnique } = require('../../scripts/modules/utils.js')

let cDiv
window.unused = { mkGrid, gridDivider, chooseUnique }

function mkDate (adate) {
  if (!adate) return '--'
  return new Date(adate).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'
  }).replace(/ /, '/').replace(/ /, '/')
}

const mkRadio = id => {
  $('<input/>', { value: id, id, type: 'radio', name: 'oradio' }).appendTo(
    $('<label/>', { for: id }).html(id).appendTo(cDiv)
  )
  stdDiv('80%').attr('class', 'info').attr('id', 'd' + id).hide().html(id)
    .css('background-color', '#ddd')
}

function addRow (name, dict, grid, attr) {
  attr = attr || name
  $('<span/>').html(name + ':').appendTo(grid)
  $('<span/>').html(dict[attr] || '--').appendTo(grid)
}

const build = () => {
  cDiv = $('<div/>').appendTo('body')
  mkRadio('Facebook')
  mkRadio('WhatsApp')
  mkRadio('Telegram')
  $('input[type=radio][name=oradio]').on('change', function () {
    const option = $(this).val()
    console.log(option)
    $('.info').hide()
    $('#d' + option).show()
  })
  setFacebook()
}

function setFacebook () {
  const grid = mkGrid(2, '#dFacebook', '100%', '#fff')
    .css('margin-bottom', '1em')
    .css('width', '')
  function add (name, dict, attr) {
    addRow(name, dict, grid, attr)
  }
  chrome.storage.sync.get(
    ['userData', 'nfriends', 'nfriendships', 'nscrapped', 'metaData', 'lastScrapped', 'sround'],
    ({ userData, nfriends, nfriendships, nscrapped, metaData, lastScrapped, sround }) => {
      console.log({ userData, nfriends, metaData, lastScrapped, sround })
      userData = userData || {}
      add('name', userData)
      if (userData.codename) add('codename', userData)
      add('id', userData)
      gridDivider(160, 160, 160, grid, 1)
      metaData = metaData || {}
      $('<span/>').html('friends:').appendTo(grid)
      $('<span/>').html(nfriends).appendTo(grid)
      $('<span/>').html('friendships:').appendTo(grid)
      $('<span/>').html(nfriendships).appendTo(grid)
      $('<span/>').html('scrapped:').appendTo(grid)
      $('<span/>').html(nscrapped).appendTo(grid)
      gridDivider(160, 160, 160, grid, 1)
      $('<span/>').html('previous scrappe:').appendTo(grid)
      $('<span/>').html(mkDate(lastScrapped)).appendTo(grid)
      $('<span/>').html('round:').appendTo(grid)
      $('<span/>').html(sround || '--').appendTo(grid)
      const command = userData.id ? 'logout' : 'login'
      $('<button/>', {
        css: {
          width: '75%',
          background: '#efe'
        }
      })
        .appendTo('#dFacebook')
        .text(command)
        .click(() => {
          if (command === 'logout') {
            chrome.storage.sync.remove(['userData', 'lastScrapped', 'nfriends', 'nfriendships', 'nscrapped'], () => {
              console.log('yeah, logged out')
              setTimeout(() => window.close(), 1000)
            })
          } else {
            chrome.runtime.sendMessage({
              command,
              background: true
            })
          }
        })

      const disabled = command === 'login'
      $('<button/>', {
        disabled,
        css: {
          width: '75%',
          background: 'lightred'
        }
      })
        .appendTo('#dFacebook')
        .text('Get friends')
        .click(() => {
          chrome.runtime.sendMessage({
            command: 'scrappeFriends',
            background: true
          })
        })
      $('<button/>', {
        disabled,
        css: {
          width: '75%',
          background: 'lightred'
        }
      })
        .appendTo('#dFacebook')
        .text('Get friendships')
        .click(() => {
          chrome.runtime.sendMessage({
            command: 'scrappeFriendships',
            background: true
          })
        })
      $('<button/>', {
        disabled,
        css: {
          width: '75%',
          background: 'lightyellow'
        }
      })
        .appendTo('#dFacebook')
        .text('See yourself')
        .click(() => {
          chrome.runtime.sendMessage({
            command: 'seeNetwork',
            background: true
          })
        })
    }
  )
}

const start = () => {
  $('#Facebook').click()
}

$(document).ready(() => {
  build()
  start()

  $('<button/>')
    .appendTo(cDiv)
    .text('click to send message to content script!')
    .click(() => {
      chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        const activeTab = tabs[0]
        console.log({ activeTab })
        chrome.tabs.sendMessage(activeTab.id, { message: 'getMeContentScript' })
      })
    }).hide()
  $('<button/>')
    .appendTo(cDiv)
    .text('click to send message to service worker!')
    .click(() => {
      chrome.runtime.sendMessage({ message: 'forwardToServiceWorker' })
    }).hide()
  chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
      console.log('received message on popup!', { request, sender, sendResponse })
    }
  )
})

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (!request.popup) return
  const { command } = request
  if (command === 'writeNet') {
    chrome.storage.sync.get(
      ['userData'],
      ({ userData }) => {
        fAll.df4b({ 'userData.id': userData.id }).then(() => {
          userData.net = request.net
          fAll.wf4b({ userData }).then(() => {
            console.log('net written')
            chrome.tabs.create({ url: `http://audiovisualmedicine.github.io?you&fid=${userData.id}&deg=true` })
          })
        })
      }
    )
  }
})
