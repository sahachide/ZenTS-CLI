import { AbstractCommand, ZenConfigStub } from '../classes/AbstractCommand'

import browserSync from 'browser-sync'
import chalk from 'chalk'
import execa from 'execa'
import { flags } from '@oclif/command'
import { getPortPromise } from 'portfinder'
import { join } from 'path'
import nodemon from 'nodemon'

interface SyncPortFlags {
  syncPortFlag: number
  syncUiPortFlag: number
}

const LOG_PREFIX = {
  SERVER: chalk.bgMagenta.white.bold('[WEB-SERVER]'),
  TSC: chalk.bgBlue.white.bold('[TSC-WATCH]'),
  SYNC: chalk.bgGreen.white.bold('[BROWSER-SYNC]'),
}

export default class Dev extends AbstractCommand {
  static description = 'run a ZenTS project with a dev server, tsc-watch and browser-sync.'
  static examples = [`$ zen dev`]
  static flags = {
    'tsc': flags.boolean({
      description:
        'enable/Disable the TypeScript watch compiler. Enabled by default, set --no-tsc flag to disable.',
      default: true,
      allowNo: true,
      required: false,
    }),
    'server': flags.boolean({
      description:
        'enable/Disable the web-server. Enabled by default, set --no-server flag to disable.',
      default: true,
      allowNo: true,
      required: false,
    }),
    'sync': flags.boolean({
      description:
        'enable/Disable the browser-sync with the web-server. Enabled by default, set --no-sync flag to disable.',
      default: true,
      allowNo: true,
      required: false,
    }),
    'sync-port': flags.integer({
      description:
        'the port browser-sync will use (if none is provided will determine a open port between 8000 and 8999 automatically)',
      required: false,
      default: 0,
    }),
    'sync-ui-port': flags.integer({
      description:
        'the port browser-sync ui will use (if none is provided will determine a open port between 9000 and 9999 automatically)',
      required: false,
      default: 0,
    }),
    'help': flags.help({ char: 'h' }),
  }

  private zenConfig!: ZenConfigStub['config']

  public async run(): Promise<void> {
    this.welcome('Running ZenTS in development mode.')

    const { flags } = this.parse(Dev)

    if (!flags.tsc && !flags.server) {
      this.log(
        `${chalk.bgMagenta.white.bold(
          '[ZenTS-CLI]',
        )} All features have been deactived by flags. Nothing to do here. Quitting now...`,
      )
      process.exit()
    }

    this.zenConfig = (await this.getZenConfig()) as ZenConfigStub['config']

    if (flags.tsc) {
      this.tscWatch()
    }
    if (flags.server) {
      await this.startDevServer(flags.sync, {
        syncPortFlag: flags['sync-port'],
        syncUiPortFlag: flags['sync-ui-port'],
      })
    }
  }
  protected tscWatch(): void {
    const tscWatchProcess = execa('tsc', ['--watch', '--preserveWatchOutput'], {
      preferLocal: true,
      localDir: process.cwd(),
    })

    tscWatchProcess.stdout.on('data', (data: Buffer) =>
      this.log(LOG_PREFIX.TSC, this.getLogMessage(data)),
    )
  }
  protected async startDevServer(
    activeBrowserSync: boolean,
    syncPortFlags: SyncPortFlags,
  ): Promise<void> {
    const { src, dist } = await this.getCompilerDirectories()
    const server = nodemon({
      exec: 'ts-node',
      script: join(src, 'app.ts'),
      stdout: false,
      colours: false,
      ext: 'ts tsx js jsx json njk nunjucks nunjs nj html htm template tmpl tpl',
      ignore: [dist],
      env: {
        NODE_ENV: 'development',
      },
    })

    let browserSyncInstance: browserSync.BrowserSyncInstance
    let startBrowserInstance = false
    let reloadBrowserInstance = false

    server
      .on('start', () => {
        this.log(`${LOG_PREFIX.SERVER} Server has started!`)
        if (!browserSyncInstance && activeBrowserSync) {
          startBrowserInstance = true
        }
      })
      .on('quit', () => this.log(`${LOG_PREFIX.SERVER} Server has quit!`))
      .on('restart', (files) => {
        this.log(`${LOG_PREFIX.SERVER} Server restarted due to: `, files)
        if (browserSyncInstance && activeBrowserSync) {
          reloadBrowserInstance = true
        }
      })
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      .on('stdout', async (data: Buffer) => {
        const msg = data.toString()

        this.log(`${LOG_PREFIX.SERVER} ${msg}`)

        if (activeBrowserSync && msg.includes('ZenTS web-server listening on')) {
          if (startBrowserInstance) {
            startBrowserInstance = false

            browserSyncInstance = await this.startBrowserSync(syncPortFlags)
          } else if (reloadBrowserInstance) {
            reloadBrowserInstance = false
            browserSyncInstance.reload()
          }
        }
      })
      .on('stderr', (data: Buffer) => this.log(`${LOG_PREFIX.SERVER} ${data.toString()}`))
  }
  protected async startBrowserSync(ports: SyncPortFlags): Promise<browserSync.BrowserSyncInstance> {
    const instance = browserSync.create()
    const zenAppProxy = `http://localhost:${this.zenConfig?.web?.port ?? 3000}`
    const browserSyncPort = !ports.syncPortFlag
      ? await getPortPromise({
          port: 8000,
          stopPort: 8999,
        })
      : ports.syncPortFlag
    const browserSyncUIPort = !ports.syncUiPortFlag
      ? await getPortPromise({
          port: 9000,
          stopPort: 9999,
        })
      : ports.syncUiPortFlag

    instance.init({
      proxy: zenAppProxy,
      port: browserSyncPort,
      notify: false,
      watch: false,
      ui: {
        port: browserSyncUIPort,
      },
      logLevel: 'silent',
    })

    this.log(
      `${LOG_PREFIX.SYNC} Serving under http://localhost:${browserSyncPort} (Proxying: ${zenAppProxy})`,
    )
    this.log(`${LOG_PREFIX.SYNC} Access browser-sync UI: http://localhost:${browserSyncUIPort}`)
    this.log(`${LOG_PREFIX.SYNC} Opening http://localhost:${browserSyncPort} in default browser`)

    return instance
  }
  protected getLogMessage(data: Buffer): string {
    return data instanceof Buffer ? data.toString().replace(/\n/g, '') : ''
  }
}
