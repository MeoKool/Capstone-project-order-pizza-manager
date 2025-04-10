import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useFormContext } from 'react-hook-form'
import type { ZoneResponse } from '@/types/zone'

type Props = {
  zones: ZoneResponse[]
}

export default function WorkshopFormBasicInfo({ zones }: Props) {
  const { control } = useFormContext()

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <FormField
          control={control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Tên workshop <span className='text-red-500'>*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder='Nhập tên workshop' {...field} className='h-11' />
              </FormControl>
              <FormMessage className='text-red-500' />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name='header'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Tiêu đề <span className='text-red-500'>*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder='Nhập tiêu đề' {...field} className='h-11' />
              </FormControl>
              <FormMessage className='text-red-500' />
            </FormItem>
          )}
        />
      </div>

      <div>
        <FormField
          control={control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Mô tả <span className='text-red-500'>*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder='Nhập mô tả workshop' {...field} className='h-11' />
              </FormControl>
              <FormMessage className='text-red-500' />
            </FormItem>
          )}
        />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <FormField
          control={control}
          name='location'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Địa điểm <span className='text-red-500'>*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder='Nhập địa điểm' {...field} className='h-11' />
              </FormControl>
              <FormMessage className='text-red-500' />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name='organizer'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Người tổ chức <span className='text-red-500'>*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder='Nhập tên người tổ chức' {...field} className='h-11' />
              </FormControl>
              <FormMessage className='text-red-500' />
            </FormItem>
          )}
        />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <FormField
          control={control}
          name='hotLineContact'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Số hotline <span className='text-red-500'>*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder='Nhập số hotline' {...field} className='h-11' />
              </FormControl>
              <FormMessage className='text-red-500' />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name='zoneId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Khu vực <span className='text-red-500'>*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className='h-11'>
                    <SelectValue placeholder='Chọn khu vực' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {zones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className='text-red-500' />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
