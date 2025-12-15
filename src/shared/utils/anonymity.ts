export const generateAnonymousUsername = (): string => {
    const prefix = 'User_';
    const randomId = Math.floor(Math.random() * 10000);
    return `${prefix}${randomId}`;
};

export const isUserAnonymous = (user: { isAnonymous: boolean }): boolean => {
    return user.isAnonymous;
};

export const toggleAnonymity = (user: { isAnonymous: boolean }): void => {
    user.isAnonymous = !user.isAnonymous;
};