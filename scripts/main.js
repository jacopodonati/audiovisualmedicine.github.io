/* global wand */
// to facilitate debug in mobile:
// window.onerror = function (msg, url, lineNo, columnNo, error) {
//   const string = msg.toLowerCase()
//   const substring = 'script error'
//   if (string.indexOf(substring) > -1) {
//     window.alert('Script Error: See Browser Console for Detail')
//   } else {
//     const message = [
//       'Message: ' + msg,
//       'URL: ' + url,
//       'Line: ' + lineNo,
//       'Column: ' + columnNo,
//       'Error object: ' + JSON.stringify(error)
//     ].join(' - ')
//     window.alert('SEND THIS ERROR MESSAGE TO ADMINS:', message)
//   }
// }
window.wand = {
  router: require('./modules/router.js'),
  net: require('./modules/net.js'),
  maestro: require('./modules/maestro.js'),
  transfer: require('./modules/transfer.js'),
  med: require('./modules/med'),
  conductor: require('./modules/conductor'),
  monk: require('./modules/monk'),
  utils: require('./modules/utils.js'),
  test: require('./modules/test.js'),
  $: require('jquery'),
  bcrypt: require('bcryptjs'),
  unloadFuncs: [],
  userFuncs: []
}

// cleaning facebook auto added argument (aesthetics, cleaning for users):
window.history.pushState('', '', window.location.search.split('&fbclid=')[0])

const uargs = wand.router.urlAllArguments()

// page is first arg key without value
// meditation is the same, but starts with _ (version 1)
// or @ or . (version 2),
// ~ or - (version 2 through mkLight)
// sync is specified with <sync id>=<participant ref>
// else just welcome page

let found = false
wand.$('<div/>', { id: 'canvasDiv' }).appendTo('body')
if (uargs.keys[0] === 'doc') {
  wand.utils.checkLogged()
  const userRef = uargs.values[0]
  console.log(`lab/user with id: ${userRef}`)
  wand.currentMed = new wand.med.Doc()
  found = true
} else if (uargs.values[0] === '') {
  const k = uargs.keys[0]
  found = true
  if (k[0] === '_') { // meditation model 1:
    wand.utils.checkLogged()
    wand.currentMed = wand.med.model(k.slice(1))
    wand.utils.confirmExit()
  } else if ('~-@.'.includes(k[0])) { // meditation model 2 or 3
    wand.utils.checkLogged()
    const query = { 'header.med2': k.slice(1) }
    if ('~-'.includes(k[0])) query['header.ancestral'] = { $exists: true } // created by mkLight. todo: remove '~' ?
    else if (k[0] !== '@') {
      query['header.onlyOnce'] = { $exists: true }
      query._id = { $gt: wand.utils.objectIdWithTimestamp('2021/06/05') }
    }
    wand.transfer[k[0] === '@' ? 'findAll' : 'findAny'](query).then(r => {
      wand.currentSet = r
      // use r.lemniscate to decide model2 or 3
      // if (r.visSetting.lemniscate > 30) wand.currentMed = new wand.med.Model3(r, Boolean(r.header.ancestral))
      // else wand.currentMed = new wand.med.Model2(r, Boolean(r.header.ancestral))
      if (wand.utils.mobileAndTabletCheck()) window.alert('Stai usando un dispositivo mobile. Per un\'esperienza ottimale, consigliamo l\'uso di cuffie.\n\nYou are using a mobile device. For an optimal experience, we recommend using headphones.')
      wand.currentMed = new wand.med.Model2(r)
      wand.utils.confirmExit()
    })
  } else if (k in wand.test) { // standard page:
    wand.showLoginDiv = true
    wand.test[k]() // if k[0] === '-': k is an article
  } else {
    found = false
  }
} else if (uargs.values.length !== 0) { // sync:
  found = true
  const syncId = uargs.keys[0]
  const userRef = uargs.values[0]
  console.log(`sync with id: ${syncId}, user: ${userRef}`)
  wand.transfer.fAll.of4b({ syncId }).then(r => {
    console.log('data', r)
    wand.currentSync = new wand.conductor.Sync(r, userRef)
  })
}
if (!found) { // includes empty/no URL parameters:
  wand.showLoginDiv = true
  if (uargs.keys.length === 0) {
    wand.test.welcome()
  } else {
    window.open(window.location.origin, '_self')
  }
}

if (uargs.keys.includes('stay')) wand.utils.confirmExit()

window.onbeforeunload = e => wand.unloadFuncs.forEach(f => f(e))

wand.router.mkFooter()
