import { Hook } from '@oclif/config'
import chalk from 'chalk'
import figures from 'figures'

const heart = chalk.red(figures('♥'))

const hook: Hook<'prerun'> = async function () {
  // nodemon captures SIGINT, this makes sure the process is exit correctly
  process.on('SIGINT', () => process.exit(0))
  process.on('SIGTERM', () => process.exit(0))

  process.on('exit', () => {
    process.stdout.write(
      `\n${chalk.bgMagenta.white.bold(
        '[ZenTS-CLI]',
      )} Thanks for using ZenTS! Goodbye ${heart}${heart}${heart}\n`,
    )
  })
}

export default hook
