// components/workshop/WorkshopFormBasicInfo.tsx
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useFormContext } from 'react-hook-form'
import { ZoneResponse } from '@/types/zone'

type Props = {
  zones: ZoneResponse[]
}

export default function WorkshopFormBasicInfo({ zones }: Props) {
  const { control } = useFormContext()

  return (
    <Card className='border-0 shadow-sm'>
      <CardHeader className='pb-4 border-b'>
        <CardTitle className='text-xl'>Thông tin chung</CardTitle>
      </CardHeader>
      <CardContent className='pt-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <FormField
            control={control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên workshop</FormLabel>
                <FormControl>
                  <Input placeholder='Nhập tên workshop' {...field} className='h-11' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name='header'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tiêu đề</FormLabel>
                <FormControl>
                  <Input placeholder='Nhập tiêu đề' {...field} className='h-11' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='mt-6'>
          <FormField
            control={control}
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mô tả</FormLabel>
                <FormControl>
                  <Input placeholder='Nhập mô tả workshop' {...field} className='h-11' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
          <FormField
            control={control}
            name='location'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Địa điểm</FormLabel>
                <FormControl>
                  <Input placeholder='Nhập địa điểm' {...field} className='h-11' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name='organizer'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Người tổ chức</FormLabel>
                <FormControl>
                  <Input placeholder='Nhập tên người tổ chức' {...field} className='h-11' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
          <FormField
            control={control}
            name='hotLineContact'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số hotline</FormLabel>
                <FormControl>
                  <Input placeholder='Nhập số hotline' {...field} className='h-11' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name='zoneId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Khu vực</FormLabel>
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
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  )
}
