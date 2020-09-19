import AbstractGenerator from '../classes/AbstractGenerator'

export default class Controller extends AbstractGenerator {
  public writing() {
    this.fs.copyTpl(
      this.templatePath('Controller.ts'),
      this.destinationPath(this.options.controllerPath, this.options.filename),
    )
  }
}
