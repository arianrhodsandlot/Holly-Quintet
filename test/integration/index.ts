import { AddressInfo } from 'net'
import { exec } from 'child_process'
import { promisify } from 'util'
import http from 'http'
import test, { ExecutionContext } from 'ava'
import puppeteer from 'puppeteer'
import sites from '../../src/consts/sites'
import app from '../../src'

const server = http.createServer(app)
  .listen(process.env.npm_package_config_port!)

test.serial.before(async (t) => {
  await promisify(exec)('yarn build')
  const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  (t as ExecutionContext<{browser: puppeteer.Browser}>).context.browser = browser
})

test.serial('search', async (t) => {
  const { browser } = (t as ExecutionContext<{browser: puppeteer.Browser}>).context
  const { port } = server.address() as AddressInfo

  const page = await browser.newPage()
  await page.goto(`http://localhost:${port}`, { waitUntil: 'networkidle2' })
  await page.type('input', 'a')
  await page.waitForSelector('.album-placeholder')
  t.is(await page.evaluate('$(".mdc-chip--selected").index()'), 0)

  await page.waitForSelector('.albums-result .album-img')
  const img1: string = await page.evaluate('$(".albums-result .album-img").attr("src")')
  t.assert(img1.includes('.mzstatic.com/image'))

  await page.click('#mdc-chip-8')
  await page.waitForSelector('.loading')
  t.is(await page.evaluate('$(".mdc-chip--selected").index()'), 7)

  await page.waitForSelector('.albums-result:not(.loading)')
  const img2: string = await page.evaluate('$(".albums-result .album-img").attr("src")')
  t.assert(img2.includes('media.vgm.io/'))

  await page.close()
})

test.serial('memorize last selected site', async (t) => {
  const { browser } = (t as ExecutionContext<{browser: puppeteer.Browser}>).context
  const { port } = server.address() as AddressInfo

  const page = await browser.newPage()
  await page.goto(`http://localhost:${port}`, { waitUntil: 'networkidle2' })
  await page.type('input', 'a')
  await page.waitForSelector('.album-placeholder')
  t.is(await page.evaluate('$(".mdc-chip--selected").index()'), 7)

  await page.goto(`http://localhost:${port}/search?query=a`)
  await page.waitForSelector('.album-placeholder')
  t.is(await page.evaluate('$(".mdc-chip--selected").index()'), 7)
  t.is(page.url(), `http://localhost:${port}/search?query=a&site=${encodeURIComponent(sites[7].site)}`)

  await page.close()
})

test.serial.after(async (t) => {
  const { browser } = (t as ExecutionContext<{browser: puppeteer.Browser}>).context
  await browser.close()
})
