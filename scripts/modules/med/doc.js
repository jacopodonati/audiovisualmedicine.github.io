const $ = require('jquery')
const J = require('@eastdesire/jscolor')

const maestro = require('../maestro.js')
const utils = require('../utils.js')
const transfer = require('../transfer.js')
const waveforms = require('./common.js').waveforms
const permfuncs = require('./common.js').permfuncs

const copyToClipboard = utils.copyToClipboard
const u = require('../router.js').urlArgument
const p = v => typeof v === 'string' ? v : parseFloat(v.val())
const e = module.exports

// TODO:
// add bell on minutes before starting and before ending
// add templates to each voice
// add advanced synth to each voice, as with Tone examples
// add phase to martigli
// check 'todo' strings
// add option for AAA or MMM groups
// remove voice by destroying the voice instead of using a flag DONE?
// better management of reference/secundary Martigli voices
// //// Sun Jul 30 12:22:39 CEST 2023 ////
// reintroduce voice and sonic preview, make it as something added to Doc after,
//    a funcion or class run after Doc and not needed by Doc
// remove network stuff from doc, leave it to add separatelly as with sonic preview

function forms (grid) {
  const sel0 = $('<select/>').appendTo(grid)

  // network-related: //////////////////////////
  const selt = $('<span/>', { css: { background: '#ccddcc' } }).html('network:').appendTo(grid).hide()
  sel0.asel = $('<select/>').appendTo(grid).hide()
  const selnt = $('<span/>', { css: { background: '#ccddcc' } }).html('component size:').appendTo(grid).hide()
  sel0.aseln = $('<input/>', { placeholder: 10, title: 'number of nodes per component', value: 5 }).appendTo(grid).hide()
  function after () {
    sel0.asel.show()
    sel0.asel.initialized = true
    selt.show()
    selnt.show()
    sel0.aseln.show()
    sel0.isNetwork = true
    $('#loading').hide()
  }
  let gfun
  if (u('legacy')) { // ?doc=bana&admin=1&legacy=1
    gfun = () => { // fixme: write the sid of the network to retrieve only such network:
      transfer.fAll.ttm({ sid: { $exists: true } }, { name: 1 }, 'test').then(r => {
        r.sort((a, b) => a.name > b.name ? 1 : -1)
        r.forEach((n, i) => sel0.asel.append($('<option/>').val(i).html(n.name)))
        after()
      })
    }
  } else if (u('id')) { // &adv=1&id=marielelizabethy, FIXME: cannot make it work, don't know why
    gfun = () => {
      transfer.fAll.omark({ 'userData.id': u('id') }).then(r => {
        sel0.asel.append($('<option/>').val(0).html(`${r.userData.name} || ${r.net.nodes.length} / ${r.net.edges.length} || ${r.date.toISOString()}`))
        const order = r.net.nodes.reduce((a, i) => a + Boolean(i.attributes.scrapped), 0)
        sel0.asel.append($('<option/>').val(1).html(`${r.userData.name} || ${order} scrapped || ${r.date.toISOString()}`))
        after()
      })
    }
  } else if (u('comName')) { // ?doc=bana&u=bana&comName=mistica&ssize=8&adv=1
    gfun = () => { // todo: allow also for ordering by degree of the community
      transfer.fAll.oaeterni({ comName: u('comName') }).then(r => {
        r.network.nodes.sort((a, b) => {
          const [aa, ab] = [a.attributes, b.attributes]
          if (aa.origDegree !== ab.origDegree) return aa.origDegree - ab.origDegree
          const [ai, bi] = [aa.sid || aa.nid, ab.sid || ab.nid]
          // return ai > bi ? 1 : -1
          return ai.split('').reverse().join('') > bi.split('').reverse().join('') ? 1 : -1
        })
        const memberSets = window.memberSets = utils.chunkArray(r.network.nodes, u('ssize'))
        memberSets.forEach((s, i) => {
          const degrees = s.map(m => m.attributes.degree)
          const [maxd, mind] = [Math.max(...degrees), Math.min(...degrees)]
          sel0.asel.append($('<option/>').val(i).html(`${i} (${mind}...${maxd}) - ${r.source} / ${r.comName} || nodes: ${r.network.nodes.length}, edges: ${r.network.edges.length} || ${r.date.toISOString()}`))
        })
        window.sss = { memberSets, rrr: r }
        after()
      })
    }
  }
  // network-related: //////////////////////////
  // todo: get cases correctly for them:
  if (gfun) $('#loading').show() && gfun()
  sel0
    .append($('<option/>').val(0).html('sinusoid'))
    .append($('<option/>').val(1).html('lemniscate'))
    .append($('<option/>').val(2).html('trefoil (triquetra)'))
    .append($('<option/>').val(3).html('figure-eight (Listing\'s) knot'))
    .append($('<option/>').val(4).html('torus knot'))
    .append($('<option/>').val(5).html('cinquefoil knot'))
    .append($('<option/>').val(6).html('decorative torus knot'))
    .append($('<option/>').val(7).html('Lissajous 3-4'))
    .append($('<option/>').val(8).html('Ray'))
    .append($('<option/>').val(31).html('void'))
    // .append($('<option/>').val(32).html('net'))
    .on('change', aself => {
      const i = parseInt(aself.currentTarget.value)
      if (i === 0) {
        $('#lb_ccc').html('center circ color:')
        $('#lb_lcc').html('lateral circ color:')
      } else if (i === 1) {
        $('#lb_ccc').html('left circ color:')
        $('#lb_lcc').html('right circ color:')
      } else {
        $('#lb_ccc').html('circ 1 color:')
        $('#lb_lcc').html('circ 2 color:')
      }
      // if (i !== 32 && sel0.asel) {
      //   sel0.asel.hide()
      //   selt.hide()
      //   selnt.hide()
      //   sel0.aseln.hide()
      // }
    })
  if (u('adv')) { // network-related
    sel0
      .append($('<option/>').val(32).html('net'))
  }

  sel0.selt = selt
  sel0.selnt = selnt
  return sel0
}

