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
    details: {}
  };

  await Promise.all(
    checkers.map(async (checker) => {
      const sub: Health = {
        status: "UP"
      };

      try {
        const data = await checker.check();

        if (data && Object.keys(data).length > 0) {
          sub.data = data;
        }
      } catch (err) {
        sub.status = "DOWN";
        health.status = "DOWN";
        sub.data = checker.build({}, err);
      }

      health.details![checker.name()] = sub;
    })
  );

  return health;
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
