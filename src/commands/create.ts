import { debug, error, info, success } from '../helper/log'

import { AbstractCommand } from '../classes/AbstractCommand'
import { doesDirOrFileExists } from '../helper/doesDirOrFileExists'
import { flags } from '@oclif/command'
import { isDirEmpty } from '../helper/isDirEmpty'
import { join } from 'path'
import { removeDirOrFile } from '../helper/removeDirOrFile'
import { silent as resolveGlobal } from 'resolve-global'

export default class Create extends AbstractCommand {
  static aliases = ['create-project']
  static args = [
    {
      name: 'projectname',
      required: true,
    },
  ]
  static description = 'create a new ZenTS project inside PROJECTNAME directory.'
  static examples = [`$ zen create myproject`]
  static flags = {
    clean: flags.boolean({
      char: 'c',
      description: 'clean install directory before running installation',
    }),
    dev: flags.boolean({ char: 'd', hidden: true }),
    help: flags.help({ char: 'h' }),
  }

  public async run() {
    this.welcome('Create a new ZenTS project!')

    const { args, flags } = this.parse(Create)
    const projectname = args.projectname as string
    const workingDir = join(process.cwd(), projectname)

    if (flags.dev) {
      this.log(debug('Running in dev mode...'))
      if (!resolveGlobal('yalc')) {
        this.log(
          debug(
            'Warning: Yalc is required to be installed globally when running in dev mode. Please install with npm i yalc -g. After installation you should publish a local copy of the ZenTS repository. If the create command fails in the tsc build phase you should execute cd myproject && yalc add zents && npm i && zen build after the command has failed.',
          ),
        )
      }
    }
    if (await doesDirOrFileExists(workingDir)) {
      if (flags.clean) {
        this.log(info('Cleaning destination directory...'))
        await removeDirOrFile(workingDir)
      } else if (!(await isDirEmpty(workingDir))) {
        this.log(
          error(
            `Destination directory "${workingDir}" isn't empty! Use --clean or -c to clean destination.`,
          ),
        )
        process.exit(42)
      }
    }

    await this.generate('Project', {
      cwd: workingDir,
      dev: flags.dev,
      projectname,
    })

    this.log(success(`New ZenTS project created successfully under ${workingDir}`))
    this.log(info(`Use cd ${projectname} && zen dev (or npm start) to start the ZenTS server.`))
  }
}
