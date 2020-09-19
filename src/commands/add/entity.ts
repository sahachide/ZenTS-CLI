import { error, success } from '../../helper/log'

import { AbstractCommand } from '../../classes/AbstractCommand'
import { doesDirOrFileExists } from '../../helper/doesDirOrFileExists'
import { flags } from '@oclif/command'
import { join } from 'path'

export default class Entity extends AbstractCommand {
  static description = 'create a new ZenTS/TypeORM entity class.'
  static examples = ['$ zen add:entity Product', '$ zen add:entity User']
  static args = [
    {
      name: 'name',
      description: 'name of the entity, e.g. "Product"',
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
    const { args, flags } = this.parse(Entity)

    this.welcome('Create a ZenTS entity!')

    const filename = `${args.name}.ts`
    const config = await this.getZenConfig()
    const entityPath =
      typeof config.config?.paths?.base?.src === 'string' &&
      typeof config.config?.paths?.entity === 'string'
        ? join(config.config.paths.base.src, config.config.paths.entity)
        : join(process.cwd(), 'src', 'entity')

    if (!(await doesDirOrFileExists(entityPath))) {
      this.log(error(`Entity directory "${entityPath}" doesn't exist!`))
      process.exit(42)
    } else if (!flags.force && (await doesDirOrFileExists(join(entityPath, filename)))) {
      this.log(
        error(
          `Entity file "${join(
            entityPath,
            filename,
          )}" already exists. Use --force flag to overwrite this file.`,
        ),
      )
      process.exit(42)
    }

    await this.generate('Entity', {
      cwd: process.cwd(),
      filename,
      name: args.name,
      entityPath,
    })

    this.log(success(`New ZenTS service created successfully (${join(entityPath, filename)})`))
  }
}
