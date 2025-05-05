'use client'

import type React from 'react'

import { useFormContext } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'

// Hàm định dạng số thành tiền tệ VNĐ
const formatCurrency = (value: number): string => {
  return value.toLocaleString('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })
}

// Hàm chuyển đổi từ chuỗi tiền tệ sang số
const parseCurrency = (value: string): number => {
  // Loại bỏ tất cả dấu chấm và thay dấu phẩy bằng dấu chấm để parse thành số
  const normalized = value.replace(/\./g, '').replace(',', '.')
  return Number.parseFloat(normalized) || 0
}

type RegisterInfoProps = {
  disabled?: boolean
}

export default function WorkshopFormRegisterInfo({ disabled = false }: RegisterInfoProps) {
  const { control, setValue, watch } = useFormContext()
  const [formattedFee, setFormattedFee] = useState('')
  const totalFee = watch('totalFee')

  // Cập nhật giá trị hiển thị khi totalFee thay đổi
  useEffect(() => {
    if (totalFee !== undefined) {
      setFormattedFee(formatCurrency(totalFee))
    }
  }, [totalFee])

  const handleFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    // Nếu input rỗng, đặt giá trị là undefined thay vì 0
    if (!inputValue) {
      setValue('totalFee', undefined)
      setFormattedFee('')
      return
    }

    // Chỉ xử lý khi input chứa ký tự số, dấu chấm hoặc dấu phẩy
    if (/^[\d.,]+$/.test(inputValue)) {
      const numericValue = parseCurrency(inputValue)
      setValue('totalFee', numericValue)
      setFormattedFee(formatCurrency(numericValue))
    }
  }

  return (
    <div className='space-y-6'>
      {disabled && (
        <div className='p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-700'>
          <p>Khi cập nhật workshop, bạn không thể chỉnh sửa thông tin đăng ký.</p>
        </div>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <FormField
          control={control}
          name='totalFee'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Phí tham gia <span className='text-red-500'>*</span>
              </FormLabel>
              <FormControl>
                <div className='relative'>
                  <Input
                    type='text'
                    placeholder='Nhập phí tham gia'
                    className='h-11 pr-16 shadow-sm'
                    value={formattedFee}
                    onChange={handleFeeChange}
                    onBlur={field.onBlur}
                    disabled={disabled}
                  />
                  <div className='absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500 bg-gray-100 h-11 rounded-r-md border-l'>
                    VNĐ
                  </div>
                </div>
              </FormControl>
              <FormMessage className='text-red-500' />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name='maxRegister'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Số lượng đăng ký tối đa <span className='text-red-500'>*</span>
              </FormLabel>
              <FormControl>
                <div className='relative'>
                  <Input
                    type='number'
                    placeholder='Nhập số lượng đăng ký tối đa'
                    className='h-11 pr-16 shadow-sm'
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? undefined : Number(e.target.value)
                      field.onChange(value)
                    }}
                    disabled={disabled}
                  />
                  <div className='absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500 bg-gray-100 h-11 rounded-r-md border-l'>
                    người
                  </div>
                </div>
              </FormControl>
              <FormMessage className='text-red-500' />
            </FormItem>
          )}
        />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <FormField
          control={control}
          name='maxPizzaPerRegister'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Số pizza tối đa/đăng ký <span className='text-red-500'>*</span>
              </FormLabel>
              <FormControl>
                <div className='relative'>
                  <Input
                    type='number'
                    placeholder='Nhập số pizza tối đa'
                    className='h-11 pr-16 shadow-sm'
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? undefined : Number(e.target.value)
                      field.onChange(value)
                    }}
                    disabled={disabled}
                  />
                  <div className='absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500 bg-gray-100 h-11 rounded-r-md border-l'>
                    pizza
                  </div>
                </div>
              </FormControl>
              <FormMessage className='text-red-500' />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name='maxParticipantPerRegister'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Số người tối đa/đăng ký <span className='text-red-500'>*</span>
              </FormLabel>
              <FormControl>
                <div className='relative'>
                  <Input
                    type='number'
                    placeholder='Nhập số người tối đa'
                    className='h-11 pr-16 shadow-sm'
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? undefined : Number(e.target.value)
                      field.onChange(value)
                    }}
                    disabled={disabled}
                  />
                  <div className='absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500 bg-gray-100 h-11 rounded-r-md border-l'>
                    người
                  </div>
                </div>
              </FormControl>
              <FormMessage className='text-red-500' />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
