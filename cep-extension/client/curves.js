// Curve Mathematics (converted from ExtendScript to modern JavaScript)

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

class RiveElasticCurve {
  constructor(amplitude = 1.0, period = 1.0, easingType = 'easeOut') {
    this.amplitude = amplitude;
    this.period = period > 0 ? period : 1.0;
    this.easingType = easingType;
  }

  getValue(t) {
    const clampedT = clamp01(t);
    if (clampedT === 0) return 0;
    if (clampedT === 1) return 1;

    const p = this.period;
    const a = Math.max(this.amplitude, 1.0);
    const s = p / (2 * Math.PI) * Math.asin(1 / a);

    if (this.easingType === 'easeIn') {
      return -(a * Math.pow(2, 10 * (clampedT - 1)) * Math.sin((clampedT - 1 - s) * (2 * Math.PI) / p));
    }

    if (this.easingType === 'easeInOut') {
      const t2 = clampedT * 2;
      if (t2 < 1) {
        return -0.5 * (a * Math.pow(2, 10 * (t2 - 1)) * Math.sin((t2 - 1 - s) * (2 * Math.PI) / p));
      }
      return a * Math.pow(2, -10 * (t2 - 1)) * Math.sin((t2 - 1 - s) * (2 * Math.PI) / p) * 0.5 + 1;
    }

    return a * Math.pow(2, -10 * clampedT) * Math.sin((clampedT - s) * (2 * Math.PI) / p) + 1;
  }
}

class IOSSpringCurve {
  constructor(damping = 0.8, velocity = 0.0) {
    this.damping = damping;
    this.velocity = velocity;
  }

  getValue(t) {
    const clampedT = clamp01(t);
    if (clampedT === 0) return 0;
    if (clampedT === 1) return 1;

    const damping = Math.max(this.damping, 0.0001);
    const referenceDuration = 1.0;
    const velocity = this.velocity;
    const omega = 12;
    const tau = clampedT * referenceDuration;
    const envelope = Math.exp(-damping * omega * tau);
    const sinCoeff = damping + velocity;
    return 1.0 - envelope * (Math.cos(omega * tau) + sinCoeff * Math.sin(omega * tau));
  }
}

class FolmeSpringCurve {
  constructor(damping = 0.95, response = 0.35) {
    this.damping = damping;
    this.response = response > 0 ? response : 0.35;
  }

  getValue(t) {
    const clampedT = clamp01(t);
    if (clampedT === 0) return 0;
    if (clampedT === 1) return 1;

    const damping = Math.max(this.damping, 0.0001);
    const response = Math.max(this.response, 0.0001);
    const referenceDuration = 1.0;

    const mass = 1;
    const tension = Math.pow(2 * Math.PI / response, 2) * mass;
    const dampingCoeff = Math.min(4 * Math.PI * damping * mass / response, 60);

    const physicsTime = clampedT * referenceDuration;
    const dt = 0.001;
    const steps = Math.floor(physicsTime / dt);
    let value = 0;
    let speed = 0;
    const target = 1;

    for (let i = 0; i < steps; i++) {
      let f = 0;
      f -= speed * dampingCoeff;
      f += tension * (target - value);
      speed += f * dt;
      value += speed * dt;
    }

    return value;
  }
}

class AndroidSpringCurve {
  constructor(tension = 160.0, friction = 18.0) {
    this.tension = tension > 0 ? tension : 160.0;
    this.friction = friction >= 0 ? friction : 18.0;
  }

  getValue(t) {
    const clampedT = clamp01(t);
    if (clampedT === 0) return 0;
    if (clampedT === 1) return 1;

    const k = this.tension;
    const c = this.friction;
    const physicsTime = clampedT;
    const delta = c * c - 4 * k;

    if (delta > 0) {
      const r1 = (-c + Math.sqrt(delta)) / 2;
      const r2 = (-c - Math.sqrt(delta)) / 2;
      const C1 = r2 / (r1 - r2);
      const C2 = -1 - C1;
      return 1 + C1 * Math.exp(r1 * physicsTime) + C2 * Math.exp(r2 * physicsTime);
    }

    if (delta === 0) {
      const r1 = -c / 2;
      return 1 + (-1 - r1 * physicsTime) * Math.exp(r1 * physicsTime);
    }

    const omega = Math.sqrt(4 * k - c * c) / 2;
    const B = -c / (2 * omega);
    return 1 - Math.exp(-c * physicsTime / 2) * (Math.cos(omega * physicsTime) + B * Math.sin(omega * physicsTime));
  }
}

// Curve Factory
class CurveFactory {
  createCurve(platform, curveType, params) {
    const p = platform.toLowerCase();
    const c = curveType.toLowerCase();

    if (p === 'rive' && c === 'elastic') {
      return new RiveElasticCurve(
        params.amplitude,
        params.period,
        params.easingType
      );
    }

    if (p === 'ios') {
      return new IOSSpringCurve(params.damping, params.velocity);
    }

    if (p === 'folme' && c === 'spring') {
      return new FolmeSpringCurve(params.damping, params.response);
    }

    if (p === 'android' && c === 'spring') {
      return new AndroidSpringCurve(params.tension, params.friction);
    }

    throw new Error(`Unsupported curve: ${platform} / ${curveType}`);
  }
}
