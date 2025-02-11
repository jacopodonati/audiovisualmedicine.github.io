/* global wand */
const e = module.exports
const $ = require('jquery')
const monk = require('./monk')

let count = 0
e.mkGrid = (cols, el, w, bgc, tcol) => {
  console.log({ cols, el, w, bgc, tcol })
  return $('<div/>', {
    class: 'mgrid',
    id: `mgrid-${count++}`,
    css: {
      display: 'grid',
      // 'grid-template-columns': Array(cols).fill('auto').join(' '),
      'grid-template-columns': Array(cols).fill(tcol || 'auto').join(' '),
      'background-color': bgc || '#21F693',
      padding: '8px',
      margin: '0 auto',
      // height: Math.floor(wand.artist.use.height * 0.065) + 'px',
      width: w || '30%',
      'border-radius': '2%'
    }
  }).appendTo(el || 'body')
}

e.gridDivider = (r, g, b, grid, sec, after, count) => {
  const fun = after ? 'insertAfter' : 'appendTo'
  count = count || 2
  for (let i = 0; i < count; i++) {
    $('<div/>', { css: { 'background-color': `rgba(${r},${g},${b},1)`, color: 'rgba(0,0,0,0)', height: '3px' } }).text('--')[fun](grid)
  }
  // if (!after) {
  //   $('<div/>', { css: { 'background-color': `rgba(${r},${g},${b},1)`, color: 'rgba(0,0,0,0)', height: '3px' } }).appendTo(grid).text('--')
  //   return $('<div/>', { css: { 'background-color': `rgba(${r},${g},${b},${d(sec, 0)})`, color: 'rgba(0,0,0,0)', height: '3px' } }).appendTo(grid).text('--')
  // } else {
  //   $('<div/>', { css: { 'background-color': `rgba(${r},${g},${b},1)`, color: 'rgba(0,0,0,0)', height: '3px' } }).insertAfter(after).text('--')
  //   return $('<div/>', { css: { 'background-color': `rgba(${r},${g},${b},${d(sec, 0)})`, color: 'rgba(0,0,0,0)', height: '3px' } }).insertAfter(after).text('--')
  // }
}

e.stdDiv = () => e.centerDiv(undefined, undefined, e.chooseUnique(['#BDDFE3'], 1)[0], 3, 2)

e.centerDiv = (width, container, color, margin, padding) => {
  return $('<div/>', {
    css: {
      'background-color': color || '#c2F6c3',
      // margin: `0px auto ${d(margin, 0)}%`,
      margin: `0px auto ${d(margin, 0)}%`,
      padding: `${d(padding, 1)}%`,
      width: d(width, '50%'),
      'border-radius': '3rem'
    }
  }).appendTo(container || 'body')
}

e.chooseUnique = (marray, nelements) => {
  nelements = nelements || 1
  let i = marray.length
  marray = [...marray]
  if (i === 0) { return false }
  let c = 0
  const choice = []
  while (i) {
    const j = Math.floor(Math.random() * i)
    const tempi = marray[--i]
    const tempj = marray[j]
    choice.push(tempj)
    marray[i] = tempj
    marray[j] = tempi
    c++
    if (c === nelements) { return choice }
  }
  console.log({ choice })
  return choice
}

e.chunkArray = (array, chunkSize) => {
  const results = []
  array = array.slice()
  while (array.length) {
    results.push(array.splice(0, chunkSize))
  }
  return results
}

e.vocalize = (oracao, adiv) => {
  const maestro = window.wand.maestro
  $('<button/>').html('rezar').click(() => {
    maestro.speaker.synth.cancel()
    maestro.speaker.play(oracao, 'pt')
  }).appendTo(adiv)
  $('<button/>', { css: { margin: '1%' } }).html('parar').click(() => {
    if (ut) ut.onend = undefined
    maestro.speaker.synth.cancel()
    check.prop('checked', false)
  }).appendTo(adiv)
  adiv.append('loop: ')
  let ut
  const check = $('<input/>', {
    type: 'checkbox'
  }).appendTo(adiv).change(function () {
    if (this.checked) {
      maestro.speaker.synth.cancel()
      ut = maestro.speaker.play(oracao, 'pt', true)
    } else {
      ut.onend = undefined
      maestro.speaker.synth.cancel()
    }
  })
}

