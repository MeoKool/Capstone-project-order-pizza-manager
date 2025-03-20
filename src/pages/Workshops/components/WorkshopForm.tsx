import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Workshop, WorkshopStatus } from '@/types/workshop'
import ZoneService from '@/services/zone-service'
import WorkshopService from '@/services/workshop-service'
import { ZoneResponse } from '@/types/zone'

const formSchema = z.object({
  name: z.string().min(1, 'Tên workshop không được để trống'),
  header: z.string().min(1, 'Tiêu đề không được để trống'),
  description: z.string().min(1, 'Mô tả không được để trống'),
  location: z.string().min(1, 'Địa điểm không được để trống'),
  organizer: z.string().min(1, 'Người tổ chức không được để trống'),
  hotLineContact: z.string().min(1, 'Số hotline không được để trống'),
  workshopDate: z.string().min(1, 'Ngày diễn ra không được để trống'),
  startRegisterDate: z.string().min(1, 'Ngày bắt đầu đăng ký không được để trống'),
  endRegisterDate: z.string().min(1, 'Ngày kết thúc đăng ký không được để trống'),
  totalFee: z.number().min(0, 'Phí tham gia không được âm'),
  maxRegister: z.number().min(0, 'Số lượng đăng ký tối đa không được âm'),
  maxPizzaPerRegister: z.number().min(0, 'Số lượng pizza tối đa không được âm'),
  maxParticipantPerRegister: z.number().min(0, 'Số lượng người tham gia tối đa không được âm'),
  workshopStatus: z.string().min(1, 'Trạng thái không được để trống'),
  zoneId: z.string().min(1, 'Khu vực không được để trống')
})

type WorkshopFormProps = {
  initialData?: Workshop
  isEditing?: boolean
}

export default function WorkshopForm({ initialData, isEditing = false }: WorkshopFormProps) {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [zones, setZones] = useState<ZoneResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(isEditing && !initialData)
  const workshopService = WorkshopService.getInstance()
  const zoneService = ZoneService.getInstance()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          workshopDate: new Date(initialData.workshopDate).toISOString().slice(0, 16),
          startRegisterDate: new Date(initialData.startRegisterDate).toISOString().slice(0, 16),
          endRegisterDate: new Date(initialData.endRegisterDate).toISOString().slice(0, 16),
          totalFee: Number(initialData.totalFee),
          maxRegister: Number(initialData.maxRegister),
          maxPizzaPerRegister: Number(initialData.maxPizzaPerRegister),
          maxParticipantPerRegister: Number(initialData.maxParticipantPerRegister)
        }
      : {
          name: '',
          header: '',
          description: '',
          location: '',
          organizer: '',
          hotLineContact: '',
          workshopDate: '',
          startRegisterDate: '',
          endRegisterDate: '',
          totalFee: 0,
          maxRegister: 0,
          maxPizzaPerRegister: 0,
          maxParticipantPerRegister: 0,
          workshopStatus: WorkshopStatus.Scheduled,
          zoneId: ''
        }
  })

  useEffect(() => {
    fetchZones()

    if (isEditing && id && !initialData) {
      fetchWorkshop(id)
    }
  }, [id, isEditing, initialData])

  const fetchZones = async () => {
    try {
      const response = await zoneService.getAllZones()
      if (response.success) {
        setZones(response.result.items)
      }
    } catch (error) {
      console.error('Error fetching zones:', error)
    }
  }

  const fetchWorkshop = async (workshopId: string) => {
    try {
      setFetchingData(true)
      const response = await workshopService.getWorkshopById(workshopId)
      if (response.success) {
        const workshop = response.result
        form.reset({
          ...workshop,
          workshopDate: new Date(workshop.workshopDate).toISOString().slice(0, 16),
          startRegisterDate: new Date(workshop.startRegisterDate).toISOString().slice(0, 16),
          endRegisterDate: new Date(workshop.endRegisterDate).toISOString().slice(0, 16),
          totalFee: Number(workshop.totalFee),
          maxRegister: Number(workshop.maxRegister),
          maxPizzaPerRegister: Number(workshop.maxPizzaPerRegister),
          maxParticipantPerRegister: Number(workshop.maxParticipantPerRegister)
        })
      }
    } catch (error) {
      console.error('Error fetching workshop:', error)
    } finally {
      setFetchingData(false)
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)

      if (isEditing && id) {
        // const response = await workshopService.updateWorkshop(id, values)
        // if (response.success) {
        //   navigate('/workshops')
        // }
      } else {
        const response = await workshopService.createWorkshop(values)
        if (response.success) {
          navigate('/workshops')
        }
      }
    } catch (error) {
      console.error('Error saving workshop:', error)
    } finally {
      setLoading(false)
    }
  }

  if (fetchingData) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
      </div>
    )
  }

  return (
    <Card className='container mx-auto p-4'>
      <CardHeader>
        <CardTitle>{isEditing ? 'Chỉnh sửa workshop' : 'Tạo workshop mới'}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên workshop</FormLabel>
                    <FormControl>
                      <Input placeholder='Nhập tên workshop' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='header'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiêu đề</FormLabel>
                    <FormControl>
                      <Input placeholder='Nhập tiêu đề' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea placeholder='Nhập mô tả workshop' className='min-h-[100px]' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='location'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Địa điểm</FormLabel>
                    <FormControl>
                      <Input placeholder='Nhập địa điểm' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='organizer'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Người tổ chức</FormLabel>
                    <FormControl>
                      <Input placeholder='Nhập tên người tổ chức' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='hotLineContact'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số hotline</FormLabel>
                    <FormControl>
                      <Input placeholder='Nhập số hotline' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='zoneId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Khu vực</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
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

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <FormField
                control={form.control}
                name='workshopDate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thời gian diễn ra</FormLabel>
                    <FormControl>
                      <Input type='datetime-local' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='startRegisterDate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thời gian bắt đầu đăng ký</FormLabel>
                    <FormControl>
                      <Input type='datetime-local' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='endRegisterDate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thời gian kết thúc đăng ký</FormLabel>
                    <FormControl>
                      <Input type='datetime-local' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <FormField
                control={form.control}
                name='totalFee'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phí tham gia</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='0'
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='maxRegister'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số lượng đăng ký tối đa</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='0'
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='maxPizzaPerRegister'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số pizza tối đa/đăng ký</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='0'
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='maxParticipantPerRegister'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số người tối đa/đăng ký</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='0'
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='workshopStatus'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
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
          </CardContent>
          <CardFooter className='flex justify-between'>
            <Button type='button' variant='outline' onClick={() => navigate('/workshops')}>
              Hủy
            </Button>
            <Button type='submit' disabled={loading}>
              {loading ? (
                <>
                  <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent'></div>
                  Đang xử lý
                </>
              ) : isEditing ? (
                'Cập nhật'
              ) : (
                'Tạo mới'
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
