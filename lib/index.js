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
    const p = { status: "UP" };
    const total = checkers.length - 1;
    let count = 0;
    p.details = {};
    for (const checker of checkers) {
      const sub = { status: "UP" };
      try {
        const r = yield checker.check();
        if (r && Object.keys(r).length > 0) {
          sub.data = r;
        }
        p.details[checker.name()] = sub;
        if (count >= total) {
          return p;
        }
        else {
          count++;
        }
      }
      catch (err) {
        sub.status = "DOWN";
        p.status = "DOWN";
        sub.data = checker.build({}, err);
        p.details[checker.name()] = sub;
        if (count >= total) {
          return p;
        }
        else {
          count++;
        }
      }
    }
    return p;
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
