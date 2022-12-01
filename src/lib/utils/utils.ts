export const addTrailingSlashToUrl = (url: string): string => {
    return url.replace(/\/?$/, '/');
};