import { black, cyan, green, magenta, red, white } from 'chalk'

import figures from 'figures'

const ICON = {
  INFO: figures('ℹ'),
  SUCCESS: figures('✔'),
  ERROR: figures('✖'),
  DEBUG: figures('›'),
}

export function info(msg: string = '') {
  const prefix = msg.length ? '[ZenTS-CLI] ' : ''

  return `${black.bgCyan(`${prefix}${ICON.INFO}INFO${ICON.INFO}`)} ${cyan(msg)}`
}

export function success(msg: string = '') {
  const prefix = msg.length ? '[ZenTS-CLI] ' : ''

  return `${white.bgGreen(`${prefix}${ICON.SUCCESS}SUCCESS${ICON.SUCCESS}`)} ${green(msg)}`
}

export function error(msg: string = '') {
  const prefix = msg.length ? '[ZenTS-CLI] ' : ''

  return `${white.bgRed(`${prefix}${ICON.ERROR}ERROR${ICON.ERROR}`)} ${red(msg)}`
}

export function debug(msg: string = '') {
  const prefix = msg.length ? '[ZenTS-CLI] ' : ''

  return `${white.bgMagenta(`${prefix}${ICON.DEBUG}DEBUG${ICON.DEBUG}`)} ${magenta(msg)}`
}
