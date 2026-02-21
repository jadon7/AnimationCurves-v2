// Example Generated Expression Output
// This shows what the expression looks like when keyframes 2 and 5 are selected

// Rive - Elastic
// Parameters: amplitude=1, period=0.3, easingType=easeOut
// Check if there are enough keyframes
if (numKeys < 2) {
  value;
} else {
  // Find which keyframe segment we're in
  var n = 0;
  if (numKeys > 0) {
    n = nearestKey(time).index;
    if (key(n).time > time) {
      n--;
    }
  }

  // Boundary handling
  if (n === 0) {
    valueAtTime(key(1).time);
  } else if (n === numKeys) {
    valueAtTime(key(numKeys).time);
  } else {
    // Get current segment keyframes
    var key1 = key(n);
    var key2 = key(n + 1);
    var inPoint_k = key1.time;
    var outPoint_k = key2.time;
    var startVal = key1.value;
    var endVal = key2.value;

    // Check if this segment should use the curve
    var useCurve = false;
    if (n === 2 || n === 5) {
      useCurve = true;
    }

    if (useCurve) {
    // Calculate segment duration and progress t (0 to 1)
    var duration = outPoint_k - inPoint_k;
    var t = (duration <= 0) ? 1 : (time - inPoint_k) / duration;
    if (t <= 0) t = 0;
    if (t >= 1) t = 1;

    // Curve calculation
    var val;
    var p = 0.3;
    var a = Math.max(1, 1.0);
    var s = p / (2 * Math.PI) * Math.asin(1 / a);
    var easeType = "easeOut";
    if (t === 0) {
      val = 0;
    } else if (t === 1) {
      val = 1;
    } else if (easeType === "easeOut") {
      val = a * Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / p) + 1;
    } else if (easeType === "easeIn") {
      val = -(a * Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1 - s) * (2 * Math.PI) / p));
    } else {
      var t2 = t * 2;
      if (t2 < 1) {
        val = -0.5 * (a * Math.pow(2, 10 * (t2 - 1)) * Math.sin((t2 - 1 - s) * (2 * Math.PI) / p));
      } else {
        val = a * Math.pow(2, -10 * (t2 - 1)) * Math.sin((t2 - 1 - s) * (2 * Math.PI) / p) * 0.5 + 1;
      }
    }

    // Output final interpolation
    startVal + (endVal - startVal) * val;
    } else {
      // Use linear interpolation for non-selected segments
      value;
    }
  }
}
