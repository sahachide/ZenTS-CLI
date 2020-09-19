import { Controller, get } from 'zents'

export default class extends Controller {
  @get('/')
  public index() {}
}
