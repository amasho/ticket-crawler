import { Browser, launch, Page } from 'puppeteer'

interface Window {
  scrollBy(start: number, end: number): void
}
declare var window: Window

export default class Process {
  pageContext: Page
  puppeteerClient: Browser
  siteLoginUrl: string
  siteLoginId: string
  siteLoginPw: string
  userAgent: string

  constructor() {
    this.siteLoginUrl = <string>process.env.LOGIN_URL
    this.siteLoginId = <string>process.env.LOGIN_ID
    this.siteLoginPw = <string>process.env.LOGIN_PW
    this.userAgent = <string>process.env.USER_AGENT
  }

  public async setPageContext(): Promise<void> {
    this.puppeteerClient = await launch({
      headless: true,
      slowMo: 50,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=ja,en-US,en']
    })
    this.pageContext = await this.puppeteerClient.newPage()
    await this.pageContext.setUserAgent(this.userAgent)
    await this.pageContext.setViewport({ width: 1800, height: 1024 })
  }

  public async destroyClient() {
    await this.puppeteerClient.close()
  }

  public async run(url: string, count: number): Promise<string> {
    if (count === 0) {
      await this._login()
    }

    await this.pageContext.goto(url)
    await this.pageContext.waitFor(3000)

    await this.pageContext.evaluate(() => {
      window.scrollBy(0, 1100)
      Promise.resolve()
    })

    if ((await this._isBeforeSale()) === true) {
      console.error('INFO: Target before sale')
      return 'ng'
    }

    await this.pageContext.select('select.event_ticket_count', '1')
    await this.pageContext.waitFor(3000)

    const purchaseConfirmButton = await this.pageContext.$('.btn-procedure-pc-only > button')
    if (!purchaseConfirmButton) return 'ng'

    purchaseConfirmButton.click()
    await this.pageContext.waitFor(5000)

    await this.pageContext.screenshot({ path: `done${count}.png` })

    // クレカ決済
    this._creditCardPurchase()

    // コンビニ決済
    // this._convenienceStorePurchase()

    return 'ok'
  }

  private async _login() {
    const p: Page = this.pageContext
    await p.goto(this.siteLoginUrl)
    await p.waitFor(3000)
    await p.type('input[name="login"]', this.siteLoginId)
    await p.type('input[name="password"]', this.siteLoginPw)
    await p.click('button[type=submit]')
    await p.waitFor(3000)
  }

  private async _isBeforeSale(): Promise<Boolean> {
    return !!(await this.pageContext.$('.status.label-status.before-sale')) ? true : false
  }

  private async _creditCardPurchase() {}

  private async _convenienceStorePurchase() {}
}
