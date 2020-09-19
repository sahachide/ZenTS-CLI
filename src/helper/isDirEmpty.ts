import { promises } from 'fs'

export async function isDirEmpty(dir: string): Promise<boolean> {
  return !(await promises.readdir(dir)).length
}
