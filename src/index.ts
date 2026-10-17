import * as http from "http"

export type HealthStatus = "UP" | "DOWN"
export interface HealthMap {
  [key: string]: Health
}
export interface Health {
  status: HealthStatus
  data?: AnyMap
  details?: HealthMap
}
export interface AnyMap {
  [key: string]: any
}
export interface HealthChecker {
  name(): string
  build(data: AnyMap, error: any): AnyMap
  check(): Promise<AnyMap>
}

export async function check(checkers: HealthChecker[]): Promise<Health> {
  const health: Health = {
    status: "UP",
    details: {},
  }

  await Promise.all(
    checkers.map(async (checker) => {
      const sub: Health = {
        status: "UP",
      }

      try {
        const data = await checker.check()

        if (data && Object.keys(data).length > 0) {
          sub.data = data
        }
      } catch (err) {
        sub.status = "DOWN"
        health.status = "DOWN"
        sub.data = checker.build({}, err)
      }

      health.details![checker.name()] = sub
    }),
  )

  return health
}

export class HealthController {
  constructor(protected checkers: HealthChecker[]) {
    this.check = this.check.bind(this)
  }
  check(req: http.IncomingMessage, res: http.ServerResponse) {
    check(this.checkers).then((heath) => {
      if (heath.status === "UP") {
        res.writeHead(200, { "Content-Type": "application/json" })
        res.write(JSON.stringify(heath))
        res.end()
      } else {
        res.writeHead(500, { "Content-Type": "application/json" })
        res.write(JSON.stringify(heath))
        res.end()
      }
    })
  }
}
export const HealthHandler = HealthController

export interface NumberMap {
  [key: string]: number
}
export interface Context {
  [key: string]: string | number | boolean | Date
}
export interface LogMap {
  time: string
  level: string
  msg: string
}
export interface LogMapConfig {
  time?: string
  level?: string
  msg?: string
}
export interface Config {
  level?: string
  map?: LogMapConfig
  constants?: Context
  name?: Name
}
export interface Name {
  trace: string
  debug: string
  info: string
  warn: string
  error: string
  panic: string
  fatal: string
}
export interface Logger {
  name: Name
  level: number
  map: LogMap
  constants?: Context
  trace(msg: string, context?: Context, ctx?: any): void
  debug(msg: string, context?: Context, ctx?: any): void
  info(msg: string, context?: Context, ctx?: any): void
  warn(msg: string, context?: Context, ctx?: any): void
  error(msg: string, context?: Context, ctx?: any): void
  panic(msg: string, context?: Context, ctx?: any): void
  fatal(msg: string, context?: Context, ctx?: any): void
  isLevelEnabled(level: number): boolean
  isTraceEnabled(): boolean
  isDebugEnabled(): boolean
  isInfoEnabled(): boolean
  isWarnEnabled(): boolean
  isErrorEnabled(): boolean
  isPanicEnabled(): boolean
  isFatalEnabled(): boolean
}
// tslint:disable-next-line:max-classes-per-file
export class LogController {
  constructor(
    protected logger: Logger,
    protected updateLogger: (logger: Logger, config: Config, map?: NumberMap) => boolean,
    protected map?: NumberMap,
  ) {
    this.config = this.config.bind(this)
  }
  config(req: http.IncomingMessage, res: http.ServerResponse) {
    getBody(req).then((body) => {
      const obj: Config = JSON.parse(body)
      if (!obj || (obj as any) === "") {
        res.writeHead(400).end("The request body cannot be empty")
      }
      if (!this.logger) {
        res.writeHead(503).end("Logger is not available")
      }
      if (typeof obj.level === "string" && obj.level.length > 0) {
        if (!this.map) {
          res.writeHead(503).end("Map is not available")
        }
      }
      const changed = this.updateLogger(this.logger, obj, this.map)
      if (changed) {
        res.writeHead(200).end("true")
      } else {
        res.writeHead(204).end("false")
      }
    })
  }
}
export const LogHandler = LogController
export function getBody(req: http.IncomingMessage): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    try {
      let body = ""
      // listen to data sent by client
      req.on("data", (chunk: { toString: () => string }) => {
        // append the string version to the body
        body += chunk.toString()
      })
      // listen till the end
      req.on("end", () => {
        // send back the data
        resolve(body)
      })
    } catch (err) {
      reject(err)
    }
  })
}
