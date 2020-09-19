import { error, success } from '../../helper/log'

import { AbstractCommand } from '../../classes/AbstractCommand'
import { doesDirOrFileExists } from '../../helper/doesDirOrFileExists'
import { flags } from '@oclif/command'
import { join } from 'path'

export default class Controller extends AbstractCommand {
  static description = 'create a new ZenTS controller class.'
  static examples = ['$ zen add:controller Product', '$ zen add:controller User']
  static args = [
    {
      name: 'name',
      description:
        'name of the controller, e.g. "Product". The "Controller" appendix should be omitted.',
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
    const { args, flags } = this.parse(Controller)

    this.welcome('Create a ZenTS controller!')

    const filename = `${args.name}Controller.ts`
    const config = await this.getZenConfig()
    const controllerPath =
      typeof config.config?.paths?.base?.src === 'string' &&
      typeof config.config?.paths?.controller === 'string'
        ? join(config.config.paths.base.src, config.config.paths.controller)
        : join(process.cwd(), 'src', 'controller')

    if (!(await doesDirOrFileExists(controllerPath))) {
      this.log(error(`Controller directory "${controllerPath}" doesn't exist!`))
      process.exit(42)
    } else if (!flags.force && (await doesDirOrFileExists(join(controllerPath, filename)))) {
      this.log(
        error(
          `Controller file "${join(
            controllerPath,
            filename,
          )}" already exists. Use --force flag to overwrite this file.`,
        ),
      )
      process.exit(42)
    }

    await this.generate('Controller', {
      cwd: process.cwd(),
      filename,
      controllerPath,
    })

    this.log(
      success(`New ZenTS controller created successfully (${join(controllerPath, filename)})`),
    )
  }
}
