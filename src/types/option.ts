
export interface Option {
    id: string;
    name: string;
    description: string;
    optionItems: OptionItem[];
}

export default interface OptionItem {
    id: string,
    name: string,
    additionalPrice: number
}