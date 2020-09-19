import AbstractGenerator from '../classes/AbstractGenerator'

export default class Entity extends AbstractGenerator {
  public writing() {
    this.fs.copyTpl(
      this.templatePath('Entity.ts'),
      this.destinationPath(this.options.entityPath, this.options.filename),
      {
        name: this.options.name as string,
      },
    )
  }
}
