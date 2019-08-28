const puppeteer = require('puppeteer')
const fs = require('fs-extra')
const path = require('path')
const hbs = require('handlebars')
const moment = require('moment')

hbs.registerHelper('dateFormat', function (value, format) {
  return moment(value).format(format)
})

// So, you basically launch a browser, open a page, print the page to a PDF file and close the browser.
module.exports = async (data) => {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()

  const filePath = await fs.readFileSync(path.join('src', 'views', 'pdf.hbs'), 'utf-8')
  const html = await hbs.compile(filePath)({ ...data._doc, url: process.env.URL_PRODUCTION })

  await page.setContent(html)
  await page.pdf({
    path: 'tmp/exemplo.pdf',
    format: 'A4',
    printBackground: true
  })

  await browser.close()
}
