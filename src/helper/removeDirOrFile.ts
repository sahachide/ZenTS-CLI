import rimraf from 'rimraf'

export async function removeDirOrFile(dir: string): Promise<void> {
  return new Promise((resolve, reject) => {
    rimraf(
      dir,
      {
        disableGlob: true,
      },
      (err) => {
        if (err) {
          return reject(err)
        }

        return resolve()
      },
    )
  })
}
