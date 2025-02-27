import { Option } from "./option";

export interface ProductOption {
    id: string;
    productId: string;
    optionId: string;
    option: Option
}