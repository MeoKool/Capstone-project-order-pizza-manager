
export interface Option {
    id: string;
    name: string;
    description: string;
    SelectMany: boolean
    optionItems: OptionItem[];
}

export default interface OptionItem {
    id: string,
    name: string,
    additionalPrice: number
}