e.inplaceShuffle = (array, inplace = true) => {
  if (!inplace) {
    array = array.slice()
  }
  // Fisher-Yates algorithm
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
  return array
}

e.rotateArray = (array, forward = true) => {
  if (forward) {
    array.unshift(array.pop())
  } else {
    array.push(array.shift())
  }
}

e.permutations = {
  shuffle: e.inplaceShuffle,
  rotateForward: e.rotateArray,
  rotateBackward: a => e.rotateArray(a, false),
  reverse: a => a.reverse(),
  none: a => a
}

const groups = `<a href="https://www.facebook.com/groups/arcturianart" target="_blank">AAA</a>,
<a href="https://www.facebook.com/groups/mentaliz" target="_blank">MMM</a>,
<a href="https://chat.whatsapp.com/BztLyvWDEgW3C1mjXZTTrP" target="_blank">WM</a>`

e.stdMsg2 = () => {
  if (window.wand.country === 'BR') {
    return `
    <h2>Envolva-se com AA</h2>
    <ul>
        <li><strong>Compartilhe suas experiências:</strong> Reflita sobre como sua participação tem beneficiado você e incentive outros a fazer o mesmo.</li>
        <li><strong>Crie e compartilhe conteúdo multimídia:</strong> Produza artefatos audiovisuais e distribua-os para enriquecer as ofertas do projeto e aumentar a conscientização.</li>
        <li><strong>Expanda sua rede:</strong> Entre em contato com potenciais parceiros, colaboradores e indivíduos com interesses semelhantes para fortalecer conexões e ampliar a comunidade.</li>
        <li><strong>Promova o engajamento:</strong> Incentive a participação ativa e o envolvimento em grupos existentes (${groups}) ou considere formar novos.</li>
        <li><strong>Apóie iniciativas:</strong> Ofereça assistência, seja por meio de contribuições financeiras ou outros tipos de apoio, para promover os objetivos e iniciativas do projeto.</li>
        <li><strong>Mantenha-se conectado e forneça feedback:</strong> Mantenha linhas de comunicação abertas, forneça feedback construtivo e ofereça sugestões para aprimorar a eficácia do projeto.</li>
    </ul>
    <p>Lembre-se, até o menor esforço pode fazer uma grande diferença.</p>
    `
  }
  return `
  <h2>Get Involved with AA</h2>
  <ul>
      <li><strong>Share your experiences:</strong> Reflect on how your participation has benefited you and encourage others to do the same.</li>
      <li><strong>Create and share multimedia content:</strong> Make audiovisual artifacts and distribute them to enrich the project's offerings and raise awareness.</li>
      <li><strong>Expand your network:</strong> Reach out to potential partners, collaborators, and like-minded individuals to strengthen connections and grow the community.</li>
      <li><strong>Promote engagement:</strong> Encourage active participation and involvement in existing groups (${groups}) or consider forming new ones.</li>
      <li><strong>Support initiatives:</strong> Offer assistance, whether through financial contributions or other forms of support.</li>
      <li><strong>Stay connected and provide feedback:</strong> Maintain open lines of communication, provide constructive feedback, and offer suggestions for enhancing the project's effectiveness.</li>
  </ul>
  <p>Remember, even the smallest effort can make a big difference.</p>
  `
}

