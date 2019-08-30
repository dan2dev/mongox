// this is based on https://github.com/motdotla/dotenv/blob/master/lib/main.js

import fs from "fs-extra";
import { default as path } from "path";

export module EnvHelper {
    const NEWLINE = '\n'
    const RE_INI_KEY_VAL = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/
    const RE_NEWLINES = /\\n/g
    export type DotenvParseOptions = {
        debug?: boolean
    }
    // keys and values from src
    export type DotenvParseOutput = { [key: string]: string }
    export type DotenvConfigOptions = {
        path?: string, // path to .env file
        encoding?: string, // encoding of .env file
        debug?: string // turn on logging for debugging purposes
    }
    export type DotenvConfigOutput = {
        parsed?: DotenvParseOutput,
        error?: Error
    }
    export function parse(src: string, options?: DotenvParseOptions): DotenvParseOutput {
        const debug = Boolean(options && options.debug)
        const obj: { [key: string]: string } = {}

        src.toString().split(NEWLINE).forEach(function (line, idx) {
            const keyValueArr = line.match(RE_INI_KEY_VAL)
            if (keyValueArr != null) {
                const key = keyValueArr[1]
                let val = (keyValueArr[2] || '')
                const end = val.length - 1
                const isDoubleQuoted = val[0] === '"' && val[end] === '"'
                const isSingleQuoted = val[0] === "'" && val[end] === "'"

                if (isSingleQuoted || isDoubleQuoted) {
                    val = val.substring(1, end)
                    if (isDoubleQuoted) {
                        val = val.replace(RE_NEWLINES, NEWLINE)
                    }
                } else {
                    val = val.trim()
                }

                obj[key] = val
            } else if (debug) {
                console.log(`did not match key and value when parsing line ${idx + 1}: ${line}`)
            }
        })

        return obj
    }
    export function config(options: DotenvConfigOptions): DotenvConfigOutput {
        let dotenvPath = path.resolve(process.cwd(), '.env')
        let encoding: string = 'utf8'
        let debug = false

        if (options) {
            if (options.path != null) {
                dotenvPath = options.path
            }
            if (options.encoding != null) {
                encoding = options.encoding
            }
            if (options.debug != null) {
                debug = true
            }
        }

        try {
            const parsed = parse(fs.readFileSync(dotenvPath, { encoding }), { debug })
            Object.keys(parsed).forEach(function (key) {
                process.env[key] = parsed[key]
            });
            return { parsed }
        } catch (e) {
            return { error: e }
        }
    }
}