function addWaveforms (grid, str, id) {
  $('<span/>').html(str + ':').appendTo(grid)
  const select = $('<select/>', { id }).appendTo(grid)
  const aw = (val, str) => select.append($('<option/>').val(val).html(str))
  for (const w in waveforms) {
    aw(w, waveforms[w])
  }
  return select
}

function addNumField (grid, str, placeholder, title, value) {
  $('<span/>').html(str + ':').appendTo(grid)
  return $('<input/>', { placeholder, title, value }).appendTo(grid)
}

function addType (grid, type, c, isOn) {
  $('<span/>').html('type:').appendTo(grid)
  const field = $('<span/>').appendTo(grid)
    .append($('<span/>').html(`<b>${type}</b>`))
    .append($('<span/>', { css: { 'margin-left': '4%', background: '#ffbbbb', cursor: 'pointer' } }).html('X').click(() => {
      console.log('remove me: ' + type)
      grid.hide()
      grid.voiceRemoved = true
      if (type.includes('Martigli')) {
        if (onOff.isOn) { // select first occuring Martigli:
          for (let i = 0; i < c.martigliList.length; i++) {
            const onOff_ = c.martigliList[i]
            if (!onOff_.isOn && !onOff_.grid.voiceRemoved) {
              onOff_.isOn = true
              onOff_.css('background', '#ffff00')
              onOff_.html('(reference)')
              break
            }
          }
          onOff.isOn = false
        }
      }
    }))
  let onOff
  if (type.includes('Martigli')) { // add signature as to reference or not
    const hasMartigli = c.martigliList.length === c.martigliList.reduce((a, i) => a + i.grid.voiceRemoved, 0)
    const isOn_ = isOn === undefined ? hasMartigli : isOn
    const str = isOn_ ? 'reference' : 'secondary'
    onOff = $('<span/>', { css: { 'margin-left': '2%' } }).html(`(${str})`)
      .click(() => {
        if (c.martigliList.length < 1) return
        if (onOff.isOn) { // select first occuring Martigli:
          for (let i = 0; i < c.martigliList.length; i++) {
            const onOff_ = c.martigliList[i]
            if (!onOff_.isOn && !onOff_.grid.voiceRemoved) {
              onOff_.isOn = true
              onOff_.css('background', '#ffff00')
              onOff_.html('(reference)')
              break
            }
          }
          onOff.isOn = false
          onOff.css('background', '')
          onOff.html('(secondary)')
        } else {
          // turn off the currently on:
          for (let i = 0; i < c.martigliList.length; i++) {
            const onOff_ = c.martigliList[i]
            if (onOff_.isOn) {
              onOff_.isOn = false
              onOff_.css('background', '')
              onOff_.html('(secondary)')
              break
            }
          }
          onOff.isOn = true
          onOff.css('background', '#ffff00')
          onOff.html('(reference)')
        }
      })
    onOff.isOn = isOn_
    onOff.grid = grid
    grid.onOff = onOff
    onOff.css('background', onOff.isOn ? '#ffff00' : '')
    field.append(onOff)
    c.martigliList.push(onOff)
  }
  c.gd(grid)
}