e.stdMsg = () => {
  if (window.location.hostname === 'aeterni.github.io') {
    return e.stdMsg2()
  }
  if (window.wand.country === 'BR') {
    return `

<h2>Fortaleça o seu Corpo de Luz</h2>

algumas ideias:

<ul>
<li>escreva relatando como tem sido as sessões para você: elas tem te ajudado? De que forma?</li>
<li>Incentive outros membros a escreverem relatos das experiências deles.</li>
<li>Traga pessoas para vibrarem no Corpo de Luz.</li>
<li>Ajude a manter/gerir um dos grupos existentes (e.g. ${groups}).</li>
<li>Crie um novo grupo.</li>
<li>Crie Artefatos Audiovisuais para serem usados nas sessões.</li>
<li>Aproxime uma pessoa ou entidade que possa ter interesse especial na iniciativa.</li>
<li>Gere mídia sobre o Corpo de Luz (postagens, artigos jornalísticos...).</li>
<li>Divulgue sobre o grupo ou trabalho.</li>
<li>Doe ou ajude a arrecadar financeiramente (transfira para a chave PIX <b>luz</b> ou verifique <a href="?angel" target="_blank">as alternativas</a>).</li>
<li>Ore para o Corpo de Luz e para o mundo.</li>
<li>Cuide-se muito bem.</li>
<li>Sugira mudanças sobre como conduzir o Corpo de Luz.</li>
</ul>

Faça contato!<br>
Luz e Paz ~
`
  }
  return `
  <div id="main-content" class="wiki-content group">
  <h1 id="Contact-nuova-Getintouch">Contattaci</h1>
  <p>Sono molti i modi nei quali ci puoi aiutare:</p>
  <ul>
    <li>
      <p><strong>Condividi le tue idee e fai domande:</strong> ci piacerebbe sapere quali parti di HarmoniCare secondo te funzionano meglio e cosa dovremmo migliorare.</p>
    </li>
    <li>
      <p><strong>Condividi le tue sequenze:</strong> offriamo alcune sequenze per mostrare il funzionamento di HarmoniCare, ma il potenziale è immenso. Se hai realizzato una sequenza che vuoi condividere con noi, scrivici e la renderemo disponibile a tutti.</p>
    </li>
    <li>
      <p><strong>Usalo in gruppo:</strong> HarmoniCare funziona molto bene in solitaria, ma ancora di più quando lo si utilizza in gruppo. Provalo durante una sessione di yoga o di meditazione di gruppo, oppure durante lo studio.</p>
    </li>
    <li>
      <p><strong>Diffondilo:</strong> invialo a qualcuno o a un gruppo di persone che pensi potrebbero trarre beneficio da una sessione di HarmoniCare. Condividilo online tra amici e colleghi!</p>
    </li>
    <li>
      <p><strong>Finanzialo:</strong> siamo sempre alla ricerca di sponsor, quindi scrivici se sei interessato a dare un contributo economico o se puoi metterci in contatto con una organizzazione in grado di farlo.</p>
    </li>
  </ul>
</div>
`
}

e.mkModal = content => {
  $('<div/>', {
    id: 'myModal',
    class: 'modal',
    role: 'dialog',
    css: {
      'overflow-y': 'initial !important'
    },
    show: {
      effect: 'fade',
      duration: 2000
    },
    hide: {
      effect: 'fade',
      duration: 2000
    }
  }).appendTo('body')
    .append($('<div/>', {
      class: 'modal-content',
      id: 'feedbackModalContent',
      css: {
        background: e.chooseUnique(['#F9E2B5'], 1)[0],
        height: window.innerHeight * 0.75,
        'overflow-y': 'auto'
      }
    })
      .append($('<span/>', { class: 'close' }).html('&times;')
        .on('click', () => {
          $('#myModal').hide().css('display', 'none')
        })
      )
      .append($('<p/>', { id: 'mcontent' }))
      .append($('<p/>', { id: 'mfeedback' }))
    )
  window.addEventListener('click', function (event) {
    if (event.target === $('#myModal')[0]) {
      $('#myModal').hide().css('display', 'none')
    }
  })
  $('#mcontent').html(`
  ${content || e.stdMsg}
  <br><br><br>:::
  `)
  $('<div/>')
    .html('Scrivici un\'email cliccando qui: <a target="_blank" href="mailto:aeterni.anima@gmail.com?subject=Contatto%20da%20HarmoniCare">aeterni.anima@gmail.com</a>')
    .appendTo('#mfeedback')
  // const descArea = $('<textarea/>', {
  //   maxlength: 3200,
  //   css: {
  //     'background-color': 'white',
  //     margin: 'auto',
  //     width: '50%',
  //     height: '10%'
  //   }
  // }).appendTo('#mfeedback')
  // $('<button/>', { css: { margin: '1%' } }).html('Send / Enviar Feedback').on('click', () => {
  //   window.wand.transfer.fAll.ucosta(
  //     { _id: window.sessionL.insertedId },
  //     { feedback: descArea.val() }
  //   ).then(r => {
  //     descArea.val('')
  //     window.alert('Thank you / Obrigado.')
  //   })
  // }).appendTo('#mfeedback')
  return {
    show: (ms, msg) => {
      // $('#mcontent').html((msg || e.stdMsg()) + '<br><br><br>:::')
      $('#mcontent').html((msg || e.stdMsg()))
      $('#myModal').fadeIn(ms || 'slow') // show() // .css('display', 'block')
      $('#contribL').fadeOut(200).fadeIn(200).fadeOut(200).fadeIn(200).fadeOut(200).fadeIn(200)
    },
    hide: () => {
      $('#myModal').hide().css('display', 'none')
    }
  }
}

