export interface CategoryModel {
    id: string;
    name: string;
    description: string;
}
export interface CategoriesResult {
    items: CategoryModel[];
    totalCount: number;
}