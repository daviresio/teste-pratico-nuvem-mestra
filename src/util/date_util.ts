export const getDateFromString = (dataStr: string): Date => {
    const values: string[] = dataStr.split('-')
    // @ts-ignore Typescript nao consegue identificar que de fato tem valores neste array que estou espalhando
    return new Date(...values)
}