import { Context, Controller, get, inject, log } from 'zents'

import { MyService } from '../service/MyService'

export class MyController extends Controller {
  @inject
  private myService: MyService

  @get('/')
  public async index({ res }: Context) {
    this.myService.getSomething()

    return await this.render('index')
  }
}
