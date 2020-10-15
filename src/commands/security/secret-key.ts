import { AbstractCommand } from '../../classes/AbstractCommand'
import crypto from 'crypto'
import { flags } from '@oclif/command'

export default class SecretKey extends AbstractCommand {
  static description = 'generate a secret key for security configurations'
  static examples = ['$ zen security:secret-key', '$ zen security:secret-key --len=60']
  static flags = {
    len: flags.integer({
      char: 'l',
      description: 'length of the generated key (min: 32)',
      parse: (input) => {
        const min = 32
        let value = parseInt(input, 10)

        if (value < min) {
          value = min
        }

        return value
      },
      default: 42,
      required: false,
    }),
  }

  public async run(): Promise<void> {
    const { flags } = this.parse(SecretKey)

    this.welcome('Your secret key is:')
    this.log(crypto.randomBytes(flags.len).toString('hex'))
  }
}
