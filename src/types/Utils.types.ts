export type IPrefixObject<Prefix extends string, Object extends Record<string, any>> = {
    [K in keyof Object as K extends string ? `${Prefix}_${K}` : never]: Object[K];
};