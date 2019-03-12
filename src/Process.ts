import { launch } from 'puppeteer'

interface Window {
  scrollBy(start: number, end: number): void
}
declare var window: Window

export default class Process {
  siteLoginUrl: string
  siteLoginId: string
  siteLoginPw: string

  constructor() {
    this.siteLoginUrl = <string>process.env.LOGIN_URL
    this.siteLoginId = <string>process.env.LOGIN_ID
    this.siteLoginPw = <string>process.env.LOGIN_PW
  }

  async run(url: string) {
    const puppeteerClient = await launch({
      headless: true,
      slowMo: 50,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=ja,en-US,en']
    })

    const pageContext = await puppeteerClient.newPage()
    await pageContext.setViewport({ width: 1800, height: 1024 })

    await pageContext.goto(this.siteLoginUrl)
    await pageContext.waitFor(3000)

    await pageContext.type('input[name="login"]', this.siteLoginId)
    await pageContext.type('input[name="password"]', this.siteLoginPw)

    const buttonElement = await pageContext.$('button[type=submit]')
    if (!!buttonElement) {
      await buttonElement.click()
      await pageContext.waitFor(3000)

      await pageContext.goto(url)
      await pageContext.waitFor(3000)

      await pageContext.evaluate(() => {
        window.scrollBy(0, 1100)
        Promise.resolve()
      })

      await pageContext.select('select.event_ticket_count', '1')
      await pageContext.waitFor(3000)

      const purchaseButton = await pageContext.$('.btn-procedure-pc-only > button')
      if (!!purchaseButton) {
        purchaseButton.click()
        await pageContext.waitFor(3000)
      }

      await pageContext.screenshot({ path: 'loginPage.png' })
    }

    puppeteerClient.close()
  }
}
