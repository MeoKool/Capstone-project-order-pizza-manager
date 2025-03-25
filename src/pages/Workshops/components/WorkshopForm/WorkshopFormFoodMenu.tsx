import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { CategoryModel } from '@/types/category'
import { ProductModel } from '@/types/product'

type Props = {
  categories: CategoryModel[]
  selectedCategory: string
  setSelectedCategory: (id: string) => void
  products: ProductModel[]
  handleProductSelect: (productId: string, isChecked: boolean) => void
  isProductSelected: (productId: string) => boolean
}

export default function WorkshopFormFoodMenu({
  categories,
  selectedCategory,
  setSelectedCategory,
  products,
  handleProductSelect,
  isProductSelected
}: Props) {
  return (
    <Card className='border shadow-sm rounded-xl overflow-hidden'>
      <CardContent className='pt-6 px-6'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
          {/* Danh mục */}
          <div className='md:col-span-1'>
            <div className='flex items-center justify-between mb-3'>
              <h3 className='text-base font-medium text-gray-800'>Danh mục</h3>
              <span className='text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full'>{categories.length}</span>
            </div>
            <div className='border rounded-lg overflow-hidden shadow-sm'>
              <ScrollArea className='h-[500px]'>
                <div className='p-3'>
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? 'green' : 'ghost'}
                      className={`w-full justify-start mb-2 font-normal ${
                        selectedCategory === category.id
                          ? 'text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Danh sách sản phẩm */}
          <div className='md:col-span-3'>
            <div className='flex items-center justify-between mb-3'>
              <h3 className='text-base font-medium text-gray-800'>Sản phẩm</h3>
              <span className='text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full'>{products.length}</span>
            </div>
            <div className='border rounded-lg shadow-sm'>
              <ScrollArea className='h-[500px]'>
                <div className='p-4'>
                  {products.length === 0 ? (
                    <div className='flex flex-col items-center justify-center py-12 text-center'>
                      <div className='w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-3'>
                        <span className='text-muted-foreground text-xl'>🍽️</span>
                      </div>
                      <p className='text-center text-muted-foreground'>Không có sản phẩm nào trong danh mục này</p>
                    </div>
                  ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      {products.map((product) => {
                        const checked = isProductSelected(product.id)
                        return (
                          <div
                            key={product.id}
                            className={`flex items-start space-x-3 p-4 border rounded-lg transition-all ${
                              checked ? 'border-primary/50 bg-primary/5' : 'hover:bg-muted/30 border-muted'
                            }`}
                          >
                            <Checkbox
                              id={`product-${product.id}`}
                              checked={checked}
                              onCheckedChange={(checked) => handleProductSelect(product.id, Boolean(checked))}
                              className='mt-1'
                            />
                            <label htmlFor={`product-${product.id}`} className='flex flex-1 flex-col cursor-pointer'>
                              <span className='font-medium text-base'>{product.name}</span>
                              <span className='text-sm text-muted-foreground line-clamp-2 mt-1'>
                                {product.description}
                              </span>
                              <span className='text-sm font-medium mt-2 text-primary'>
                                {product.price?.toLocaleString('vi-VN')} đ
                              </span>
                            </label>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
