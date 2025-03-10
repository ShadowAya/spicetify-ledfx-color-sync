export async function waitForImageLoad(img: HTMLImageElement) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    if (img.complete) {
      resolve(img);
    } else {
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Image failed to load"));
    }
  });
}

export async function waitForElement<T extends Element>(selector: string) {
  return new Promise<T | null>((resolve) => {
    const observer = new MutationObserver(() => {
      checkElement();
    });

    const checkElement = () => {
      const element = document.querySelector<T>(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    };

    checkElement();

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, 5000);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

export async function waitForImageElement(selector: string) {
  const img = await waitForElement<HTMLImageElement>(selector);
  if (!img) return null;

  await waitForImageLoad(img);
  img.crossOrigin = "anonymous";
  return img;
}
