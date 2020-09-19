import { error, info, success } from '../helper/log'

import { AbstractCommand } from '../classes/AbstractCommand'
import cli from 'cli-ux'
import { copyDir } from '../helper/copyDir'
import { doesDirOrFileExists } from '../helper/doesDirOrFileExists'
import execa from 'execa'
import { join } from 'path'
import { promises } from 'fs'
import { removeDirOrFile } from '../helper/removeDirOrFile'

export default class Build extends AbstractCommand {
  static description =
    'build a ZenTS application. This command will compile the TypeScript files and copy the projects templates to the dist folder.'
  public async run(): Promise<void> {
    this.parse(Build)

    this.welcome('Building ZenTS project!')

    const { dist } = await this.getCompilerDirectories()

    await this.prepareDistDirectory(dist)
    await this.compileTypeScript()
    await this.copyTemplates()

    this.log(success('Project build successfully!'))
  }

  protected async prepareDistDirectory(outDir: string): Promise<string> {
    const distDirectory = join(process.cwd(), outDir)

    await removeDirOrFile(distDirectory)

    return distDirectory
  }
  protected async compileTypeScript(): Promise<void> {
    try {
      cli.action.start(info('Compiling TypeScript files...'))
      await execa('tsc', {
        preferLocal: true,
        localDir: process.cwd(),
      })
    } catch (err) {
      cli.action.stop(error())
      this.log(error(err))
      process.exit(9)
    }
    cli.action.stop(success())
  }
  protected async copyTemplates(): Promise<void> {
    cli.action.start(info('Copying template files...'))
    const { src, dist } = await this.getViewDirectories()

    if (!(await doesDirOrFileExists(src))) {
      cli.action.stop("source directory doesn't exist")
      return
    }

    await promises.mkdir(dist)
    await copyDir(src, dist)
    cli.action.stop(success())
  }
}
