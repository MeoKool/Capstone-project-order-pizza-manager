'use client'

import { useState, useEffect } from 'react'
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useFormContext } from 'react-hook-form'
import { Loader2, ChevronRight } from 'lucide-react'
import type { ProductModel } from '@/types/product'
import type { CategoryModel } from '@/types/category'
import CategoryService from '@/services/category-service'

type Props = {
  products: ProductModel[]
  handleProductSelect: (id: string, isChecked: boolean) => void
  isProductSelected: (id: string) => boolean
  disabled?: boolean
}

export default function WorkshopFormFoodMenu({
  products,
  handleProductSelect,
  isProductSelected,
  disabled = false
}: Props) {
  const { control } = useFormContext()
  const [categories, setCategories] = useState<CategoryModel[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [filteredProducts, setFilteredProducts] = useState<ProductModel[]>(products)
  const [loading, setLoading] = useState(false)

  // Fetch all categories on component mount
  useEffect(() => {
    if (!disabled) {
      fetchCategories()
    }
  }, [disabled])

  // Update filtered products when products prop changes
  useEffect(() => {
    if (selectedCategory) {
      const filtered = products.filter((product) => product.categoryId === selectedCategory)
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts(products)
    }
  }, [products, selectedCategory])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const categoryService = CategoryService.getInstance()
      const response = await categoryService.getAllCategories()

      if (response.success) {
        const sortedCategories = response.result.items.sort((a, b) => a.name.localeCompare(b.name))
        setCategories(sortedCategories)

        // Find the Pizza category and select it by default
        const pizzaCategory = sortedCategories.find((category) => category.name.toLowerCase() === 'pizza')

        if (pizzaCategory) {
          setSelectedCategory(pizzaCategory.id)
        } else if (sortedCategories.length > 0) {
          // If no Pizza category, select the first one
          setSelectedCategory(sortedCategories[0].id)
        }
      } else {
        console.error('Failed to fetch categories:', response.message)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
  }

  return (
    <div className='space-y-6'>
      {disabled && (
        <div className='p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-700'>
          <p>Khi cập nhật workshop, bạn không thể chỉnh sửa thông tin thực đơn.</p>
        </div>
      )}

      <div className='flex flex-col space-y-4'>
        <FormField
          control={control}
          name='productIds'
          render={({ fieldState }) => (
            <FormItem>
              <FormLabel>
                Chọn món ăn <span className='text-red-500'>*</span>
              </FormLabel>
              <p className='text-sm text-muted-foreground mt-2'>Vui lòng chọn ít nhất 1 món ăn</p>
              {fieldState.error && <FormMessage className='text-red-500'>{fieldState.error.message}</FormMessage>}
            </FormItem>
          )}
        />

        <Card>
          <CardContent className='p-0'>
            <div className='flex flex-col md:flex-row'>
              {/* Category list */}
              <div className='w-full md:w-1/3 border-r border-gray-200'>
                <div className='p-4 font-medium text-gray-700'>Danh mục</div>
                <div className='max-h-[400px] overflow-y-auto'>
                  {loading ? (
                    <div className='flex justify-center items-center h-32'>
                      <Loader2 className='h-6 w-6 animate-spin text-primary' />
                    </div>
                  ) : (
                    <ul className='divide-y'>
                      {categories.map((category) => (
                        <li key={category.id}>
                          <button
                            type='button'
                            onClick={() => handleCategorySelect(category.id)}
                            disabled={disabled}
                            className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                              selectedCategory === category.id ? 'bg-gray-100 font-medium' : ''
                            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <span>{category.name}</span>
                            {selectedCategory === category.id && <ChevronRight className='h-4 w-4 text-primary' />}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Product list */}
              <div className='w-full md:w-2/3 p-4'>
                <div className='font-medium text-gray-700 mb-4'>
                  {selectedCategory
                    ? `Món ăn - ${categories.find((c) => c.id === selectedCategory)?.name || ''}`
                    : 'Tất cả món ăn'}
                </div>
                <div className='max-h-[400px] overflow-y-auto'>
                  {filteredProducts.length === 0 ? (
                    <p className='text-muted-foreground'>Không có sản phẩm nào trong danh mục này</p>
                  ) : (
                    <div className='grid gap-4'>
                      {filteredProducts.map((product) => {
                        const checked = isProductSelected(product.id)
                        return (
                          <div
                            key={product.id}
                            className={`flex items-start space-x-3 p-4 border rounded-lg transition-all ${
                              checked ? 'border-green-500 bg-green-50' : 'hover:bg-gray-50 border-gray-200'
                            }`}
                          >
                            <Checkbox
                              id={`product-${product.id}`}
                              checked={checked}
                              onCheckedChange={(checked) => handleProductSelect(product.id, checked as boolean)}
                              disabled={disabled}
                            />
                            <div className='grid gap-1.5 leading-none'>
                              <Label htmlFor={`product-${product.id}`} className='text-sm font-semibold'>
                                {product.name}
                              </Label>
                              <p className='text-sm text-muted-foreground'>
                                {product.description} - {product.price.toLocaleString('vi-VN')}đ
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
