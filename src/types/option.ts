
export interface OptionResult {
    items: Option[];
    totalCount: number;
}


export interface Option {
    id: string;
    name: string;
    description: string;
    selectMany: boolean
    optionItems: OptionItem[];
}

export default interface OptionItem {
    id: string,
    name: string,
    additionalPrice: number
}