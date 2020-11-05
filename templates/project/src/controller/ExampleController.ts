import { Controller, get } from 'zents'

export default class extends Controller {
  @get('/example')
  public async example() {
    return {
      foo: 'bar',
    }
  }
}
