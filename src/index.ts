import {Request, Response} from 'express';

export enum Status {
  UP = 'UP',
  DOWN = 'DOWN'
}

export interface Health {
  status: Status;
  data?: Map<string, any>;
  details?: Map<string, Health>;
}

export interface HealthService {
  name(): string;
  build(data: Map<string, any>, error: any): Map<string, any>;
  check(): Promise<Map<string, any>>;
}

export async function check(services: HealthService[]): Promise<Health> {
  const p: Health = {
    status: Status.UP,
    details: new Map<string, Health>(),
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
      p.details.set(service.name(), sub);
      if (count >= total) {
        return p;
      } else {
        count++;
      }
    } catch (err) {
      sub.status = Status.DOWN;
      p.status = Status.DOWN;
      sub.data = service.build(new Map<string, any>(), err);
      p.details.set(service.name(), sub);
      if (count >= total) {
        return p;
      } else {
        count++;
      }
    }
  }
}

export class HealthController {
  constructor(protected healthServices: HealthService[]) {
    this.check = this.check.bind(this);
  }

  check(req: Request, res: Response) {
    check(this.healthServices).then(heath => {
      if (heath.status === Status.UP) {
        return res.status(200).json(heath);
      }
      return res.status(500).json(heath);
    });
  }
}
