import * as core from '@actions/core'

import * as fs from 'fs'
import {CoffeeSupporter, CoffeeSupportersResponse} from './interfaces'

import coffeeAPI from 'buymeacoffee.js'

const PLACEHOLDER_START = '<!--START_SECTION:buy-me-a-coffee-->'
const PLACEHOLDER_END = '<!--END_SECTION:buy-me-a-coffe-->'

export async function run(): Promise<void> {
  try {
    const fileName = core.getInput('FILENAME');
    core.debug('started, getting buyme token...')
    const coffeeToken = core.getInput('BUY_ME_A_COFFEE_TOKEN')

    const coffee = new coffeeAPI(coffeeToken)
    core.debug('coffeeAPI connection established.')
    const supporters: CoffeeSupportersResponse = await coffee.Supporters()

    const decodedReadme = fs.readFileSync(fileName, 'utf-8')

    const numberOfMessages = Number(core.getInput('NUMBER_OF_MESSAGES'))
    const messages = Array.isArray(supporters?.data)
      ? supporters.data
        .slice(0, numberOfMessages)
        .map((supporter: CoffeeSupporter) => generateMessageLine(supporter))
        .join('\n')
      : ''
    if (!messages) {
        core.info("No supporters yet!")
        return;
    }
    const updatedReadme = saveBMAC2File(decodedReadme, messages)

    fs.writeFileSync(fileName, updatedReadme);

  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

export const saveBMAC2File = (readme: string, messages: string): string => {
  const str = `${PLACEHOLDER_START}[\\s\\S]*${PLACEHOLDER_END}`
  const updateRegexp = new RegExp(str, 'g')

  return readme.replace(
    updateRegexp,
    `${PLACEHOLDER_START}${messages}${PLACEHOLDER_END}`
  )
}
export const generateMessageLine = (supporter: CoffeeSupporter): string => {
  let coffees = '<div>'
  for (let i = 0; i < supporter.support_coffees; ++i) {
    coffees += '<img src="https://github.com/akosbalasko/coffee-to-file/blob/main/assets/bmc-logo.png?raw=true" width="30">'
  }
  coffees += ` from <b>${supporter.payer_name}</b> </div>`
  return `${coffees}  <div><i>${supporter.support_note}</i></div><br>`
}

run()
