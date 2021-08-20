import { join } from 'path'
import { out, resolveIncludes } from './resolveIncludes/resolveIncludes'

export const exit = (code: number): void => process.exit(code)

export const cwd = (): string => process.cwd()

const absolutePath = (relativePath: string) =>
  join(cwd(), ...relativePath.split('/'))

const _resolveIncludes = async (srcPath: string) =>
  await resolveIncludes(absolutePath(srcPath))

export const watchListener = (
  callback: () => void,
  options: { minInterval?: number } = {}
): (() => void) => {
  const { minInterval = 1000 } = options

  let fsTimeout: NodeJS.Timeout | null
  return () => {
    setTimeout(() => {
      try {
        if (!fsTimeout) {
          callback()
          fsTimeout = setTimeout(function () {
            fsTimeout = null
          }, minInterval) // give 1 seconds for multiple events
        }
      } catch (e) {
        console.log(e)
      }
    }, 100)
  }
}

export const output =
  (outputPath: string, srcPath: string) => async (): Promise<number> => {
    if (outputPath) {
      out(absolutePath(outputPath), await _resolveIncludes(srcPath))
      console.log('compiled.\nWatching for file changes...')
      return 0
    }

    console.log(await _resolveIncludes(srcPath))
    console.log('\nWatching for file changes...')
    return 0
  }
