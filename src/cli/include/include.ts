import { FSWatcher, watch } from 'fs'
import { Command } from 'commander'
import { exit, output, watchListener } from './functions'

export const include = async (): Promise<void> => {
  const fsWatchers: FSWatcher[] = []

  process.on('SIGINT', async function () {
    await Promise.all(
      fsWatchers.map(async (fsWatchers) => await fsWatchers.close())
    )
    exit(0)
  })

  const program = new Command()

  // noinspection RequiredAttributes
  program
    .option('-s, --src <path>', 'src path')
    .option('-o, --out <path>', 'output path')
    .option('-w, --watch <paths...>', 'watch paths')
    .option('-i, --min-interval <milliseconds>', 'min interval')
    .option('-h, --help', 'help')

  program.parse(process.argv)

  const options = program.opts()

  if (options.help || !options.src) {
    program.help()
    exit(0)
  }

  const _output = output(options.out, options.src)
  if (options.watch) {
    await _output()
    await Promise.all(
      options.watch.map(async (watchPath: string) => {
        const fsWatcher = watch(
          watchPath,
          { recursive: true },
          watchListener(_output, {
            minInterval: options.minInterval || 1000,
          })
        )

        fsWatchers.push(fsWatcher)
      })
    )
  } else {
    exit(await _output())
  }
}
