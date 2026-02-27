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

class IOSDurationBounceCurve {
  constructor(duration = 0.2, bounce = 0.2) {
    this.duration = Math.max(duration, 0.01);
    this.bounce = Math.max(-1, Math.min(1, bounce));
  }

  getValue(t) {
    const clampedT = clamp01(t);
    if (clampedT === 0) return 0;
    if (clampedT === 1) return 1;

    const dampingFraction = 1.0 - this.bounce;
    const omega = 2 * Math.PI / this.duration;
    const tau = clampedT * this.duration * 2;

    if (dampingFraction < 1) {
      const omegaD = omega * Math.sqrt(1 - dampingFraction * dampingFraction);
      const envelope = Math.exp(-dampingFraction * omega * tau);
      return 1 - envelope * (Math.cos(omegaD * tau) + (dampingFraction * omega / omegaD) * Math.sin(omegaD * tau));
    }
    const envelope = Math.exp(-omega * tau);
    return 1 - envelope * (1 + omega * tau);
  }
}

class IOSResponseDampingCurve {
  constructor(response = 0.3, dampingFraction = 0.2) {
    this.response = Math.max(response, 0.01);
    this.dampingFraction = Math.max(dampingFraction, 0);
  }

  getValue(t) {
    const clampedT = clamp01(t);
    if (clampedT === 0) return 0;
    if (clampedT === 1) return 1;

    const omega = 2 * Math.PI / this.response;
    const zeta = this.dampingFraction;
    const tau = clampedT * this.response * 3;

    if (zeta < 1) {
      const omegaD = omega * Math.sqrt(1 - zeta * zeta);
      const envelope = Math.exp(-zeta * omega * tau);
      return 1 - envelope * (Math.cos(omegaD * tau) + (zeta * omega / omegaD) * Math.sin(omegaD * tau));
    }
    if (zeta === 1) {
      const envelope = Math.exp(-omega * tau);
      return 1 - envelope * (1 + omega * tau);
    }
    const r1 = -omega * (zeta + Math.sqrt(zeta * zeta - 1));
    const r2 = -omega * (zeta - Math.sqrt(zeta * zeta - 1));
    const C1 = r2 / (r2 - r1);
    const C2 = -r1 / (r2 - r1);
    return 1 - C1 * Math.exp(r1 * tau) - C2 * Math.exp(r2 * tau);
  }
}

class IOSPhysicsCurve {
  constructor(mass = 1.0, stiffness = 200.0, damping = 20.0) {
    this.mass = Math.max(mass, 0.01);
    this.stiffness = Math.max(stiffness, 0.01);
    this.damping = Math.max(damping, 0);
  }

