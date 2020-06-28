import {Request, Response} from 'express';

export enum Status {
  UP = 'UP',
  DOWN = 'DOWN'
}

export interface Health {
  status: Status;
  data?: any;
  details?: any;
}

export interface HealthService {
  name(): string;
  build(data: any, error: any): any;
  check(): Promise<any>;
}

// tslint:disable-next-line:class-name
export class health {
  static async check(services: HealthService[]): Promise<Health> {
    const p: Health = {
      status: Status.UP,
      details: {},
    };
    const total = services.length - 1;
    let count = 0;
    for (const service of services) {
      const sub: Health = {status: Status.UP};
      try {
        const r = await service.check();
        if (r && Object.keys(r).length > 0) {
          sub.data = r;
        }
        p.details[service.name()] = sub;
        if (count >= total) {
          return p;
        } else {
          count++;
        }
      } catch (err) {
        sub.status = Status.DOWN;
        p.status = Status.DOWN;
        sub.data = service.build({}, err);
        p.details[service.name()] = sub;
        if (count >= total) {
          return p;
        } else {
          count++;
        }
      }
    }
  }
}

export class HealthController {
  constructor(protected healthServices: HealthService[]) {
  }

  check(req: Request, res: Response) {
    health.check(this.healthServices).then(heath => {
      if (heath.status === Status.UP) {
        return res.status(200).json(heath);
      }
      return res.status(500).json(heath);
    });
  }
}
