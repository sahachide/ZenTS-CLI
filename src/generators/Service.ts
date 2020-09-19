import AbstractGenerator from '../classes/AbstractGenerator'

export default class Service extends AbstractGenerator {
  public writing() {
    this.fs.copyTpl(
      this.templatePath('Service.ts'),
      this.destinationPath(this.options.servicePath, this.options.filename),
    )
  }
}