  getValue(t) {
    const clampedT = clamp01(t);
    if (clampedT === 0) return 0;
    if (clampedT === 1) return 1;

    const z = this.damping / (2 * Math.sqrt(this.stiffness * this.mass));
    const w = Math.sqrt(this.stiffness / this.mass);
    const v = 0; // initialVelocity
    const s = -1; // from(0) - to(1)
    const c = w * z;
    const a = w * Math.sqrt(Math.abs(1 - z * z));

    // Calculate settling time based on damping regime
    let settlingTime;
    if (z < 1) {
      settlingTime = 4.0 / (Math.max(z, 0.001) * w);
    } else if (z === 1) {
      settlingTime = 4.0 / w;
    } else {
      const slowRoot = w * (z - Math.sqrt(z * z - 1));
      settlingTime = 4.0 / slowRoot;
    }
    settlingTime = Math.min(Math.max(settlingTime, 0.1), 10.0);
    const tau = clampedT * settlingTime;

    if (z > 1) {
      // Overdamped
      const A = a * s;
      const B = v + c * s;
      return 1 + (Math.exp(-c * tau) * (A * Math.cosh(a * tau) + B * Math.sinh(a * tau))) / a;
    } else if (z === 1) {
      // Critically damped
      const A = s;
      const B = v + c * s;
      return 1 + Math.exp(-c * tau) * (A + B * tau);
    } else {
      // Underdamped
      const A = s;
      const B = (v + c * s) / a;
      return 1 + Math.exp(-c * tau) * (A * Math.cos(a * tau) + B * Math.sin(a * tau));
    }
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
  constructor(stiffness = 450.0, dampingRatio = 0.5) {
    this.stiffness = Math.max(stiffness, 0.01);
    this.dampingRatio = Math.max(dampingRatio, 0);
  }

  getValue(t) {
    const clampedT = clamp01(t);
    if (clampedT === 0) return 0;
    if (clampedT === 1) return 1;

    const z = this.dampingRatio;
    const w = Math.sqrt(this.stiffness);
    const v = 0; // startVelocity
    const s = -1; // from(0) - to(1)
    const c = w * z;
    const a = w * Math.sqrt(Math.abs(1 - z * z));

    // Calculate settling time based on damping regime
    let settlingTime;
    if (z < 1) {
      settlingTime = 4.0 / (Math.max(z, 0.001) * w);
    } else if (z === 1) {
      settlingTime = 4.0 / w;
    } else {
      const slowRoot = w * (z - Math.sqrt(z * z - 1));
      settlingTime = 4.0 / slowRoot;
    }
    settlingTime = Math.min(Math.max(settlingTime, 0.1), 10.0);
    const tau = clampedT * settlingTime;

    if (z > 1) {
      // Overdamped
      const A = a * s;
      const B = v + c * s;
      return 1 + (Math.exp(-c * tau) * (A * Math.cosh(a * tau) + B * Math.sinh(a * tau))) / a;
    } else if (z === 1) {
      // Critically damped
      const A = s;
      const B = v + c * s;
      return 1 + Math.exp(-c * tau) * (A + B * tau);
    } else {
      // Underdamped
      const A = s;
      const B = (v + c * s) / a;
      return 1 + Math.exp(-c * tau) * (A * Math.cos(a * tau) + B * Math.sin(a * tau));
    }
  }
}

class AndroidFlingCurve {
  constructor(startVelocity = 2000.0, friction = 1.0) {
    this.startVelocity = startVelocity;
    this.friction = friction > 0 ? friction : 1.0;
  }

  getValue(t) {
    const clampedT = clamp01(t);
    if (clampedT === 0) return 0;
    if (clampedT === 1) return 1;

    const velocity = Math.abs(this.startVelocity);
    const frictionCoeff = this.friction * -4.2; // ExponentialDecayFriction = -4.2

    // Calculate fling duration: time until velocity effectively reaches 0
    const velocityThreshold = 0.01;
    const duration = Math.max(Math.log(velocityThreshold / velocity) / frictionCoeff, 0.1);

    const physicsTime = clampedT * duration;

    // Position: from - (velocity / friction) * (1 - exp(friction * t))
    const position = -(velocity / frictionCoeff) * (1 - Math.exp(frictionCoeff * physicsTime));
    const totalPosition = -(velocity / frictionCoeff) * (1 - Math.exp(frictionCoeff * duration));

    return position / totalPosition;
  }
}

// Curve Factory
class CurveFactory {
  createCurve(platform, curveType, params) {
    const p = platform.toLowerCase();
    const c = curveType.toLowerCase();

    if (p === 'rive' && c === 'elastic') {
      return new RiveElasticCurve(params.amplitude, params.period, params.easingType);
    }

    if (p === 'ios') {
      if (c === 'duration + bounce') {
        return new IOSDurationBounceCurve(params.duration, params.bounce);
      }
      if (c === 'response + damping') {
        return new IOSResponseDampingCurve(params.response, params.dampingFraction);
      }
      if (c === 'physics') {
        return new IOSPhysicsCurve(params.mass, params.stiffness, params.damping);
      }
    }

    if (p === 'folme' && c === 'spring') {
      return new FolmeSpringCurve(params.damping, params.response);
    }

    if (p === 'android') {
      if (c === 'spring') {
        return new AndroidSpringCurve(params.stiffness, params.dampingRatio);
      }
      if (c === 'fling') {
        return new AndroidFlingCurve(params.startVelocity, params.friction);
      }
    }

    throw new Error(`Unsupported curve: ${platform} / ${curveType}`);
  }
}
