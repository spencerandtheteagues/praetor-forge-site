// Zero-rerender 60fps CSS-variable 3D tilt + light-pool tracker for 3D slabs & vitrines.
export function onTiltMove(e, disabled) {
  if (disabled) return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  if (!r.width || !r.height) return;
  const nx = (e.clientX - r.left) / r.width;
  const ny = (e.clientY - r.top) / r.height;
  const ry = ((nx - 0.5) * 11).toFixed(2);
  const rx = ((0.5 - ny) * 9).toFixed(2);
  el.style.setProperty("--mx", `${(nx * 100).toFixed(1)}%`);
  el.style.setProperty("--my", `${(ny * 100).toFixed(1)}%`);
  el.style.setProperty("--rx", `${rx}deg`);
  el.style.setProperty("--ry", `${ry}deg`);
}

export function onTiltLeave(e) {
  const el = e.currentTarget;
  el.style.removeProperty("--mx");
  el.style.removeProperty("--my");
  el.style.removeProperty("--rx");
  el.style.removeProperty("--ry");
}
