import * as path from 'path'
import { out, resolveIncludes } from './resolveIncludes'
import * as fs from 'fs'

describe('resolveIncludes', () => {
  const expectedRules = () => `
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            function isAdmin() {
              return request.auth.token.admin == true;
            }
  
            match /someCollection/{someDocument} {
              allow read: if isAdmin();
              allow write: if isAdmin();
            }
  
            match /someCollection2/{someDocument} {
              allow read: if isAdmin();
              allow write: if true;
            }
          }
        }
      `
  const srcFile = () => path.join(__dirname, '__test__', 'rules', 'index.rules')

  const shrink = (str: string) =>
    str
      .trim()
      .replace(/(\r?\n)/g, ' ')
      .replace(/\s{2,}/g, ' ')

  test('resolveIncludes', async () => {
    expect(shrink(await resolveIncludes(srcFile()))).toBe(
      shrink(expectedRules())
    )
  })

  test('output', async () => {
    const destFile = () =>
      path.join(__dirname, '__test__', 'dist', 'test', 'firestore.rules')

    out(destFile(), await resolveIncludes(srcFile()))

    const outputText = () => fs.readFileSync(destFile()).toString()

    expect(shrink(outputText())).toBe(shrink(expectedRules()))
  })
})

export {}
