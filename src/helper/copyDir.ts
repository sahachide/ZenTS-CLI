import { doesDirOrFileExists } from './doesDirOrFileExists'
import { join } from 'path'
import { promises } from 'fs'

export async function copyDir(src: string, dest: string): Promise<void> {
  const entries = await promises.readdir(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = join(src, entry.name)
    const destPath = join(dest, entry.name)

    if (entry.isDirectory()) {
      if (!(await doesDirOrFileExists(destPath))) {
        await promises.mkdir(destPath)
      }
      await copyDir(srcPath, destPath)
    } else {
      await promises.copyFile(srcPath, destPath)
    }
  }
}