function addPanner (s, c) {
  if (!['Binaural', 'Martigli-Binaural'].includes(s.type)) {
    return
  }
  const grid = s.grid
  c.gd(grid)
  $('<span/>').html('panner:').appendTo(grid)
  s.panOsc = $('<select/>', { id: 'panOsc' }).appendTo(grid)
    .append($('<option/>').val(0).html('none'))
    .append($('<option/>').val(1).html('envelope (linear transition, stable sustain)'))
    .on('change', aself => {
      const i = parseInt(aself.currentTarget.value)
      if (i === 0 || i === 3) {
        fields.forEach(f => f.hide())
      } else if (i === 1) {
        fields.forEach(f => f.show())
      } else if (i === 2) {
        fields.slice(0, 2).forEach(f => f.show())
        fields.slice(2).forEach(f => f.hide())
      }
    })
  if (s.type === 'Binaural') {
    s.panOsc.append($('<option/>').val(2).html('sine'))
  } else if (s.type === 'Martigli-Binaural') { // TODO: enable with Binaural
    s.panOsc.append($('<option/>').val(2).html('sine independent of Martigli'))
    s.panOsc.append($('<option/>').val(3).html('sine in sync with Martigli'))
  }
  const panOscPeriod_ = $('<span/>').html('pan oscillation period:').appendTo(grid).hide()
  s.panOscPeriod = $('<input/>', {
    placeholder: 'in seconds'
  }).appendTo(grid).hide()
    .attr('title', 'Duration of the pan oscillation in seconds.')
    .val(120)

  const panOscTrans_ = $('<span/>').html('pan oscillation crossfade:').appendTo(grid).hide()
  s.panOscTrans = $('<input/>', {
    placeholder: 'in seconds'
  }).appendTo(grid).hide()
    .attr('title', 'Duration of the pan crossfade (half the pan oscillation period or less).')
    .val(20)
  const fields = [panOscPeriod_, s.panOscPeriod, s.panOscTrans, panOscTrans_]
  s.grid.panFields = fields
}

function adminUsers (allUsers, user) { // ?doc=samename&remove=1
  if (!user) { // no user give, get user!
    do {
      user = window.prompt('give user/lab name you have or want:', 'anonymous')
    } while (!user)
    window.location.href = `?doc=${user}`
  }

  const del = u('remove')
  if (allUsers.map(i => i.luser).includes(user) && !del) { // user is given and to load!
    return false
  } else { // user is given to create or remove!:
    const what = del ? 'remove' : 'writeAny'
    transfer[what]({ luser: user }).then(r => {
      window.alert(`User "${user}" ${del ? 'REMOVED' : 'CREATED'}!`)
      window.location.href = '?doc' + (del ? '' : `=${user}`)
    })
    return true
  }
}

