import Process from './Process'
;(async () => {
  const MAX_RETRY = 10000
  let retryCount = 0
  let returnStatus = ''

  console.debug('### Initilized')
  const proc = new Process()

  await proc.setPageContext()

  do {
    console.debug(`### Start retry=${retryCount}`)
    returnStatus = await proc.run(<string>process.env.TARGET_URL, retryCount)
    console.debug(`### Done status=${returnStatus}`)
  } while (returnStatus === 'ng' && ++retryCount <= MAX_RETRY)

  await proc.destroyClient()
})()
