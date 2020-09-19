import { Command } from '@oclif/command'
import { cosmiconfig } from 'cosmiconfig'
import { createEnv } from 'yeoman-environment'
import { join } from 'path'
import merge from 'lodash.merge'
import yosay from 'yosay'

export interface ZenConfigStub {
  config?: {
    paths?: {
      base?: {
        src?: string
        dist?: string
      }
      view?: string
      controller?: string
      service?: string
      entity?: string
    }
    web?: {
      port?: number
    }
  }
}

export abstract class AbstractCommand extends Command {
  protected async generate(
    generatorKey: string,
    options: Record<string, unknown> = {},
  ): Promise<void> {
    const key = `zen:${generatorKey}`
    const env = createEnv()

    env.register(require.resolve(`./../generators/${generatorKey}`), key)

    await new Promise((resolve, reject) => {
      env.run(key, options, (err: Error | null) => {
        if (err) {
          return reject(err)
        }

        return resolve()
      })
    })
  }
  protected async getViewDirectories() {
    const base = await this.getCompilerDirectories()
    const defaultDirectory = 'view'
    const defaultViewDirectories = {
      src: join(base.src, defaultDirectory),
      dist: join(base.dist, defaultDirectory),
    }
    const config = await this.getZenConfig()

    if (!config) {
      return defaultViewDirectories
    }

    const view = config.config?.paths?.view

    if (typeof view !== 'string') {
      return defaultViewDirectories
    }

    return {
      src: join(base.src, view),
      dist: join(base.dist, view),
    }
  }
  protected async getCompilerDirectories() {
    const defaultDirectories = {
      src: join(process.cwd(), 'src'),
      dist: join(process.cwd(), 'dist'),
    }

    const config = await this.getZenConfig()

    if (!config) {
      return defaultDirectories
    }

    return {
      src: config.config?.paths?.base?.src ?? defaultDirectories.src,
      dist: config.config?.paths?.base?.dist ?? defaultDirectories.dist,
    }
  }
  protected async getZenConfig(): Promise<ZenConfigStub> {
    const baseExplorer = cosmiconfig('zen', {
      searchPlaces: [
        'package.json',
        '.zenrc',
        '.zenrc.js',
        'zen.json',
        'zen.yaml',
        'zen.yml',
        'zen.config.json',
        'zen.config.js',
        'zen.config.yaml',
        'zen.config.yml',
      ],
    })
    const baseConfig = (await baseExplorer.search(process.cwd())) as ZenConfigStub

    const envExplorer = cosmiconfig('zen', {
      searchPlaces: [
        'zen.development.json',
        'zen.development.yaml',
        'zen.development.yml',
        'zen.development.config.json',
        'zen.development.config.js',
        'zen.development.config.yaml',
        'zen.development.config.yml',
      ],
    })
    const envConfig = (await envExplorer.search(process.cwd())) as ZenConfigStub

    return merge(
      {},
      baseConfig ? baseConfig.config : {},
      envConfig ? envConfig.config : {},
    ) as ZenConfigStub
  }
  protected welcome(msg: string) {
    this.log(yosay(msg))
  }
}
