const canvasEl = document.getElementById("drawSurface");
const canvasCtx = canvasEl.getContext("2d");
const angleReadout = document.getElementById("angleValue");
const hintText = document.getElementById("hint");
const toggleRedLineButton = document.getElementById("toggleLine1");
const toggleTealLineButton = document.getElementById("toggleLine2");
const setActiveRedButton = document.getElementById("setActiveLine1");
const setActiveTealButton = document.getElementById("setActiveLine2");

const linePalette = ["#ff6b6b", "#4ad6d1"];

const appState = {
  activeLineIndex: 0,
  activeDrag: null,
  lines: [
    { enabled: true, points: [] },
    { enabled: true, points: [] },
  ],
};

function toCanvasPoint(event) {
  const rect = canvasEl.getBoundingClientRect();
  const scaleX = canvasEl.width / rect.width;
  const scaleY = canvasEl.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function updateHint() {
  const line = appState.lines[appState.activeLineIndex];
  if (!line.enabled) {
    hintText.textContent = "Use the toggle buttons to re-enable a line.";
    return;
  }
  if (line.points.length < 2) {
    if (appState.activeLineIndex === 1 && appState.lines[0].points.length === 2) {
      hintText.textContent =
        "Teal line starts on the red line. Click to set its snapped start point.";
    } else {
      hintText.textContent = "Click to set endpoints for the active line.";
    }
  } else {
    hintText.textContent = "Drag endpoints to adjust. Use the active buttons to switch lines.";
  }
}

function clampPoint(point) {
  return {
    x: Math.max(0, Math.min(canvasEl.width, point.x)),
    y: Math.max(0, Math.min(canvasEl.height, point.y)),
  };
}

function closestPointOnSegment(segmentStart, segmentEnd, point) {
  const segmentVector = {
    x: segmentEnd.x - segmentStart.x,
    y: segmentEnd.y - segmentStart.y,
  };
  const pointVector = {
    x: point.x - segmentStart.x,
    y: point.y - segmentStart.y,
  };
  const segmentLengthSq =
    segmentVector.x * segmentVector.x + segmentVector.y * segmentVector.y;
  if (segmentLengthSq < 1e-6) {
    return { x: segmentStart.x, y: segmentStart.y };
  }
  const projection =
    (pointVector.x * segmentVector.x + pointVector.y * segmentVector.y) / segmentLengthSq;
  const clamped = Math.max(0, Math.min(1, projection));
  return {
    x: segmentStart.x + segmentVector.x * clamped,
    y: segmentStart.y + segmentVector.y * clamped,
  };
}

function lineIntersection(lineAStart, lineAEnd, lineBStart, lineBEnd) {
  const r = { x: lineAEnd.x - lineAStart.x, y: lineAEnd.y - lineAStart.y };
  const s = { x: lineBEnd.x - lineBStart.x, y: lineBEnd.y - lineBStart.y };
  const denom = r.x * s.y - r.y * s.x;
  if (Math.abs(denom) < 1e-6) {
    return null;
  }
  const u =
    ((lineBStart.x - lineAStart.x) * r.y - (lineBStart.y - lineAStart.y) * r.x) / denom;
  const t =
    ((lineBStart.x - lineAStart.x) * s.y - (lineBStart.y - lineAStart.y) * s.x) / denom;
  if (t < 0 || t > 1 || u < 0 || u > 1) {
    return null;
  }
  return {
    x: lineAStart.x + t * r.x,
    y: lineAStart.y + t * r.y,
  };
}

function angleBetweenLines(lineAStart, lineAEnd, lineBStart, lineBEnd) {
  const v1 = { x: lineAEnd.x - lineAStart.x, y: lineAEnd.y - lineAStart.y };
  const v2 = { x: lineBEnd.x - lineBStart.x, y: lineBEnd.y - lineBStart.y };
  const mag1 = Math.hypot(v1.x, v1.y);
  const mag2 = Math.hypot(v2.x, v2.y);
  if (mag1 < 1e-6 || mag2 < 1e-6) {
    return null;
  }
  const dot = v1.x * v2.x + v1.y * v2.y;
  const cosTheta = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
  return Math.acos(cosTheta);
}

function drawLine(points, color) {
  if (points.length < 2) return;
  canvasCtx.strokeStyle = color;
  canvasCtx.lineWidth = 3;
  canvasCtx.beginPath();
  canvasCtx.moveTo(points[0].x, points[0].y);
  canvasCtx.lineTo(points[1].x, points[1].y);
  canvasCtx.stroke();

  canvasCtx.fillStyle = color;
  points.forEach((point) => {
    canvasCtx.beginPath();
    canvasCtx.arc(point.x, point.y, 6, 0, Math.PI * 2);
    canvasCtx.fill();
  });
}

function drawIntersectionArc(intersection, angle, line1, line2) {
  if (!intersection || angle === null) return;
  const radius = 48;
  const vec1 = {
    x: line1[1].x - line1[0].x,
    y: line1[1].y - line1[0].y,
  };
  const vec2 = {
    x: line2[1].x - line2[0].x,
    y: line2[1].y - line2[0].y,
  };
  const angle1 = Math.atan2(vec1.y, vec1.x);
  const angle2 = Math.atan2(vec2.y, vec2.x);
  let start = angle1;
  let end = angle2;
  if (end < start) {
    [start, end] = [end, start];
  }
  if (end - start > Math.PI) {
    [start, end] = [end, start + Math.PI * 2];
  }

  canvasCtx.strokeStyle = "#ffcf6e";
  canvasCtx.lineWidth = 3;
  canvasCtx.beginPath();
  canvasCtx.arc(intersection.x, intersection.y, radius, start, end);
  canvasCtx.stroke();

  canvasCtx.fillStyle = "#ffcf6e";
  canvasCtx.beginPath();
  canvasCtx.arc(intersection.x, intersection.y, 4, 0, Math.PI * 2);
  canvasCtx.fill();
}

function render() {
  canvasCtx.clearRect(0, 0, canvasEl.width, canvasEl.height);

  appState.lines.forEach((line, index) => {
    if (!line.enabled) return;
    drawLine(line.points, linePalette[index]);
  });

  const line1 = appState.lines[0];
  const line2 = appState.lines[1];
  const hasLines =
    line1.enabled && line2.enabled && line1.points.length === 2 && line2.points.length === 2;

  if (hasLines) {
    const angle = angleBetweenLines(
      line1.points[0],
      line1.points[1],
      line2.points[0],
      line2.points[1]
    );
    if (angle !== null) {
      const degrees = (angle * 180) / Math.PI;
      angleReadout.textContent = `${degrees.toFixed(1)}°`;
    } else {
      angleReadout.textContent = "--";
    }

    const intersection = lineIntersection(
      line1.points[0],
      line1.points[1],
      line2.points[0],
      line2.points[1]
    );
    if (intersection && angle !== null) {
      drawIntersectionArc(intersection, angle, line1.points, line2.points);
    }
  } else {
    angleReadout.textContent = "--";
  }

  updateHint();
}

function setActiveLine(index) {
  appState.activeLineIndex = index;
  updateHint();
  syncButtonState();
}

function handlePointerDown(event) {
  const point = toCanvasPoint(event);
  const hitRadius = 10;

  for (let lineIndex = 0; lineIndex < appState.lines.length; lineIndex += 1) {
    const line = appState.lines[lineIndex];
    if (!line.enabled) continue;
    for (let pointIndex = 0; pointIndex < line.points.length; pointIndex += 1) {
      if (distance(point, line.points[pointIndex]) <= hitRadius) {
        appState.activeDrag = { lineIndex, pointIndex };
        setActiveLine(lineIndex);
        return;
      }
    }
  }

  const activeLine = appState.lines[appState.activeLineIndex];
  if (!activeLine.enabled) return;

  const targetLine = appState.lines[appState.activeLineIndex];
  const isTealLine = appState.activeLineIndex === 1;
  const redLine = appState.lines[0];

  if (targetLine.points.length < 2) {
    let nextPoint = point;
    if (isTealLine && targetLine.points.length === 0 && redLine.points.length === 2) {
      nextPoint = closestPointOnSegment(redLine.points[0], redLine.points[1], point);
    }
    targetLine.points.push(nextPoint);
  } else {
    let startPoint = point;
    if (isTealLine && redLine.points.length === 2) {
      startPoint = closestPointOnSegment(redLine.points[0], redLine.points[1], point);
    }
    targetLine.points = [startPoint];
  }

  render();
}

function handlePointerMove(event) {
  if (!appState.activeDrag) return;
  const point = clampPoint(toCanvasPoint(event));
  const { lineIndex, pointIndex } = appState.activeDrag;
  appState.lines[lineIndex].points[pointIndex] = point;
  render();
}

function handlePointerUp() {
  appState.activeDrag = null;
}

function toggleLine(lineIndex) {
  const line = appState.lines[lineIndex];
  line.enabled = !line.enabled;
  if (!line.enabled) {
    line.points = [];
  }
  if (line.enabled) {
    appState.activeLineIndex = lineIndex;
  } else if (appState.activeLineIndex === lineIndex) {
    appState.activeLineIndex = lineIndex === 0 ? 1 : 0;
  }
  render();
}

function syncButtonState() {
  toggleRedLineButton.classList.toggle("off", !appState.lines[0].enabled);
  toggleTealLineButton.classList.toggle("off", !appState.lines[1].enabled);
  toggleRedLineButton.textContent = appState.lines[0].enabled ? "Remove red line" : "Add red line";
  toggleTealLineButton.textContent = appState.lines[1].enabled ? "Remove teal line" : "Add teal line";

  setActiveRedButton.classList.toggle("active", appState.activeLineIndex === 0);
  setActiveTealButton.classList.toggle("active", appState.activeLineIndex === 1);
  setActiveRedButton.disabled = !appState.lines[0].enabled;
  setActiveTealButton.disabled = !appState.lines[1].enabled;
}

canvasEl.addEventListener("pointerdown", handlePointerDown);
canvasEl.addEventListener("pointermove", handlePointerMove);
canvasEl.addEventListener("pointerup", handlePointerUp);
canvasEl.addEventListener("pointerleave", handlePointerUp);

toggleRedLineButton.addEventListener("click", () => {
  toggleLine(0);
  syncButtonState();
});

toggleTealLineButton.addEventListener("click", () => {
  toggleLine(1);
  syncButtonState();
});

setActiveRedButton.addEventListener("click", () => {
  if (!appState.lines[0].enabled) return;
  setActiveLine(0);
  syncButtonState();
});

setActiveTealButton.addEventListener("click", () => {
  if (!appState.lines[1].enabled) return;
  setActiveLine(1);
  syncButtonState();
});

syncButtonState();
render();
