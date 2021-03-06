// @ts-nocheck
/* global Qs, page, ga, imagesLoaded, _, mdc, Cookies */
let request
const $body = $('body')
const $form = $('form')
const $query = $form.find('.query')
const $chips = $('.chips')
const $albums = $('.albums-result')
const $loader = $('.album-placeholder')
const $info = $('.info')

const veryLateDate = new Date(253402300000000)

function updateBg (src) {
  if (!src) return

  const $bg = $('.bg')

  const $newBg = $('.bg').first()
    .clone()
  Cookies('bg', src, { expires: veryLateDate })
  $newBg.css({
    'background-image': `url(${src})`,
    opacity: 0
  })
  $bg.first().before($newBg)

  $bg.addClass('garbage')
  setTimeout(() => {
    $bg.css('opacity', 0)
    $newBg.css('opacity', '')
    setTimeout(() => {
      $('.garbage').remove()
    }, 1500)
  }, 50)
}

$query.on('input', _.debounce(() => {
  $form.submit()
}, 500))

$form.submit((e) => {
  e.preventDefault()

  const query = $query.val().trim()

  if (!query) {
    page.replace('/')
    return
  }

  const parsed = Qs.parse($form.serialize())
  parsed.site = Cookies('site')
  const url = `${$form.attr('action')}?${Qs.stringify(parsed)}`
  page(url)
})

$chips.on('click', '.mdc-chip', (e) => {
  const index = $(e.currentTarget).index()
  const { chips } = e.currentTarget.parentElement.MDCChipSet
  const targetChip = chips[index]

  chips.forEach((chip) => {
    chip.foundation_.setSelected(chip === targetChip)
  })

  const { site } = targetChip.root_.dataset
  Cookies('site', site, { expires: veryLateDate })
  const parsed = Qs.parse(location.search.slice(1))
  parsed.site = site
  page.replace(`/search?${Qs.stringify(parsed)}`)
})

$albums.on('click', '.download-mask', (e) => {
  const $container = $(e.currentTarget).closest('.album-container')
  const src = $container.find('img.album-img').attr('src')
  updateBg(src)
})

let infoDialog
$info.click(() => {
  if (!infoDialog) {
    const $dialog = $('.info-dialog')
    $dialog.find('img[data-src]').each((i, el) => {
      const $img = $(el)
      $img.attr('src', $img.data('src'))
    })
    infoDialog = $dialog.get(0).MDCDialog
  }

  infoDialog.open()
})

$body.keypress((e) => {
  if (e.target === $query.get(0)) return

  if (e.which === 47) {
    $query.focus()
    e.preventDefault()
  }
})

setTimeout(() => {
  $('.bg').addClass('loaded')
}, 3000)

page((ctx, next) => {
  if (window.ga) ga('send', 'pageview')

  if (request) request.abort()

  if (ctx.init) {
    mdc.autoInit(document.body)
    $query.select()
  } else {
    next()
  }
})

page('/', () => {
  $body.attr('class', 'page-index')
  $query.focus().val('')
  document.title = 'Holly Quintet'
  $albums.empty()
})

page('/search', async (ctx) => {
  $body.attr('class', 'page-search')
  const { query } = Qs.parse(ctx.querystring)
  $query.focus().val(query)

  document.title = `${query} - Holly Quintet`

  if ($albums.find('.album-container').length > 0) {
    $albums.addClass('loading')
  } else {
    $albums.empty()
    $loader.show()
  }

  request = $.get(ctx.path)
  const res = await request

  const $res = $(res)
  const $newAlbums = $res.filter('.albums')
  const $title = $res.filter('title')

  document.title = $title.text()

  imagesLoaded($newAlbums.find('.album-img').first(), () => {
    if ($newAlbums.data('query') !== query.trim()) return

    $loader.hide()
    $albums.html($newAlbums.html()).removeClass('loading')
    updateBg($res.find('.album-img').attr('src'))
  })
})

page()
