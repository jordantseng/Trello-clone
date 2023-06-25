function debounce(cb: Function, timeout: number): (...args: any[]) => void {
  let timerId: ReturnType<typeof setTimeout>;

  return function (this: any, ...args: any[]): void {
    clearTimeout(timerId);

    timerId = setTimeout(() => {
      cb.apply(this, args);
    }, timeout);
  };
}

export default debounce;
