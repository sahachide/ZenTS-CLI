import Generator from 'yeoman-generator'
import filter from 'gulp-filter'
import { format } from 'prettier'
import { join } from 'path'
import through from 'through2'

export default abstract class extends Generator {
  constructor(args: any, options: any) {
    super(args, options)

    this._registerPrettierTransform()
    this.sourceRoot(join(__dirname, '..', '..', 'templates'))
    if (typeof this.options.cwd === 'string') {
      this.destinationRoot(this.options.cwd)
    }
  }
  private _registerPrettierTransform() {
    const transform = (
      file: {
        contents: Buffer
      },
      _encoding: string,
      next: (err: null, file: { contents: Buffer }) => void,
    ) => {
      const str = file.contents.toString('utf8')
      const data = format(str, {
        printWidth: 100,
        semi: false,
        singleQuote: true,
        trailingComma: 'all',
        parser: 'typescript',
      })

      file.contents = Buffer.from(data)

      return next(null, file)
    }

    const prettierFilter = filter(['**/*.{ts,tsx}', '.eslintrc.js'], { restore: true })

    // @ts-ignore
    this.registerTransformStream([prettierFilter, through.obj(transform), prettierFilter.restore])
  }
}
