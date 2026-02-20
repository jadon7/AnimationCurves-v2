# Module Interfaces

## 1. Curve Mathematics Module (curves-math.jsx)

### Exports
```javascript
// Constructor functions for all curves
function RiveElasticCurve(amplitude, period, easingType) {
    this.getValue = function(t) { /* ... */ };
}

function AndroidLinearCurve() {
    this.getValue = function(t) { /* ... */ };
}

// ... (all 26 curves)
```

### Interface
- **Input:** `t` (Number, 0.0-1.0) - normalized time
- **Output:** (Number, 0.0-1.0) - normalized value
- **Parameters:** Curve-specific (amplitude, period, tension, etc.)

---

## 2. UI Components Module (ui-components.jsx)

### Exports
```javascript
function createUI(viewModel) {
    // Returns ScriptUI Window object
}

function setupRiveTab(tab, viewModel) { /* ... */ }
function setupAndroidTab(tab, viewModel) { /* ... */ }
function setupIOSTab(tab, viewModel) { /* ... */ }
```

### Interface
- **Input:** `viewModel` (Object) - view model instance
- **Output:** ScriptUI Window object
- **Events:** onChange callbacks for curve/parameter changes

---

## 3. Expression Generator Module (expression-generator.jsx)

### Exports
```javascript
function ExpressionGenerator() {
    this.generate = function(platform, curveType, params) {
        // Returns AE expression string
    };
}
```

### Interface
- **Input:**
  - `platform` (String): "rive" | "android" | "ios"
  - `curveType` (String): curve name
  - `params` (Object): curve parameters
- **Output:** (String) - AE expression code

---

## 4. Data Model (model.js)

### Structure
```javascript
function Model() {
    this.platform = "rive";
    this.curveType = "elastic";
    this.params = {};
    
    this.setPlatform = function(platform) { /* ... */ };
    this.setCurveType = function(type) { /* ... */ };
    this.setParam = function(name, value) { /* ... */ };
    this.getParams = function() { /* ... */ };
}
```

---

## 5. View Model (viewmodel.js)

### Structure
```javascript
function ViewModel(model) {
    this.model = model;
    this.curveFactory = new CurveFactory();
    this.expressionGenerator = new ExpressionGenerator();
    
    this.generateExpression = function() { /* ... */ };
    this.applyCurve = function() { /* ... */ };
}
```

---

## Data Flow

```
User Input (UI)
    ↓
ViewModel.setParam()
    ↓
Model.setParam()
    ↓
ViewModel.generateExpression()
    ↓
ExpressionGenerator.generate()
    ↓
CurveFactory.createCurve()
    ↓
AE Expression String
    ↓
Apply to Keyframes
```
