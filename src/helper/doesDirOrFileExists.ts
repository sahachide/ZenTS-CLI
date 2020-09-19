import { promises } from 'fs'

export async function doesDirOrFileExists(dirOrFile: string): Promise<boolean> {
  let success = true

  try {
    await promises.access(dirOrFile)
  } catch (error) {
    success = false
  }

  return success
}
