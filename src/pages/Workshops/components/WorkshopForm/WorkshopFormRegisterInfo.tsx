import { useFormContext } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { WorkshopStatus } from '@/types/workshop'

export default function WorkshopFormRegisterInfo() {
  const { control } = useFormContext()

  return (
    <Card className='border-0 shadow-sm'>
      <CardHeader className='pb-4 border-b'>
        <CardTitle className='text-xl'>Thông tin đăng ký</CardTitle>
      </CardHeader>
      <CardContent className='pt-6'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
          <FormField
            control={control}
            name='totalFee'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phí tham gia</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    placeholder='0'
                    className='h-11'
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name='maxRegister'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số lượng đăng ký tối đa</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    placeholder='0'
                    className='h-11'
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name='maxPizzaPerRegister'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số pizza tối đa/đăng ký</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    placeholder='0'
                    className='h-11'
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name='maxParticipantPerRegister'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số người tối đa/đăng ký</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    placeholder='0'
                    className='h-11'
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='mt-6'>
          <FormField
            control={control}
            name='workshopStatus'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trạng thái</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className='h-11'>
                      <SelectValue placeholder='Chọn trạng thái' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={WorkshopStatus.Scheduled}>Đã lên lịch</SelectItem>
                    <SelectItem value={WorkshopStatus.Opening}>Đang mở</SelectItem>
                    <SelectItem value={WorkshopStatus.Closed}>Đã đóng</SelectItem>
                    <SelectItem value={WorkshopStatus.Approved}>Đã duyệt</SelectItem>
                    <SelectItem value={WorkshopStatus.Cancelled}>Đã hủy</SelectItem>
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