e.confirmExit = () => {
  window.wand.unloadFuncs.push(e => {
    e = e || window.event
    // For IE and Firefox prior to version 4
    if (e) {
      e.returnValue = 'Any string'
    }
    // For Safari
    return 'Any string'
  })
}

const reduce = dur => [Math.floor(dur / 60), Math.floor(dur % 60)]
const p = num => num < 10 ? '0' + num : num
e.secsToTime = secs => {
  secs = Math.abs(secs)
  let [minutes, seconds] = reduce(secs)
  let hours = ''
  if (minutes > 59) {
    [hours, minutes] = reduce(minutes)
    hours += ':'
  }
  return `${hours}${p(minutes)}'${p(seconds)}"`
}

e.mobileAndTabletCheck = function () {
  /* eslint-disable */
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

e.mobileAndTabletCheckOLD = () => {
  let check = false
  const a = navigator.userAgent || navigator.vendor || window.opera
  if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(a.substr(0, 4))) check = true
  if (!check) {
    const ua = navigator.userAgent || navigator.vendor || window.opera
    return (ua.indexOf('FBAN') > -1) || (ua.indexOf('FBAV') > -1)
  }
  return true
}

const d = e.defaultArg = (arg, def) => arg === undefined ? def : arg

const nomeMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
e.dataFormatada = d => {
  const data = new Date(d)
  const dia = data.getDate()
  const mes = nomeMeses[data.getMonth()]
  const ano = data.getFullYear()

  const h = data.getHours()
  const m = data.getMinutes()
  return `${h}h${m} (GMT-3, ${[dia, mes, ano].join('/')})`
}

e.formatTheme = s => {
  s = s.replaceAll('_', '')
  return s.charAt(0).toUpperCase() + s.slice(1)
}

e.getPhrase = () => {
  const l1 = [
    'Respiração diafragmática (pela barriga, peito parado), lenta.',
    'Postura livre mas de preferência com coluna ereta, seja deitada ou sentada ou de pé.',
    'Garanta que tenha entendido como ativar o artefato, porque usá-lo e o que esperar das sessões de MMM.'
  ]
  const l2 = [
    'Aquiete a mente.',
    'Concentre-se no tema.',
    'Mesmo durante os dias, quanto menos o pensamento estiver solto, mais energia (e recursos, vitaminas) sobra para o corpo se curar e rejuvenescer.',
    'Quanto menos os pensamentos estiverem desvairados, mais permissões e responsabilidades espirituais são concedidas a nós.'
  ]
  const l3 = [
    'Cure-se e manifeste melhoras para si, nossas famílias e mundo todo.',
    'Harmonize a respiração e o sistema nervoso.',
    'Vibre no corpo de Luz.',
    'Pratique a caridade constantemente.',
    'As sessões devem sempre ser feitar em conjuntos, mínimo de 3. A pessoa deve ir pensando no objetivo das próximas (ou atuais) 3 sessões dela.'
  ]
  const l = l1.concat(l2).concat(l3)
  console.log(l)
  return monk.verses().then(() => {
    window.bpt = monk.biblePt.map(i => `"${i.text}" (${i.ref})`)
    window.vall = window.bpt.concat(l)
    return window.vall
  })
}

