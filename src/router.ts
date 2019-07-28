import _ from 'lodash'
import express from 'express'
import url from 'url'
import path from 'path'
import request from 'request'
import logger from 'morgan'
import Searcher from './searcher'
import sites from './consts/sites'
import {getCoverOriginSrc, getCoverDownloadSrc, getJsdelivrCombinedLink} from './util'

const router = express.Router()
const defaultBg = '/images/default.jpg'

const veryLateDate = new Date(253402300000000)

const filePath = url.parse(import.meta.url).pathname!
const workingDir = path.parse(filePath).dir

const cssLink = getCssLink()
const jsLink = getJsLink()

router
  .use(defaultBg, express.static(path.join(workingDir, 'assets/images/default.jpg')))
  .use(logger('combined'))
  .use(function (req, res, next) {
    let site = req.cookies.site || sites[0].site
    res.cookie('site', site, {expires: veryLateDate})

    const bg = req.cookies.bg || defaultBg

    Object.assign(res.locals, {
      site, sites, req, bg, getCoverOriginSrc, getCoverDownloadSrc, cssLink, jsLink
    })
    next()
  })

  .get('/', function (req, res) {
    Object.assign(res.locals, {
      pageName: 'index',
      query: '',
      title: 'Holly Quintet'
    })

    res.render('index')
  })

  .get('/search', async function (req, res, next) {
    let {query = '', site = ''} = req.query

    if (!query) {
      next()
      return
    }

    const parsed = url.parse(req.path, true)
    const trimmedQuery = query.trim()

    if (query !== trimmedQuery) {
      delete parsed.search
      parsed.query.query = trimmedQuery
      const redirectUrl = url.format(parsed)
      res.redirect(redirectUrl)
      return
    }

    const isValidSite = _(sites).map('site').includes(site)
    if (!isValidSite) {
      delete parsed.search
      parsed.query.query = trimmedQuery
      parsed.query.site = sites[0].site
      const redirectUrl = url.format(parsed)
      res.redirect(redirectUrl)
      return
    }

    res.cookie('site', site, {expires: veryLateDate})

    const albums = await Searcher.search(site, trimmedQuery)
    const bg = _.get(albums, '0.ou')
    if (bg) {
      res.cookie('bg', bg, {expires: veryLateDate})
      res.locals.bg = bg
    }
    Object.assign(res.locals, {
      site: site,
      pageName: 'search',
      query: trimmedQuery,
      albums: albums,
      title: `${trimmedQuery} - Holly Quintet`
    })

    res.render(req.xhr ? 'albums' : 'index')
  })

  .get('/file', async function (req, res, next) {
    if (!req.query.url) {
      next()
      return
    }

    request(req.query.url)
      .on('response', function (remoteRes) {
        delete remoteRes.headers['content-disposition']
        res.attachment(req.query.filename)
      })
      .pipe(res)
  })

  .get('*', function (req, res) {
    res.redirect('/')
  })

function getCssLink () {
  return getJsdelivrCombinedLink([{
    name: 'material-components-web',
    version: '3.1.0',
    path: 'dist/material-components-web.min.css'
  }])
}

function getJsLink () {
  return getJsdelivrCombinedLink([{
    name: 'cookies-js',
    version: '1.2.3'
  }, {
    name: 'imagesloaded',
    version: '4.1.4',
    path: 'imagesloaded.pkgd.min.js'
  }, {
    name: 'jquery',
    version: '3.3.1'
  }, {
    name: 'lodash',
    version: '4.17.10'
  }, {
    name: 'material-components-web',
    version: '3.1.0',
    path: 'dist/material-components-web.min.js'
  }, {
    name: 'page',
    version: '1.8.6'
  }, {
    name: 'qs',
    version: '6.5.2',
    path: 'dist/qs.min.js'
  }])
}

export default router