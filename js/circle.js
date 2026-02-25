/* =============================================================
   circle.js — SVG Circle of Fifths rendering and interaction
   Dispatches 'keySelected' CustomEvent on the SVG element
   when a segment is clicked.
   ============================================================= */

// SVG geometry constants
var CIRCLE_OUTER_R   = 175;   // outer edge of major ring
var CIRCLE_MID_R     = 118;   // boundary between major and minor rings
var CIRCLE_INNER_R   = 66;    // inner edge of minor ring (hub boundary)
var CIRCLE_LABEL_MAJ = 147;   // label radius for major ring
var CIRCLE_LABEL_MIN = 92;    // label radius for minor ring

// ---------------------------------------------------------------
// deg2rad(deg) — convert degrees to radians
// ---------------------------------------------------------------
function deg2rad(deg) {
  return deg * Math.PI / 180;
}

// ---------------------------------------------------------------
// polarToXY(r, angleDeg) — polar → Cartesian (SVG origin at center)
// ---------------------------------------------------------------
function polarToXY(r, angleDeg) {
  var rad = deg2rad(angleDeg);
  return {
    x: r * Math.cos(rad),
    y: r * Math.sin(rad)
  };
}

// ---------------------------------------------------------------
// createArcPath(innerR, outerR, startDeg, endDeg)
// Returns an SVG <path> element for a ring segment (wedge).
// ---------------------------------------------------------------
function createArcPath(innerR, outerR, startDeg, endDeg) {
  var p1 = polarToXY(outerR, startDeg);
  var p2 = polarToXY(outerR, endDeg);
  var p3 = polarToXY(innerR, endDeg);
  var p4 = polarToXY(innerR, startDeg);

  // Large arc flag: 0 because each slice is 30° < 180°
  var d = [
    'M', p1.x, p1.y,
    'A', outerR, outerR, 0, 0, 1, p2.x, p2.y,
    'L', p3.x, p3.y,
    'A', innerR, innerR, 0, 0, 0, p4.x, p4.y,
    'Z'
  ].join(' ');

  var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', d);
  return path;
}

// ---------------------------------------------------------------
// createArcLabel(r, angleDeg, text, cssClass)
// Returns an SVG <text> element positioned along an arc.
// ---------------------------------------------------------------
function createArcLabel(r, angleDeg, text, cssClass) {
  var pos = polarToXY(r, angleDeg);
  var el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  el.setAttribute('x', pos.x);
  el.setAttribute('y', pos.y);
  el.setAttribute('class', cssClass);
  el.textContent = text;
  return el;
}

// ---------------------------------------------------------------
// initCircle(svgElement)
// Draws all 24 arc segments + labels into the SVG.
// Called once on page load.
// ---------------------------------------------------------------
function initCircle(svgEl) {
  // Clear any previous content
  while (svgEl.firstChild) svgEl.removeChild(svgEl.firstChild);

  // Draw center hub
  var hub = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  hub.setAttribute('r', CIRCLE_INNER_R);
  hub.setAttribute('cx', 0);
  hub.setAttribute('cy', 0);
  hub.setAttribute('class', 'circle-center');
  svgEl.appendChild(hub);

  var hubText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  hubText.setAttribute('x', 0);
  hubText.setAttribute('y', 0);
  hubText.setAttribute('class', 'circle-center-text');
  hubText.textContent = '5ths';
  svgEl.appendChild(hubText);

  // Draw 12 major + 12 minor segments
  for (var i = 0; i < 12; i++) {
    // Each key occupies 30°. Key 0 (C) is at the top (−90°).
    // Segment spans ±15° around each key's center angle.
    var midAngle   = i * 30 - 90;
    var startAngle = midAngle - 15;
    var endAngle   = midAngle + 15;

    var majorKey = CIRCLE[i];
    var minorKey = REL_MINORS[i];

    // --- Major ring segment ---
    var majorArc = createArcPath(CIRCLE_MID_R, CIRCLE_OUTER_R, startAngle, endAngle);
    majorArc.setAttribute('class', 'arc-major');
    majorArc.dataset.index    = i;
    majorArc.dataset.key      = majorKey;
    majorArc.dataset.ringType = 'major';
    svgEl.appendChild(majorArc);

    // Major label
    var majorLabel = createArcLabel(CIRCLE_LABEL_MAJ, midAngle, majorKey, 'arc-label-major');
    majorLabel.dataset.index    = i;
    majorLabel.dataset.ringType = 'major';
    svgEl.appendChild(majorLabel);

    // --- Minor ring segment ---
    var minorArc = createArcPath(CIRCLE_INNER_R, CIRCLE_MID_R, startAngle, endAngle);
    minorArc.setAttribute('class', 'arc-minor');
    minorArc.dataset.index    = i;
    minorArc.dataset.key      = minorKey;
    minorArc.dataset.ringType = 'minor';
    svgEl.appendChild(minorArc);

    // Minor label
    var minorLabel = createArcLabel(CIRCLE_LABEL_MIN, midAngle, minorKey, 'arc-label-minor');
    minorLabel.dataset.index    = i;
    minorLabel.dataset.ringType = 'minor';
    svgEl.appendChild(minorLabel);
  }

  // Attach single delegated click handler on the SVG
  svgEl.addEventListener('click', function(e) {
    var target = e.target;
    var index = target.dataset && target.dataset.index;
    if (index === undefined || index === null || index === '') return;
    selectKey(svgEl, parseInt(index, 10));
  });
}

// ---------------------------------------------------------------
// selectKey(svgEl, circleIndex)
// Updates visual state of all segments and dispatches keySelected.
// ---------------------------------------------------------------
function selectKey(svgEl, circleIndex) {
  var neighbors = getNeighborIndices(circleIndex);

  // Reset all segments
  var allMajor = svgEl.querySelectorAll('.arc-major, .arc-label-major');
  var allMinor = svgEl.querySelectorAll('.arc-minor, .arc-label-minor');

  allMajor.forEach(function(el) {
    el.classList.remove('selected', 'neighbor-fifth', 'neighbor-fourth');
  });
  allMinor.forEach(function(el) {
    el.classList.remove('selected', 'neighbor-fifth', 'neighbor-fourth');
  });

  // Apply selected state to the clicked key
  svgEl.querySelectorAll('[data-index="' + circleIndex + '"]').forEach(function(el) {
    el.classList.add('selected');
  });

  // Apply neighbor-fifth (dominant, clockwise)
  svgEl.querySelectorAll('[data-index="' + neighbors.fifth + '"].arc-major, ' +
                         '[data-index="' + neighbors.fifth + '"].arc-label-major').forEach(function(el) {
    el.classList.add('neighbor-fifth');
  });

  // Apply neighbor-fourth (subdominant, counter-clockwise)
  svgEl.querySelectorAll('[data-index="' + neighbors.fourth + '"].arc-major, ' +
                         '[data-index="' + neighbors.fourth + '"].arc-label-major').forEach(function(el) {
    el.classList.add('neighbor-fourth');
  });

  // Dispatch custom event with the selected index
  var evt = new CustomEvent('keySelected', {
    detail: { circleIndex: circleIndex, key: CIRCLE[circleIndex] },
    bubbles: true
  });
  svgEl.dispatchEvent(evt);
}