e.lastWords = () => {
  // frutos e dons do espírito
  const frutos = [
    'Amor',
    'Alegria',
    'Paz',
    'Paciência',
    'Amabilidade',
    'Bondade',
    'Fidelidade',
    'Mansidão',
    'Domínio próprio'
  ]
  const dons = [
    'Fortaleza',
    'Sabedoria',
    'Entendimento',
    'Conselho',
    'Poder',
    'Conhecimento',
    'Piedade'
  ]
  const extra = [
    'Discernimento',
    'Profecia',
    'Cura',
    'Milagre',
    'Fé',
    'Conhecimento',
    'Generosidade',
    'Ânimo',
    'Dons',
    'Perdão',
    'Graça',
    'Justiça',
    'Perseverança',
    'Virtude',
    'Fraternidade'
  ]
  const all = frutos.concat(dons).concat(extra)
  return () => e.chooseUnique(all, 2).join(' e ')
}

e.basicStats = function () {
  const St = require('stats-js')
  const stats = new St()
  stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild(stats.dom)
  this.tasks = [] // list of routines to execute
  this.executing = true
  this.animate = () => {
    stats.begin()
    // monitored code goes here
    for (let i = 0; i < this.tasks.length; i++) {
      this.tasks[i]()
    }
    stats.end()
    if (this.executing) {
      window.requestAnimationFrame(this.animate)
    }
  }
  this.animate()
  return this
}

e.mobileError = () => {
  window.onerror = function (msg, url, lineNo, columnNo, error) {
    const string = msg.toLowerCase()
    const substring = 'script error'
    if (string.indexOf(substring) > -1) {
      window.alert('Script Error: See Browser Console for Detail')
    } else {
      const message = [
        'Message: ' + msg,
        'URL: ' + url,
        'Line: ' + lineNo,
        'Column: ' + columnNo,
        'Error object: ' + JSON.stringify(error)
      ].join(' - ')
      window.alert(message)
    }
  }
}

e.users = {
  bana: 'Fabbri',
  mariel22: 'Mariel',
  om33: 'Otávio',
  renus: 'S\'Huss'
}

e.mongoIdToRGB = mid => {
  if (typeof mid === 'object') {
    const max = 255 * 3
    const sum = (x, y) => 255 * mid.id.slice(x, y).reduce((a, i) => a + i, 0) / max
    const r = sum(0, 4)
    const g = sum(4, 8)
    const b = sum(8, 12)
    return [r, g, b]
  }
  const c = (x, y) => { // deterministic chaos:
    const slice = mid.slice(x, y)
    let num = 0
    for (let i = 0; i <= slice.length - 2; i++) {
      num += parseInt(slice.slice(i, i + 2), 16)
    }
    return (1 + Math.sin(100000 * num)) * 255 * 0.5
  }
  const r = c(0, 8)
  const g = c(8, 16)
  const b = c(16, 24)
  return [r, g, b]
}

e.mkBtn = (iclass, title, fun, ref, count, size) => {
  const fid = iclass
  const btn = $('<button/>', {
    class: 'btn tooltip',
    id: `${fid}-button${(count || '')}`,
    click: fun,
    css: {
      height: (size || 4) + '%',
      width: (size || 4) + '%',
      'margin-left': '1%',
      'border-radius': '8px',
      cursor: 'pointer'
    }
  })
  if (!ref) {
    btn.prependTo('body')
  } else {
    btn.insertAfter(ref)
  }
  $('<i/>', { class: 'fa fa-' + iclass, id: `${fid}-icon` }).appendTo(btn)
  btn.mtooltip = $('<span/>', { class: 'tooltiptext' }).text(title).appendTo(btn)
  return btn
}

e.objectIdWithTimestamp = timestamp => { // db.mycollection.find({ _id: { $gt: objectIdWithTimestamp('1980/05/25') } })
  if (typeof timestamp === 'string') timestamp = new Date(timestamp)
  /* Convert date object to hex seconds since Unix epoch */
  const hexSeconds = Math.floor(timestamp / 1000).toString(16)

  /* Create an ObjectId with that hex timestamp */
  return new window.wand.transfer.ss.BSON.ObjectId(hexSeconds + '0000000000000000')
}