e.Doc = class {
  constructor () {
    // page layout:
    window.DocClass = this
    $('<div/>', { id: 'canvasDiv' }).appendTo('body').hide()
    $('body').css('margin-top', '1%')
    this.div1 = $('<div/>', { css: { display: 'inline-block', width: '50%' } }).appendTo('body')
    this.div2 = $('<div/>', { id: 'div2', css: { display: 'inline-block', float: 'right', width: '50%' } }).appendTo('body')
    this.gd = grid => utils.gridDivider(0, 160, 0, grid)

    this.login()
  }

  login () {
    return transfer.findAll({ luser: { $exists: true } }).then(r => {
      this.allUsers = r
      window.allUsers = r
      const user = u('doc')
      if (adminUsers(this.allUsers, user)) return
      const r_ = r.filter(i => i.luser === user)[0]
      this.user = user
      this.user_ = r_.name || utils.users[user] || user
      this.getSettings().then(
        () => this.buildPage()
      )
    })
  }

  getSettings () {
    const query = {
      _id: { $gt: window.wand.utils.objectIdWithTimestamp('2021/06/05') },
      'header.med2': { $exists: true },
      'header.onlyOnce': { $exists: true }
    }
    return transfer.findAll(query).then(r => {
      // r.sort((a, b) => a.header.datetime - b.header.datetime)
      r.reverse().sort((a, b) => a.header.creator === this.user ? -1 : 1)
      this.allSettings = r
      this.userSettings = r.filter(i => i.header.creator === this.user)
      this.othersSettings = r.filter(i => i.header.creator !== this.user)
    })
  }

  buildPage () {
    this.addHeader()
    this.setVisual()
    this.addMenu()
    this.addFinalButtons()
    $('#loading').hide()
  }

  addHeader () {
    const plural = this.user_[this.user_.length - 1] === 's' ? "'" : "'s"
    $('<h2/>', { css: { 'text-align': 'center', background: '#d4d988' } })
      .html(`${this.user_}${plural} Make Medicine`).appendTo(this.div1)
    const grid = utils.mkGrid(2, this.div1, '90%', '#eeeeff', '50%')

    $('<link/>', {
      rel: 'stylesheet',
      href: 'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css'
    }).appendTo('head')
    const flatpickr = require('flatpickr')

    const s = $('<select/>', { id: 'mselect' }).appendTo(grid)
      .append($('<option/>').val(-1).html('~ creating ~'))
      .attr('title', 'Select template to load, edit, or delete.')
      .on('change', aself => {
        if (aself.currentTarget.value === '-1') return
        this.loadSetting(aself.currentTarget.value, 0)
        s.css('background', 'darkseagreen')
      })
    this.s = s

    $('<button/>').html('Delete').appendTo(grid)
      .attr('disabled', !u('admin'))
      .click(() => {
        const option = $(`option[value="${$('#mselect').val()}"].pres`)
        const ind = option[0].value
        $('#loading').show()
        transfer.remove({ 'header.med2': this.allSettings[ind].header.med2 }).then(r => {
          option.remove()
          this.allSettings.splice(ind, 1)

          // HERE 222:
          this.obutton.attr('disabled', true).html('Open')
          this.p3button.attr('disabled', true)
          this.p5button.attr('disabled', true).html('Preview (5s)')
          this.sbutton.attr('disabled', true)

          $('.pres').remove()
          this.allSettings.forEach((i, ii) => {
            let text = i.header.med2
            if (i.header.communionSchedule && !i.header.ancestral) {
              text = `(template) ${text}`
            }
            text += ` (${i.header.creator})`
            if (i.header.ancestral) {
              text += `-${i.header.ancestral}`
            }
            s.append($('<option/>', { class: 'pres' }).val(ii).html(text))
          })
          $('#loading').hide()
        })
      })
    this.resetArtifactOptions()

    $('<span/>').html('id:').appendTo(grid)
    const med2 = $('<input/>', {
      placeholder: 'id for the meditation'
    }).appendTo(grid)
      .attr('title', 'The ID for the meditation (will appear on the URL).')
      .val(utils.chooseUnique(['love', 'light', 'happiness', 'immortality', 'God', 'appreciation', 'hope', 'faith', 'peace', 'self-control', 'rejuvenation'])[0])

    $('<span/>').html('only once:').appendTo(grid)
    const onlyOnce = $('<input/>', {
      type: 'checkbox'
    }).appendTo(grid)
      .attr('title', 'if checked, will occur only once, else it will occur at all the standard times.')
      .prop('checked', false)
      .click(() => {
        adiv.prop('disabled', !onlyOnce.prop('checked'))
      })

    $('<span/>').html('when:').appendTo(grid)
    const adiv = $('<input/>', {
      placeholder: 'select date and time'
    }).appendTo(grid)
      .attr('title', 'Select a date and time for the mentalization to occur.')
      .prop('disabled', true)
    const dt = new Date()
    dt.setMinutes(dt.getMinutes() + 10)
    dt.setSeconds(0)
    dt.setMilliseconds(0)
    const datetime = flatpickr(adiv, {
      enableTime: true
    })
    datetime.setDate(dt)
    this.aadiv = adiv

    const d = addNumField(grid, 'total duration', 'in seconds (0 if forever)', 'Duration of the meditation in seconds.', 900)

    this.gd(grid)
    $('<span/>').html('volume control:').appendTo(grid)
    const vcontrol = $('<input/>', {
      type: 'checkbox'
    }).appendTo(grid)
      .attr('title', 'Enables volume control widget if checked.')
      .prop('checked', true)

    const communionSchedule = $('<input/>', {
      type: 'checkbox'
    })
      .attr('title', 'Is this artifact a template?')
    $('<span/>').html('template:').appendTo(grid)
    communionSchedule.appendTo(grid)

    this.header = { med2, datetime, d, vcontrol, communionSchedule, onlyOnce }
  }

  setVisual () {
    const grid = utils.mkGrid(2, this.div1, '90%', '#eeffee', '50%')
    const obj = {}

    // todo: flower of life, hexagram (plain and unicursal), pentagram
    // only the gem
    // todo: blink blackground for entrainment
    $('<span/>').html('shape:').appendTo(grid)
    obj.lemniscate = forms(grid)
    // in case of net:
    //   select for the available nets
    //   number of nodes per component
    //   colors for nodes, edges and names

    $('<span/>').html('rainbow flakes:').appendTo(grid)
    obj.rainbowFlakes = $('<input/>', {
      type: 'checkbox'
    }).appendTo(grid)
      .attr('title', 'The flakes are in all colors if checked.')

    this.gd(grid)

    $('<span/>').html('breathing ellipse:').appendTo(grid)
    obj.ellipse = $('<input/>', {
      type: 'checkbox'
    }).appendTo(grid)
      .attr('title', 'Breath-scaled circle is ellipsoid if checked.')
      .prop('checked', true)

    $('<span/>').html('breathing position:').appendTo(grid)
    const posPos = ['Center', 'Left', 'Right']
    const bPos = $('<button/>')
      .html('Center')
      .appendTo(grid)
      .attr('title', 'Breath-scaled circle position.')
      .click(() => {
        bPos.bindex = (bPos.bindex + 1) % posPos.length
        bPos.html(posPos[bPos.bindex])
      })
    this.posPos = posPos
    bPos.bindex = 0
    obj.bPos = bPos

    function colorItem (str, id, title, color) {
      $('<span/>', { id: 'lb_' + id }).html(str + ':').appendTo(grid)
      $('<input/>', { id }).appendTo(grid)
        .attr('title', title)
      const foo = new J('#' + id, { value: '#' + color })
      obj[id] = foo
    }
    // todo: add palette maker:
    colorItem('breathing circ color', 'bcc', 'The color of circle that expands when to inhale.', '4444FF')
    this.gd(grid)
    colorItem('backgroung color', 'bgc', 'The color of the background.', '000000')
    colorItem('foreground color', 'fgc', 'The color of main drawing (e.g. sinusoid + shaking attractive circle).', 'FFFFFF')
    colorItem('center circ color', 'ccc', 'The color of moving circle in (or most to) the middle.', '00FF00')
    colorItem('lateral circ color', 'lcc', 'The color of the moving circle in (or most to) the laterals.', 'FFFF00')

    this.visSetting = obj
  }

  addMenu () {
    const grid = utils.mkGrid(2, this.div1, '90%', '#ffeeee', '50%')
    this.martigliList = []
    this.colors = ['#eeeeff', '#eeffee', '#ffeeee']
    this.counter = 0
    this.setting = []
    $('<span/>').html('add:').appendTo(grid)
    const voiceTypes = ['Martigli', 'Binaural', 'Symmetry', 'Sample', 'Martigli-Binaural', 'Prayer', 'Recording']
    voiceTypes.forEach(i => {
      $('<button/>', { id: i + 'Btn' })
        .html(i)
        .appendTo(grid)
        .click(() => {
          this.createVoice(i)
        })
    })
    // todo: implement:
    $('#PrayerBtn').attr('disabled', true)
    $('#RecordingBtn').attr('disabled', true)
  }

  addFinalButtons () {
    const grid = utils.mkGrid(2, this.div1, '90%', '#eeeeff')
    $('<button/>')
      .attr('title', 'Create the meditation with the settings defined.')
      .html('Create')
      .click(() => {
        const removed = this.setting.reduce((a, i) => a + i.grid.voiceRemoved, 0)
        if (this.setting.length === removed && !window.confirm('Do you really want to create an artifact without any sound?')) return
        const toSave = this.mkWritableSettings(true)
        if (!toSave) return
        transfer.writeAny(toSave).then(resp => {
          const aS = this.allSettings
          aS.reverse().push(toSave)
          aS.reverse()
          // aS.sort((a, b) => a.header.datetime - b.header.datetime)
          this.removeOptions()
          this.resetArtifactOptions(toSave)
          this.prefix = toSave.header.ancestral ? '-' : '.'

          // HERE 2223
          this.obutton.attr('disabled', false).html(`Open: ${toSave.header.med2}`)
          this.p3button.attr('disabled', false)
          this.p5button.attr('disabled', false).html(`Preview (5s): ${toSave.header.med2}`)
          this.sbutton.attr('disabled', false)
        })
        // todo: enable preview and volume controler
      }).appendTo(grid)
    this.obutton = $('<button/>', { css: { background: 'lightskyblue' } })
      .html('Open')
      .attr('title', 'Open URL of the meditation.')
      .click(() => {
        window.open(`/?${this.prefix}${this.header.med2.val()}`)
      })
      .appendTo(grid)
      .attr('disabled', true)
    const bcolors = ['palegreen', 'lightblue', 0]
    this.p3button = $('<button/>', { css: { background: 'palegreen' } })
      .html('Copy artifact link')
      .attr('title', 'Copy URL of the meditation.')
      .click(() => {
        copyToClipboard(`${window.location.origin}/?${this.prefix}${this.header.med2.val()}`)
        this.p3button.css('background', bcolors[++bcolors[2] % 2])
      })
      .appendTo(grid)
      .attr('disabled', true)
    this.p5button = $('<button/>', { css: { background: 'pink' } })
      .html('Preview (5s)')
      .attr('title', 'Open URL of the meditation for preview.')
      .click(() => {
        window.open(`/?${this.prefix}${this.header.med2.val()}&t=5`)
      })
      .appendTo(grid)
      .attr('disabled', true)

    this.sbutton = $('<button/>', { css: { background: 'paleblue' } })
      .html('Copy session text')
      .attr('title', 'Copy standard texto for the meditation.')
      .appendTo(grid)
      .attr('disabled', true)
    utils.getPhrase().then(r => {
      const lw = utils.lastWords()
      this.sbutton
        .click(() => {
          const msg = `
link para o artefato: https://aeterni.github.io/?${this.prefix}${this.header.med2.val()}
horário de início: ${utils.dataFormatada(this.header.datetime.selectedDates[0])}
tema: ${utils.formatTheme(this.header.med2.val())}

${utils.chooseUnique(r, 1)[0]}

Orientações gerais: https://www.facebook.com/groups/arcturianart/permalink/880697656114381/

${lw()}.

:::`
          copyToClipboard(msg)
          window.alert(msg)
        })
    })
  }

  addMartigli (grid) {
    const mf0 = addNumField(grid, 'Martigli carrier frequency', 'in Herz', 'carrier frequency for the Martigli Oscillation.', 200)
    const waveformM = addWaveforms(grid, 'Martigli carrier waveform', 'waveformM')
    const { ma, mp0, mp1, md } = this.addMartigliCommon(grid)
    return { mf0, waveformM, ma, mp0, mp1, md }
  }

  addMartigliCommon (grid) {
    const ma = addNumField(grid, 'Martigli amplitude', 'in Herz', 'Variation amplitude, in Hz, of the frequency to guide breathing.', 20)
    this.gd(grid)
    const mp0 = addNumField(grid, 'Martigli initial period', 'period in seconds', 'Initial duration of the breathing cycle.', 10)
    const mp1 = addNumField(grid, 'Martigli final period', 'period in seconds', 'Final duration of the breathing cycle.', 20)
    const md = addNumField(grid, 'Martigli transition', 'duration in seconds', 'Duration of the transition from the initial to the final Martigli period.', 600)
    return { ma, mp0, mp1, md }
  }

  addBinaural (grid) {
    const fl = addNumField(grid, 'freq left', 'freq in Herz', 'Frequency on the left channel.', 150)
    const waveformL = addWaveforms(grid, 'waveform left', 'waveformL')
    this.gd(grid)
    const fr = addNumField(grid, 'freq right', 'freq in Herz', 'Frequency on the right channel.', 155)
    const waveformR = addWaveforms(grid, 'waveform right', 'waveformR')
    return { fl, waveformL, fr, waveformR }
  }

  addSymmetry (grid) {
    const nnotes = addNumField(grid, 'number of notes', 'any integer', 'number of different notes in the symmetric structure/voice', 3)
    const noctaves = addNumField(grid, 'number of octaves', 'any real number', 'number of octaves to spread the notes evenly (endpoint not included)', 1)
    const f0 = addNumField(grid, 'lowest frequency', 'any real number', 'frequency of the lowest note', 100)
    const d = addNumField(grid, 'cycle duration', 'any real number', 'duration of the iteration on all notes before repetition', 1)
    const waveform = addWaveforms(grid, 'waveform', 'waveformS')
    $('<span/>').html('permutation:').appendTo(grid)
    const permfunc = $('<select/>').appendTo(grid)
    const aw = (val, str) => permfunc.append($('<option/>').val(val).html(str))
    for (const w in permfuncs) {
      aw(w, permfuncs[w])
    }
    return { nnotes, noctaves, f0, d, waveform, permfunc }
  }

  addSample (grid) {
    $('<span/>').html('sound sample:').appendTo(grid)
    const soundSample = $('<select/>', { id: 'soundSample' }).appendTo(grid)
      .attr('title', 'Sound sample to be played continuously.')
    maestro.sounds.forEach((s, ii) => {
      soundSample.append($('<option/>').val(ii).html(`${s.name}, ${s.duration}s`))
    })

    // const soundSampleVolume = addNumField(grid, 'sample volume', 'in decibels', 'relative volume of the sound sample.', -6)
    const soundSamplePeriod = addNumField(grid, 'sample repetition period', 'in seconds', 'period between repetitions of the sound.', maestro.sounds[0].duration)
    const soundSampleStart = addNumField(grid, 'sample starting time', 'in seconds', 'time for the first incidence of the sound', 0)

    // return { soundSample, soundSampleVolume, soundSamplePeriod, soundSampleStart }
    return { soundSample, soundSamplePeriod, soundSampleStart }
  }

  addMartigliBinaural (grid) {
    const { fl, waveformL, fr, waveformR } = this.addBinaural(grid)
    this.gd(grid)
    const { ma, mp0, mp1, md } = this.addMartigliCommon(grid)
    return { fl, waveformL, fr, waveformR, grid, ma, mp0, mp1, md }
  }

  loadSetting (index, what) {
    const s = this[['allSettings', 'allSettings1', 'allSettings2'][what]][index] // check why these 3

    const h = this.header
    const h_ = s.header
    h.med2.val(h_.med2)
    h.datetime.setDate(h_.datetime)
    h.d.val(h_.d)
    h.vcontrol.prop('checked', h_.vcontrol)
    h.onlyOnce.prop('checked', h_.onlyOnce === undefined ? true : h_.onlyOnce)
    this.aadiv.prop('disabled', !h.onlyOnce.prop('checked'))
    h.communionSchedule.prop('checked', h_.communionSchedule)

    const v = this.visSetting
    const v_ = s.visSetting
    v.lemniscate.val(Number(v_.lemniscate))
    const isNet = v_.isNetwork
    function after () {
      v.lemniscate.asel.show()
      v.lemniscate.asel.initialized = true
      // dealNet()
      $('#loading').hide()
    }
    let gfun = () => {
      transfer.fAll.ttm({ sid: { $exists: true } }, { name: 1 }, 'test').then(r => {
        r.sort((a, b) => a.name > b.name ? 1 : -1)
        r.forEach((n, i) => v.lemniscate.asel.append($('<option/>').val(i).html(n.name)))
        after()
      })
    }
    if (u('id')) {
      gfun = () => {
        transfer.fAll.omark({ 'userData.id': u('id') }).then(r => {
          v.lemniscate.asel.append($('<option/>').val(0).html(`${r.userData.name} || ${r.net.nodes.length} / ${r.net.edges.length} || ${r.date.toISOString()}`))
          const order = r.net.nodes.reduce((a, i) => a + Boolean(i.attributes.scrapped), 0)
          v.lemniscate.asel.append($('<option/>').val(1).html(`${r.userData.name} || ${order} scrapped || ${r.date.toISOString()}`))
          after()
        })
      }
    } else if (u('comName')) {
      gfun = () => {
        transfer.fAll.oaeterni({ comName: u('comName') }).then(r => {
          r.network.nodes.sort((a, b) => {
            const [aa, ab] = [a.attributes, b.attributes]
            if (aa.origDegree !== ab.origDegree) return aa.origDegree - ab.origDegree
            const [ai, bi] = [aa.sid || aa.nid, ab.sid || ab.nid]
            // return ai > bi ? 1 : -1
            return ai.split('').reverse().join('') > bi.split('').reverse().join('') ? 1 : -1
          })
          const memberSets = window.memberSets = utils.chunkArray(r.network.nodes, u('ssize'))
          memberSets.forEach((s, i) => {
            const degrees = s.map(m => m.attributes.degree)
            const [maxd, mind] = [Math.max(...degrees), Math.min(...degrees)]
            v.lemniscate.asel.append($('<option/>').val(i).html(`${i} (${mind}...${maxd}) - ${r.source} / ${r.comName} || nodes: ${r.network.nodes.length}, edges: ${r.network.edges.length} || ${r.date.toISOString()}`))
          })
          after()
        })
      }
    }
    if (isNet) {
      if (!v.lemniscate.asel.initialized) {
        $('#loading').show()
        gfun()
      }
      // } else {
      //   dealNet()
      // }
    }
    // } else {
    //   dealNet()
    // }
    v.rainbowFlakes.prop('checked', v_.rainbowFlakes)
    v.ellipse.prop('checked', v_.ellipse)
    v.bPos.bindex = v_.bPos || 0
    v.bPos.html(this.posPos[v_.bPos])
    const colors = ['bcc', 'bgc', 'fgc', 'ccc', 'lcc']
    colors.forEach(i => { v[i].fromString(v_[i]) })

    // clearing voices:
    this.setting.forEach(s => {
      s.grid.hide()
      s.grid.voiceRemoved = true
    })
    // loading voices in the settings:
    const l = s.voices
    l.forEach(i => {
      const set = this.createVoice(i.type, i.isOn)
      set.iniVolume = i.iniVolume
      console.log('iii', i)
      for (const j in i) {
        if (typeof i[j] !== 'string' && j !== 'isOn') {
          console.log(j, i[j])
          if (j !== 'iniVolume') set[j].val(i[j])
        }
        if (j === 'panOsc') {
          const ii = i[j]
          if (ii === 0 || ii === 3) {
            set.grid.panFields.forEach(f => f.hide())
          } else if (ii === 1) {
            set.grid.panFields.forEach(f => f.show())
          } else if (ii === 2) {
            set.grid.panFields.slice(0, 2).forEach(f => f.show())
            set.grid.panFields.slice(2).forEach(f => f.hide())
          }
        }
      }
    })
    this.prefix = h_.ancestral ? '-' : '.'
    this.obutton.attr('disabled', false).html(`Open: ${h_.med2}`)
    this.p3button.attr('disabled', false)
    this.p5button.attr('disabled', false).html(`Preview (5s): ${h_.med2}`)
    this.sbutton.attr('disabled', false)
  }

  checkVoice (v) {
    if (v.type === 'Martigli') {
      if (v.ma > v.mf0) {
        if (!window.confirm('Martigli amplitude is greater than carrier frequency. Are you shure?')) return
      }
      if (v.ma / v.mf0 < 0.05) {
        if (!window.confirm('Martigli amplitude less than 5% of the carrier frequency. Are you shure?')) return
      }
    } else if (v.type === 'Binaural') {
      if (!this.checkBinaural(v)) return
    } else if (v.type === 'Sample') {
      if (v.soundSamplePeriod !== 0 && v.soundSamplePeriod < maestro.sounds[v.soundSample].duration) {
        // todo: test if sampler can overlap playback (if so, remove the following line:)
        window.alert('define a repetition period which is greater than the samples\' duration or 0 (for looping).')
        return
      }
    } else if (v.type === 'Martigli-Binaural') {
      if (v.ma > Math.min(v.fl, v.fr)) {
        if (!window.confirm('Martigli amplitude is greater than binaural frequencies in the Martigli-Binaural voice. Are you shure?')) return
      }
      if (!this.checkBinaural(v)) return
    } else if (v.type === 'Symmetry') {
      if (v.d / v.nnotes < 0.015) {
        if (!window.confirm('The notes in the Symmetry voice have less than 15ms. Are you shure?')) return
      }
    }
    return true
  }

  checkBinaural (v) {
    if (Math.min(v.fl, v.fr) < 20 || Math.max(v.fl, v.fr) > 20000) {
      if (!window.confirm('Binaural frequencies are not in audible range ([20, 20000]). Are you shure?')) return
    }
    return true
  }

  checkHeader (h) {
    if (h.med2 === '') {
      window.alert('define the meditation id.')
      return
    }
    const tas = this.allSettings
    const condition = (h_, id) => id === h_.med2 && !h_.ancestral
    for (let i = 0; i < tas.length; i++) {
      if (condition(tas[i].header, h.med2)) {
        window.alert('change the meditation id to be unique.')
        return
      }
    }
    if (h.onlyOnce && (h.datetime === undefined || h.datetime < new Date())) {
      if (!window.confirm('the date has passed. Are you shure?')) return
    }
    if (h.d < 30) {
      if (!window.confirm('the artifact has less than 30 seconds. Are you shure?')) return
    }
    return true
  }

  createVoice (type, isOn) {
    const grid = utils.mkGrid(2, this.div2, '90%', this.colors[this.counter++ % 3], '50%')
    addType(grid, type, this, isOn)
    const set = this['add' + type.replace('-', '')](grid)
    set.type = type
    set.grid = grid
    addPanner(set, this)
    this.setting.push(set)
    return set
  }

  resetArtifactOptions (toSave) {
    const aS = this.allSettings
    const s = this.s
    aS.forEach((i, ii) => {
      let text = i.header.med2
      if (i.header.creator) {
        let name = i.header.creator
        if (i.header.ancestral) {
          name += ` -> ${i.header.ancestral}`
        }
        text += ` (${name})`
      }
      if (i.header.communionSchedule && !i.header.ancestral) {
        text = `(template) ${text}`
      }
      s.append($('<option/>', { class: 'pres' }).val(ii).html(text))
    })
    if (toSave) {
      aS.forEach((i, ii) => {
        if (i.header.med2 === toSave.header.med2) {
          s.val(ii)
        }
      })
    }
  }

  getName (luser) {
    return this.allUsers.filter(ii => ii.luser === luser)[0].name || utils.users[luser]
  }

  mkWritableSettings (write = false) {
    const voices = []
    let ok = true
    this.setting.forEach((i, count) => {
      if (i.grid.voiceRemoved) return
      const voice = {}
      for (const ii in i) {
        if (ii === 'grid' || ii === 'iniVolume') continue
        console.log(i, ii)
        console.log(i[ii])
        const v = p(i[ii])
        if (ii !== 'type' && isNaN(v)) {
          window.alert(`Define the value for <b>${ii}</b> in the voice with type <b>${i.type}</b>.`)
          return
        }
        voice[ii] = v
      }
      if (voice.type.includes('Martigli')) {
        voice.isOn = i.grid.onOff.isOn
      }
      if (write && !this.checkVoice(voice)) {
        ok = false
        return
      }
      // get volume using count
      voice.iniVolume = i.iniVolume
      voices.push(voice)
    })
    if (!ok) return
    const h = this.header
    if (write && h.communionSchedule.prop('checked') && !window.confirm('You are creating a Template to be used in mkLight, confirm?')) return
    const header = {
      med2: h.med2.val(),
      onlyOnce: h.onlyOnce.prop('checked'),
      d: p(h.d),
      vcontrol: h.vcontrol.prop('checked'),
      creator: this.user,
      communionSchedule: h.communionSchedule.prop('checked')
    }
    if (header.onlyOnce) header.datetime = h.datetime.selectedDates[0]

    if (write && !this.checkHeader(header)) return
    const v = this.visSetting
    const visSetting = {
      lemniscate: p(v.lemniscate),
      rainbowFlakes: v.rainbowFlakes.prop('checked'),
      ellipse: v.ellipse.prop('checked'),
      bPos: v.bPos.bindex
    }
    if (v.lemniscate.isNetwork) {
      visSetting.isNetwork = true
      visSetting.network = p(v.lemniscate.asel)
      visSetting.componentSize = p(v.lemniscate.aseln)
      if (u('id')) visSetting.uid = u('id')
      else if (u('comName')) {
        visSetting.comName = u('comName')
        visSetting.ssize = u('ssize')
      }
    }
    const colors = ['bcc', 'bgc', 'fgc', 'ccc', 'lcc']
    colors.forEach(i => { visSetting[i] = v[i].toString() })
    const toSave = {
      header,
      visSetting,
      voices
    }
    console.log(toSave)
    return toSave
  }

  criteria (header) { // not used in code, just to keep track of the criteria
    if (header.communionSchedule) {
      if (header.ancestral) {
        return 'mkLight artifact'
      } else {
        return 'template'
      }
    } else { // just an artifact made in mkMed2 and not a template
      return 'mkMed2 non-template artifact'
    }
  }

  removeOptions () {
    const selectElement = document.getElementById('mselect')
    for (let i = selectElement.options.length - 1; i >= 0; i--) {
      selectElement.remove(i)
    }
  }
}
