// Main Application Logic
const csInterface = new CSInterface();
const curveFactory = new CurveFactory();

// Platform and Curve Definitions
const PLATFORM_DATA = {
  rive: {
    curves: [
      {
        name: 'Elastic',
        params: [
          { key: 'amplitude', label: 'Amplitude', type: 'slider', min: 1.0, max: 3.0, step: 0.01, defaultValue: 1.0 },
          { key: 'period', label: 'Period', type: 'slider', min: 0.1, max: 2.0, step: 0.01, defaultValue: 1.0 },
          { key: 'easingType', label: 'Easing Type', type: 'dropdown', options: ['Ease Out', 'Ease In', 'Ease In-Out'], defaultValue: 'Ease Out' }
        ]
      }
    ]
  },
  folme: {
    curves: [
      {
        name: 'Spring',
        params: [
          { key: 'damping', label: 'Damping', type: 'slider', min: 0.1, max: 1.0, step: 0.01, defaultValue: 0.95 },
          { key: 'response', label: 'Response', type: 'slider', min: 0.1, max: 1.0, step: 0.01, defaultValue: 0.35 }
        ]
      }
    ]
  },
  android: {
    curves: [
      {
        name: 'Spring',
        params: [
          { key: 'tension', label: 'Tension', type: 'slider', min: 10.0, max: 300.0, step: 1.0, defaultValue: 160.0 },
          { key: 'friction', label: 'Friction', type: 'slider', min: 0.0, max: 80.0, step: 0.1, defaultValue: 18.0 }
        ]
      }
    ]
  },
  ios: {
    curves: [
      { name: 'Spring Default', params: [
        { key: 'damping', label: 'Damping', type: 'slider', min: 0.1, max: 1.0, step: 0.01, defaultValue: 0.8 },
        { key: 'velocity', label: 'Velocity', type: 'slider', min: 0.0, max: 3.0, step: 0.01, defaultValue: 0.0 }
      ]},
      { name: 'Spring Gentle', params: [
        { key: 'damping', label: 'Damping', type: 'slider', min: 0.1, max: 1.0, step: 0.01, defaultValue: 0.9 },
        { key: 'velocity', label: 'Velocity', type: 'slider', min: 0.0, max: 3.0, step: 0.01, defaultValue: 0.0 }
      ]},
      { name: 'Spring Bouncy', params: [
        { key: 'damping', label: 'Damping', type: 'slider', min: 0.1, max: 1.0, step: 0.01, defaultValue: 0.5 },
        { key: 'velocity', label: 'Velocity', type: 'slider', min: 0.0, max: 3.0, step: 0.01, defaultValue: 0.2 }
      ]},
      { name: 'Spring Custom', params: [
        { key: 'damping', label: 'Damping', type: 'slider', min: 0.1, max: 1.0, step: 0.01, defaultValue: 0.7 },
        { key: 'velocity', label: 'Velocity', type: 'slider', min: 0.0, max: 3.0, step: 0.01, defaultValue: 0.0 }
      ]}
    ]
  }
};

// Application State
let currentPlatform = 'rive';
let currentCurve = null;
let currentParams = {};

// Initialize Application
function init() {
  setupTabs();
  setupCurveDropdown();
  switchPlatform('rive');
  setupCanvas();
}

// Setup Tab Buttons
function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      const platform = button.dataset.platform;
      switchPlatform(platform);
    });
  });
}

// Switch Platform
function switchPlatform(platform) {
  currentPlatform = platform;
  updateCurveDropdown();
  const firstCurve = PLATFORM_DATA[platform].curves[0];
  selectCurve(firstCurve);
}

// Update Curve Dropdown
function updateCurveDropdown() {
  const dropdown = document.getElementById('curve-dropdown');
  dropdown.innerHTML = '';

  const curves = PLATFORM_DATA[currentPlatform].curves;
  curves.forEach((curve, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = curve.name;
    dropdown.appendChild(option);
  });

  dropdown.addEventListener('change', () => {
    const curveIndex = parseInt(dropdown.value);
    const curve = PLATFORM_DATA[currentPlatform].curves[curveIndex];
    selectCurve(curve);
  });
}

// Setup Curve Dropdown (initial)
function setupCurveDropdown() {
  const dropdown = document.getElementById('curve-dropdown');
  dropdown.addEventListener('change', () => {
    const curveIndex = parseInt(dropdown.value);
    const curve = PLATFORM_DATA[currentPlatform].curves[curveIndex];
    selectCurve(curve);
  });
}

