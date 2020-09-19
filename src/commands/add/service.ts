import { error, success } from '../../helper/log'

import { AbstractCommand } from '../../classes/AbstractCommand'
import { doesDirOrFileExists } from '../../helper/doesDirOrFileExists'
import { flags } from '@oclif/command'
import { join } from 'path'

export default class Service extends AbstractCommand {
  static description = 'create a new ZenTS service class.'
  static examples = ['$ zen add:service Util']
  static args = [
    {
      name: 'name',
      description: 'name of the service, e.g. "Util". The "Service" appendix should be omitted.',
      required: true,
    },
  ]
  static flags = {
    force: flags.boolean({
      char: 'f',
      description: 'force creation, eventually overwriting existing file',
      default: false,
    }),
  }
  public async run(): Promise<void> {
    const { args, flags } = this.parse(Service)

    this.welcome('Create a ZenTS service!')

    const filename = `${args.name}Service.ts`
    const config = await this.getZenConfig()
    const servicePath =
      typeof config.config?.paths?.base?.src === 'string' &&
      typeof config.config?.paths?.service === 'string'
        ? join(config.config.paths.base.src, config.config.paths.service)
        : join(process.cwd(), 'src', 'service')

    if (!(await doesDirOrFileExists(servicePath))) {
      this.log(error(`Service directory "${servicePath}" doesn't exist!`))
      process.exit(42)
    } else if (!flags.force && (await doesDirOrFileExists(join(servicePath, filename)))) {
      this.log(
        error(
          `Service file "${join(
            servicePath,
            filename,
          )}" already exists. Use --force flag to overwrite this file.`,
        ),
      )
      process.exit(42)
    }

    await this.generate('Service', {
      cwd: process.cwd(),
      filename,
      servicePath,
    })

    this.log(success(`New ZenTS service created successfully (${join(servicePath, filename)})`))
  }
}