e.chroma = require('chroma-js')
e.colorNames = Object.keys(e.chroma.colors)
e.randScale1 = (bezier = false) => {
  const colors = e.chooseUnique(e.colorNames, 2 + Math.floor(Math.random() * 3))
  console.log('yeah, here1', bezier)
  const s = e.chroma[bezier ? 'bezier' : 'scale'](colors)
  s.colors_ = colors
  s.bezier_ = bezier
  return s
}
e.brewerNames = Object.keys(e.chroma.brewer)
e.randScale2 = (bezier = false) => {
  const brewer = e.chooseUnique(e.brewerNames, 1)[0]
  const colors = e.chroma.brewer[brewer]
  console.log('yeah, here', bezier)
  const s = e.chroma[bezier ? 'bezier' : 'scale'](bezier ? e.chooseUnique(colors, 5) : colors)
  s.colors_ = colors
  s.bezier_ = bezier
  s.brewer_ = brewer
  return s
}

e.mkRegisterModal_ = () => {
  console.log('new url yeah')
  loadScript('https://code.jquery.com/ui/1.13.3/jquery-ui.js').then(() => {
    $.getJSON('/assets/cityNamesIT.json', names => {
      e.mkRegisterModal(names)
    })
  })
}

e.mkRegisterModal = names => {
  window.mnames = names
  const mcontent = $('<p/>', { id: 'mcontent2', width: '70%' })
  const mfeedback = $('<div/>', { id: 'mfeedback2' })
  $('<div/>', {
    id: 'myRegisterModal',
    class: 'modal',
    role: 'dialog',
    css: {
      'overflow-y': 'initial !important'
    },
    show: {
      effect: 'fade',
      duration: 1000
    },
    hide: {
      effect: 'fade',
      duration: 2000
    }
  }).appendTo('body')
    .append($('<div/>', {
      class: 'modal-content',
      css: {
        background: e.chooseUnique(['#eeeeff', '#eeffee', '#ffeeee'], 1)[0],
        height: window.innerHeight * 0.75,
        'overflow-y': 'auto',
        'text-align': '-webkit-center'
      }
    })
      .append($('<span/>', { class: 'close', id: 'closeX' }).html('&times;')
        .on('click', () => {
          $('#myRegisterModal').hide().css('display', 'none')
        })
      )
      .append(mcontent)
      .append(mfeedback)
    )
  window.addEventListener('click', function (event) {
    if (event.target === $('#myRegisterModal')[0]) {
      $('#myRegisterModal').hide().css('display', 'none')
    }
  })
  const youfs = $('<fieldset/>')
    .appendTo(mcontent)
    .append($('<legend/>').text('Le tue informazioni'))

  const emailfs = $('<fieldset/>')
    .appendTo(mcontent)
    .append($('<legend/>').text('Email'))

  const pwfs = $('<fieldset/>')
    .appendTo(mcontent)
    .append($('<legend/>').text('Password'))

  $('<input/>', { type: 'text', class: 'lwidget', id: 'rname', placeholder: 'Nome' }).attr({
    autocomplete: 'given-name'
  })
    .appendTo(youfs)
  $('<br/>').appendTo(youfs)
  $('<input/>', { type: 'text', class: 'lwidget', id: 'rlname', placeholder: 'Cognome', css: { margin: '1%' } }).attr({
    autocomplete: 'family-name'
  })
    .appendTo(youfs)
  $('<br/>').appendTo(youfs)

  $('<input/>', { type: 'text', class: 'lwidget', id: 'rcity', name: 'rcity', placeholder: 'Città (facoltativo)', css: { margin: '1%' } }).attr({
    autocomplete: 'address-level2'
  })
    .appendTo(youfs)
  $('#rcity').autocomplete({
    source: names
  })

  $('<input/>', { type: 'text', class: 'lwidget', id: 'ruemail', placeholder: 'Indirizzo' }).attr({
    autocomplete: 'email'
  })
    .appendTo(emailfs)
  $('<br/>')
    .appendTo(emailfs)
  $('<input/>', { type: 'text', class: 'lwidget', id: 'ruemail2', placeholder: 'Ripeti l\'indirizzo', css: { margin: '1%' } }).attr({
    autocomplete: 'email'
  })
    .appendTo(emailfs)

  $('<input/>', { type: 'password', class: 'lwidget', id: 'rupwd', placeholder: 'Password' }).attr({
    autocomplete: 'new-password'
  })
    .appendTo(pwfs)
  $('<br/>')
    .appendTo(pwfs)
  $('<input/>', { type: 'password', class: 'lwidget', id: 'rupwd2', placeholder: 'Ripeti la password', css: { margin: '1%' } }).attr({
    autocomplete: 'new-password'
  })
    .appendTo(pwfs)

  const emsg = $('<p/>', { id: 'emsg' }).appendTo(mfeedback)
  $('<button/>', { css: { margin: '1%' } }).html('Register').on('click', () => {
    const name = $('#rname')
    const name_ = name.val()
    const lname = $('#rlname')
    const lname_ = lname.val()
    const city = $('#rcity')
    const city_ = city.val()
    const e1 = $('#ruemail')
    const e2 = $('#ruemail2')
    const p1 = $('#rupwd')
    const p2 = $('#rupwd2')
    const all = [e1, e2, p1, p2]
    all.forEach(e => {
      e.css('border', ' 1px solid #ccc')
    })
    const all_ = all.map(e => e.val())
    if (!name_) {
      emsg.text('your name is missing')
      name.css('border', '2px solid red')
    } else if (!lname_) {
      emsg.text('your lastname is missing')
      lname.css('border', '2px solid red')
    } else if (!validateEmail(all_[0])) {
      emsg.text('input a valid email address')
      e1.css('border', '2px solid red')
    } else if (all_[0] !== all_[1]) {
      emsg.text('email addresses do not match')
      e2.css('border', '2px solid red')
    } else if (all_[2].length < 6) {
      emsg.text('input a password of at least 6 characters')
      p1.css('border', '2px solid red')
    } else if (all_[2] !== all_[3]) {
      emsg.text('passwords do not match')
      p2.css('border', '2px solid red')
    } else {
      emsg.text('ok, writing registration')
      const email = all_[0]
      const pw = all_[2]
      console.log('before search')
      $('#loading').show()
      wand.transfer.fAll.omark({ email }).then(r => {
        console.log('after search')
        if (r) {
          emsg.text('email already in use')
          $('#loading').hide()
          return e1.css('border', '2px solid red')
        }
        console.log('before write')
        const salt = wand.bcrypt.genSaltSync()
        const pw_ = wand.bcrypt.hashSync(pw, salt)
        const user = { email, pw: pw_, name: name_, lname: lname_, city: city_ }
        wand.transfer.fAll.wmark(user).then(r => {
          window.alert('Registration succeded.')
          window.localStorage.setItem('logged', true)
          delete user.pw
          window.localStorage.setItem('user', JSON.stringify(user))
          window.location.reload()
        })
      })
    }
  }).appendTo(mfeedback)
  console.log('arrived to the definition of it')
  window.registerModal = {
    show: (ms, msg) => {
      $('#myRegisterModal').fadeIn(ms || 'slow') // show() // .css('display', 'block')
    },
    hide: () => {
      $('#myRegisterModal').hide().css('display', 'none')
    }
  }
}

const validateEmail = email => {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  )
}

function loadScript (src) {
  return new Promise(function (resolve, reject) {
    if ($("script[src='" + src + "']").length === 0) {
      const script = document.createElement('script')
      script.onload = function () {
        resolve()
      }
      script.onerror = function () {
        reject(new Error(`error loading this external script: ${src}`))
      }
      script.src = src
      document.body.appendChild(script)
    } else {
      resolve()
    }
  })
}

e.checkLogged = () => {
  // HC:
  const logged = window.localStorage.getItem('logged')
  // const logged = true
  if (!logged) {
    window.alert('Fai l\'accesso per utilizzare la stimolazione audiovisiva.')
    window.location.replace('/')
  }
}

e.copyToClipboard = require('copy-to-clipboard')
