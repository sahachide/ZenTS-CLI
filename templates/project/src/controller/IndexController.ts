import { Controller, get, inject, params } from 'zents'

import ClockService from '../service/ClockService'

export default class extends Controller {
  @inject
  protected clock: ClockService

  @get('/')
  public async index() {
    return await this.render('index', {
      now: this.clock.now(),
    })
  }

  @get('hello/:name')
  public async helloWorld(@params params: { name: string }) {
    const greetings = `Hello ${params.name}`

    return await this.render('hello', {
      greetings,
    })
  }
}
