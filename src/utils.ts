

export function debounce(func: () => void, timeout = 300) {
    let timer: NodeJS.Timeout;
    return (...args: any) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}