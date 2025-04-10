'use client'

import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useFormContext } from 'react-hook-form'
import type { ProductModel } from '@/types/product'

type Props = {
  products: ProductModel[]
  handleProductSelect: (id: string, isChecked: boolean) => void
  isProductSelected: (id: string) => boolean
}

export default function WorkshopFormFoodMenu({ products, handleProductSelect, isProductSelected }: Props) {
  const { control } = useFormContext()

  return (
    <div className='space-y-6'>
      <div className='flex flex-col space-y-4'>
        <FormField
          control={control}
          name='productIds'
          render={({ fieldState }) => (
            <FormItem>
              <FormLabel>
                Pizza <span className='text-red-500'>*</span>
              </FormLabel>
              <p className='text-sm text-muted-foreground mt-2'>Vui lòng chọn ít nhất 1 món ăn</p>
              {fieldState.error && <FormMessage className='text-red-500'>{fieldState.error.message}</FormMessage>}
            </FormItem>
          )}
        />

        <div className='grid gap-4 mt-4'>
          {products.length === 0 ? (
            <p className='text-muted-foreground'>Không có sản phẩm nào</p>
          ) : (
            <Card>
              <CardContent className='pt-6'>
                <div className='grid gap-4'>
                  {products.map((product) => {
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
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
