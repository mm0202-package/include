import { join } from 'path'
import {
  createReadStream,
  mkdirSync,
  PathLike,
  WriteFileOptions,
  writeFileSync,
} from 'fs'
import readline from 'readline'

const lines = (filePath: string) =>
  readline.createInterface(createReadStream(filePath))

export const resolveIncludes = async (
  rootFilePath: string,
  prefix = ''
): Promise<string> => {
  let resolvedText = ''
  for await (const line of lines(rootFilePath)) {
    const matches = line.match(/^(.*)_include "([A-Za-z0-9/.]+)";?$/)
    if (matches) {
      const [, _prefix, path] = matches
      const importPath = join(rootFilePath, '..', path)
      resolvedText += await resolveIncludes(importPath, prefix + _prefix)
    } else {
      resolvedText += prefix + line + '\r\n'
    }
  }
  return resolvedText
}

const mkdir = (path: string) => {
  mkdirSync(join(path.toString(), '..'), { recursive: true })
}

export const out = (
  path: PathLike | number,
  data: string | NodeJS.ArrayBufferView,
  options?: WriteFileOptions
): void => {
  mkdir(path.toString())
  writeFileSync(path, data, options)
}
