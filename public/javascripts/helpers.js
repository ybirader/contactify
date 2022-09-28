export function htmlToDOM(html) {
  let container = document.createElement("div");
  container.classList.add("content-container");
  container.innerHTML = html;
  return container;
}

export function debounce(delay, fn) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(fn, delay, ...args);
  };
}
