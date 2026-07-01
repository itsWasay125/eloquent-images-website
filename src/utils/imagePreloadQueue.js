const loadedImages = new Set();
const requests = new Map();
const queue = [];
const MAX_CONCURRENT_IMAGE_PRELOADS = 5;

let activeCount = 0;

function pumpQueue() {
  queue.sort((first, second) => second.priority - first.priority);

  while (activeCount < MAX_CONCURRENT_IMAGE_PRELOADS && queue.length > 0) {
    const item = queue.shift();
    item.status = 'active';
    activeCount += 1;

    const image = new Image();
    image.decoding = 'async';

    const finish = () => {
      loadedImages.add(item.src);
      requests.delete(item.src);
      activeCount -= 1;
      item.resolve(item.src);
      pumpQueue();
    };

    image.onload = () => {
      if (typeof image.decode === 'function') {
        image.decode().catch(() => undefined).finally(finish);
        return;
      }

      finish();
    };
    image.onerror = finish;
    image.src = item.src;
  }
}

export function preloadImage(src, priority = 0) {
  if (!src || typeof Image === 'undefined') {
    return Promise.resolve(src);
  }

  if (loadedImages.has(src)) {
    return Promise.resolve(src);
  }

  const existing = requests.get(src);
  if (existing) {
    if (existing.status === 'queued' && priority > existing.priority) {
      existing.priority = priority;
      pumpQueue();
    }

    return existing.promise;
  }

  let resolve;
  const promise = new Promise((done) => {
    resolve = done;
  });
  const item = {
    priority,
    promise,
    resolve,
    src,
    status: 'queued',
  };

  requests.set(src, item);
  queue.push(item);
  pumpQueue();

  return promise;
}
