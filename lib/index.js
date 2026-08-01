var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
    function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
    function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
export function check(checkers) {
  return __awaiter(this, void 0, void 0, function* () {
    const health = {
      status: "UP",
      details: {},
    };
    yield Promise.all(checkers.map((checker) => __awaiter(this, void 0, void 0, function* () {
      const sub = {
        status: "UP",
      };
      try {
        const data = yield checker.check();
        if (data && Object.keys(data).length > 0) {
          sub.data = data;
        }
      }
      catch (err) {
        sub.status = "DOWN";
        health.status = "DOWN";
        sub.data = checker.build({}, err);
      }
      health.details[checker.name()] = sub;
    })));
    return health;
  });
}
export class HealthController {
  constructor(checkers) {
    this.checkers = checkers;
    this.check = this.check.bind(this);
  }
  check(req, res) {
    check(this.checkers).then((heath) => {
      if (heath.status === "UP") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.write(JSON.stringify(heath));
        res.end();
      }
      else {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.write(JSON.stringify(heath));
        res.end();
      }
    });
  }
}
export const HealthHandler = HealthController;