// Select Curve
function selectCurve(curveDef) {
  currentCurve = curveDef;
  currentParams = {};

  // Set default parameters
  curveDef.params.forEach(param => {
    if (param.key === 'easingType') {
      currentParams[param.key] = normalizeEasingType(param.defaultValue);
    } else {
      currentParams[param.key] = param.defaultValue;
    }
  });

  buildParameterControls(curveDef);
  updatePreview();
  applyToKeyframes();
}

// Build Parameter Controls
function buildParameterControls(curveDef) {
  const panel = document.getElementById('parameters-panel');
  panel.innerHTML = '';

  curveDef.params.forEach(param => {
    const row = document.createElement('div');
    row.className = 'param-row';

    const label = document.createElement('label');
    label.className = 'param-label';
    label.textContent = param.label;
    row.appendChild(label);

    if (param.type === 'dropdown') {
      const select = document.createElement('select');
      select.className = 'param-dropdown';
      param.options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        select.appendChild(opt);
      });
      select.value = param.defaultValue;
      select.addEventListener('change', () => {
        if (param.key === 'easingType') {
          currentParams[param.key] = normalizeEasingType(select.value);
        } else {
          currentParams[param.key] = select.value;
        }
        updatePreview();
        applyToKeyframes();
      });
      row.appendChild(select);
    } else {
      const sliderGroup = document.createElement('div');
      sliderGroup.className = 'param-slider-group';

      const minText = document.createElement('span');
      minText.className = 'param-min';
      minText.textContent = formatNumber(param.min, getDecimals(param.step));
      sliderGroup.appendChild(minText);

      const slider = document.createElement('input');
      slider.type = 'range';
      slider.className = 'param-slider';
      slider.min = param.min;
      slider.max = param.max;
      slider.step = param.step;
      slider.value = param.defaultValue;
      sliderGroup.appendChild(slider);

      const maxText = document.createElement('span');
      maxText.className = 'param-max';
      maxText.textContent = formatNumber(param.max, getDecimals(param.step));
      sliderGroup.appendChild(maxText);

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'param-input';
      input.value = formatNumber(param.defaultValue, getDecimals(param.step));
      sliderGroup.appendChild(input);

      // Slider input event (preview only)
      slider.addEventListener('input', () => {
        const value = parseFloat(slider.value);
        input.value = formatNumber(value, getDecimals(param.step));
        currentParams[param.key] = value;
        updatePreview();
      });

      // Slider change event (preview + apply)
      slider.addEventListener('change', () => {
        const value = parseFloat(slider.value);
        input.value = formatNumber(value, getDecimals(param.step));
        currentParams[param.key] = value;
        updatePreview();
        applyToKeyframes();
      });

      // Input change event
      input.addEventListener('change', () => {
        let value = parseFloat(input.value);
        if (isNaN(value)) {
          value = param.defaultValue;
        }
        value = Math.max(param.min, Math.min(param.max, value));
        slider.value = value;
        input.value = formatNumber(value, getDecimals(param.step));
        currentParams[param.key] = value;
        updatePreview();
        applyToKeyframes();
      });

      row.appendChild(sliderGroup);
    }

    panel.appendChild(row);
  });
}

// Update Preview Canvas
function updatePreview() {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  // Clear canvas
  ctx.fillStyle = '#141414';
  ctx.fillRect(0, 0, width, height);

  // Draw border
  ctx.strokeStyle = '#4a4a4a';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, width, height);

  try {
    // Create curve
    const curve = curveFactory.createCurve(currentPlatform, currentCurve.name, currentParams);

    // Draw curve
    ctx.strokeStyle = '#4d9aff';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const steps = 200;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const value = curve.getValue(t);
      const x = t * width;
      const y = height - (value * height);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
  } catch (err) {
    console.error('Preview error:', err);
  }
}

// Apply to Keyframes (calls ExtendScript)
function applyToKeyframes() {
  const script = `applyAnimationCurve('${currentPlatform}', '${currentCurve.name}', ${JSON.stringify(currentParams)})`;
  csInterface.evalScript(script);
}

// Setup Canvas
function setupCanvas() {
  updatePreview();
}

// Utility Functions
function formatNumber(value, decimals) {
  return value.toFixed(decimals);
}

function getDecimals(step) {
  const str = step.toString();
  const decimalIndex = str.indexOf('.');
  return decimalIndex === -1 ? 0 : str.length - decimalIndex - 1;
}

function normalizeEasingType(value) {
  const v = String(value || 'Ease Out').toLowerCase();
  if (v === 'ease in') return 'easeIn';
  if (v === 'ease in-out') return 'easeInOut';
  return 'easeOut';
}

// Initialize on load
window.addEventListener('load', init);
