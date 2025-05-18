
const colorContainer = document.getElementById("color-container");
const colorPicker = document.getElementById("color-picker");
const hexCode = document.getElementById("hex-code");
const rgbCode = document.getElementById("rgb-code");
const hslCode = document.getElementById("hsl-code");

function hexToRgb(hex) {
  hex = hex.replace("#", "");
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  return `(${r}, ${g}, ${b})`;
}

function hexToHsl(hex) {
  hex = hex.replace("#", "");
  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
      case g: h = ((b - r) / d + 2); break;
      case b: h = ((r - g) / d + 4); break;
    }
    h /= 6;
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `(${h}, ${s}%, ${l}%)`;
}

function isDarkColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
  return luminance < 100;
}

function updateColor(color) {
  document.body.style.backgroundColor = color;
  colorPicker.value = color;
  hexCode.innerText = `HEX: ${color}`;
  rgbCode.innerText = `RGB: ${hexToRgb(color)}`;
  hslCode.innerText = `HSL: ${hexToHsl(color)}`;

  const isDark = isDarkColor(color);
  const container = document.getElementById("color-container");
  const tooltips = document.querySelectorAll(".tooltip");

  // Update tooltip background consistently
  tooltips.forEach(tip => {
    tip.style.backgroundColor = "#2e2e2e";
    tip.style.border = "1px solid white";
  });

  // 🟡 Conditional outline for dark colors
  if (isDark) {
    container.style.border = "1px solid rgba(255, 255, 255, 0.4)";
  } else {
    container.style.border = "1px solid transparent";
  }
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

colorContainer.addEventListener("click", async (event) => {
  const targetId = event.target.id;
  if (["hex-code", "rgb-code", "hsl-code", "color-picker"].includes(targetId)) return;

  if (!window.EyeDropper) {
    alert("EyeDropper API is not supported.");
    return;
  }

  try {
    const eyeDropper = new EyeDropper();
    const result = await eyeDropper.open();
    updateColor(result.sRGBHex);
    setTimeout(() => colorPicker.click(), 300);
  } catch (err) {
    console.error("EyeDropper canceled or failed", err);
  }
});

colorPicker.addEventListener("input", (event) => {
  updateColor(event.target.value);
});

hexCode.addEventListener("click", () => {
  navigator.clipboard.writeText(hexCode.innerText.split(": ")[1]);
  showToast(`Copied ${hexCode.innerText}`);
});

rgbCode.addEventListener("click", () => {
  navigator.clipboard.writeText(rgbCode.innerText.split(": ")[1]);
  showToast(`Copied ${rgbCode.innerText}`);
});

hslCode.addEventListener("click", () => {
  navigator.clipboard.writeText(hslCode.innerText.split(": ")[1]);
  showToast(`Copied ${hslCode.innerText}`);
});

const helpToggle = document.getElementById("help-toggle");
const tooltips = document.querySelectorAll(".tooltip");

function positionTooltips() {
  const container = document.getElementById("color-container");
  const colorPicker = document.getElementById("color-picker");
  const hex = document.getElementById("hex-code");

  const rectContainer = container.getBoundingClientRect();
  const rectCircle = colorPicker.getBoundingClientRect();
  const rectHex = hex.getBoundingClientRect();

  const tipBox = document.getElementById("tip-click-box");
  tipBox.style.top = `${rectContainer.top + rectContainer.height / 43}px`;
  tipBox.style.left = `${rectContainer.left - 260}px`;

  const tipCircle = document.getElementById("tip-color-circle");
  tipCircle.style.top = `${rectCircle.top + rectCircle.height / 2 - 25}px`;
  tipCircle.style.left = `${rectCircle.right + 20}px`;

  const tipCopy = document.getElementById("tip-copy-values");
  tipCopy.style.top = `${rectHex.top + rectHex.height / 2 + 33}px`;
  tipCopy.style.left = `${rectHex.right + 16}px`;
}

let tooltipsVisible = false;

helpToggle.addEventListener("click", () => {
  tooltipsVisible = !tooltipsVisible;
  tooltips.forEach(tip => {
    tip.classList.remove("fade-in", "fade-out");
    tip.classList.add(tooltipsVisible ? "fade-in" : "fade-out");
  });
  if (tooltipsVisible) positionTooltips();
});

window.addEventListener("resize", () => {
  if (tooltipsVisible) positionTooltips();
});

window.addEventListener("load", () => {
  tooltips.forEach(tip => tip.classList.add("fade-out"));
  positionTooltips();
});