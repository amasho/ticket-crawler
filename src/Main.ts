import { launch } from 'puppeteer'

export const VIEW_PORT = {
  width: 1800,
  height: 800
}

export default class Main {
  public static async run(url: string) {
    const client = await launch({
      headless: false,
      slowMo: 50,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    const pageContext = await client.newPage()
    await pageContext.setViewport(VIEW_PORT)
    await pageContext.goto(url)

    client.close()
  }
}

Main.run(<string>process.env.TARGET_URL)
