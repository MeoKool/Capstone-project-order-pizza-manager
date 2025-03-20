import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format, setHours, setMinutes, getHours, getMinutes } from 'date-fns'
import { vi } from 'date-fns/locale'
import { CalendarIcon, Clock } from 'lucide-react'
import { CategoryModel } from '@/types/category'
import { ProductModel } from '@/types/product'
import { Workshop, WorkshopFoodDetail, WorkshopStatus } from '@/types/workshop'
import { ZoneResponse } from '@/types/zone'
import WorkshopService from '@/services/workshop-service'
import ZoneService from '@/services/zone-service'
import CategoryService from '@/services/category-service'
import ProductService from '@/services/product-service'
import { cn } from '@/utils/utils'

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
  zoneId: z.string().min(1, 'Khu vực không được để trống'),
  zone: z.any().optional(),
  zoneName: z.string().optional(),
  workshopFoodDetails: z.array(z.any()).optional()
})

type WorkshopFormProps = {
  initialData?: Workshop
  isEditing?: boolean
}

export default function WorkshopForm({ initialData, isEditing = false }: WorkshopFormProps) {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [zones, setZones] = useState<ZoneResponse[]>([])
  const [categories, setCategories] = useState<CategoryModel[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [products, setProducts] = useState<ProductModel[]>([])
  const [selectedProducts, setSelectedProducts] = useState<WorkshopFoodDetail[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(isEditing && !initialData)

  // Date state for calendar
  const [workshopDate, setWorkshopDate] = useState<Date | undefined>(
    initialData ? new Date(initialData.workshopDate) : undefined
  )
  const [startRegisterDate, setStartRegisterDate] = useState<Date | undefined>(
    initialData ? new Date(initialData.startRegisterDate) : undefined
  )
  const [endRegisterDate, setEndRegisterDate] = useState<Date | undefined>(
    initialData ? new Date(initialData.endRegisterDate) : undefined
  )

  // Time state for each date
  const [workshopTime, setWorkshopTime] = useState<{ hour: string; minute: string }>({
    hour: initialData ? String(getHours(new Date(initialData.workshopDate))).padStart(2, '0') : '00',
    minute: initialData ? String(getMinutes(new Date(initialData.workshopDate))).padStart(2, '0') : '00'
  })
  const [startRegisterTime, setStartRegisterTime] = useState<{ hour: string; minute: string }>({
    hour: initialData ? String(getHours(new Date(initialData.startRegisterDate))).padStart(2, '0') : '00',
    minute: initialData ? String(getMinutes(new Date(initialData.startRegisterDate))).padStart(2, '0') : '00'
  })
  const [endRegisterTime, setEndRegisterTime] = useState<{ hour: string; minute: string }>({
    hour: initialData ? String(getHours(new Date(initialData.endRegisterDate))).padStart(2, '0') : '00',
    minute: initialData ? String(getMinutes(new Date(initialData.endRegisterDate))).padStart(2, '0') : '00'
  })

  const workshopService = WorkshopService.getInstance()
  const zoneService = ZoneService.getInstance()
  const categoryService = CategoryService.getInstance()
  const productService = ProductService.getInstance()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          workshopDate: initialData.workshopDate,
          startRegisterDate: initialData.startRegisterDate,
          endRegisterDate: initialData.endRegisterDate,
          totalFee: Number(initialData.totalFee),
          maxRegister: Number(initialData.maxRegister),
          maxPizzaPerRegister: Number(initialData.maxPizzaPerRegister),
          maxParticipantPerRegister: Number(initialData.maxParticipantPerRegister),
          workshopStatus: initialData.workshopStatus || WorkshopStatus.Scheduled
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
          zoneId: '',
          zone: null,
          zoneName: '',
          workshopFoodDetails: []
        }
  })

  useEffect(() => {
    fetchZones()
    fetchCategories()

    if (isEditing && id && !initialData) {
      fetchWorkshop(id)
    }
  }, [id, isEditing, initialData])

  useEffect(() => {
    if (initialData?.workshopFoodDetails) {
      setSelectedProducts(initialData.workshopFoodDetails)
    }
  }, [initialData])

  useEffect(() => {
    if (selectedCategory) {
      fetchProductsByCategory(selectedCategory)
    }
  }, [selectedCategory])

  // Update form values when dates change
  useEffect(() => {
    if (workshopDate) {
      const dateWithTime = setHours(
        setMinutes(workshopDate, Number.parseInt(workshopTime.minute)),
        Number.parseInt(workshopTime.hour)
      )
      form.setValue('workshopDate', dateWithTime.toISOString())
    }
  }, [workshopDate, workshopTime, form])

  useEffect(() => {
    if (startRegisterDate) {
      const dateWithTime = setHours(
        setMinutes(startRegisterDate, Number.parseInt(startRegisterTime.minute)),
        Number.parseInt(startRegisterTime.hour)
      )
      form.setValue('startRegisterDate', dateWithTime.toISOString())
    }
  }, [startRegisterDate, startRegisterTime, form])

  useEffect(() => {
    if (endRegisterDate) {
      const dateWithTime = setHours(
        setMinutes(endRegisterDate, Number.parseInt(endRegisterTime.minute)),
        Number.parseInt(endRegisterTime.hour)
      )
      form.setValue('endRegisterDate', dateWithTime.toISOString())
    }
  }, [endRegisterDate, endRegisterTime, form])

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

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllCategories()
      if (response.success) {
        setCategories(response.result.items)
        if (response.result.items.length > 0) {
          setSelectedCategory(response.result.items[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchProductsByCategory = async (categoryId: string) => {
    try {
      const response = await productService.getProductsByCategory(categoryId)
      if (response.success) {
        setProducts(response.result.items)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
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
          totalFee: Number(workshop.totalFee),
          maxRegister: Number(workshop.maxRegister),
          maxPizzaPerRegister: Number(workshop.maxPizzaPerRegister),
          maxParticipantPerRegister: Number(workshop.maxParticipantPerRegister)
        })

        // Set date and time states
        const workshopDateObj = new Date(workshop.workshopDate)
        const startRegisterDateObj = new Date(workshop.startRegisterDate)
        const endRegisterDateObj = new Date(workshop.endRegisterDate)

        setWorkshopDate(workshopDateObj)
        setStartRegisterDate(startRegisterDateObj)
        setEndRegisterDate(endRegisterDateObj)

        setWorkshopTime({
          hour: String(getHours(workshopDateObj)).padStart(2, '0'),
          minute: String(getMinutes(workshopDateObj)).padStart(2, '0')
        })

        setStartRegisterTime({
          hour: String(getHours(startRegisterDateObj)).padStart(2, '0'),
          minute: String(getMinutes(startRegisterDateObj)).padStart(2, '0')
        })

        setEndRegisterTime({
          hour: String(getHours(endRegisterDateObj)).padStart(2, '0'),
          minute: String(getMinutes(endRegisterDateObj)).padStart(2, '0')
        })

        setSelectedProducts(workshop.workshopFoodDetails || [])
      }
    } catch (error) {
      console.error('Error fetching workshop:', error)
    } finally {
      setFetchingData(false)
    }
  }

  const handleProductSelect = (product: ProductModel, isChecked: boolean) => {
    if (isChecked) {
      // Add product to selected products
      setSelectedProducts([
        ...selectedProducts,
        {
          id: crypto.randomUUID(),
          productId: product.id,
          product: null
        }
      ])
    } else {
      // Remove product from selected products
      setSelectedProducts(selectedProducts.filter((item) => item.productId !== product.id))
    }
  }

  const isProductSelected = (productId: string) => {
    return selectedProducts.some((item) => item.productId === productId)
  }

  // Generate hours and minutes for select options
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

  const onSubmit = async () => {
    try {
      setLoading(true)

      // Bổ sung các trường còn thiếu
      // const workshopData = {
      //   ...values,
      //   zone: null,
      //   zoneName: zones.find((zone) => zone.id === values.zoneId)?.name || '',
      //   workshopFoodDetails: selectedProducts
      // }

      // if (isEditing && id) {
      //   const response = await workshopService.updateWorkshop(id, workshopData)
      //   if (response.success) {
      //     navigate('/workshops')
      //   }
      // } else {
      //   const response = await workshopService.createWorkshop(workshopData)
      //   if (response.success) {
      //     navigate('/workshops')
      //   }
      // }
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
    <div className='container mx-auto py-6'>
      <div className='mb-6'>
        <p className='text-muted-foreground'>Điền thông tin chi tiết để {isEditing ? 'cập nhật' : 'tạo'} workshop</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
          <Tabs defaultValue='basic' className='w-full'>
            <TabsList className='grid grid-cols-2 h-12 rounded-xl p-1 bg-muted shadow-sm'>
              <TabsTrigger
                value='basic'
                className='rounded-lg text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm'
              >
                Thông tin cơ bản
              </TabsTrigger>
              <TabsTrigger
                value='food'
                className='rounded-lg text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm'
              >
                Thực đơn
              </TabsTrigger>
            </TabsList>

            <TabsContent value='basic' className='space-y-6'>
              <Card className='border-0 shadow-sm'>
                <CardHeader className='pb-4 border-b'>
                  <CardTitle className='text-xl'>Thông tin chung</CardTitle>
                </CardHeader>
                <CardContent className='pt-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <FormField
                      control={form.control}
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
                      control={form.control}
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
                      control={form.control}
                      name='description'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mô tả</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder='Nhập mô tả workshop'
                              className='min-h-[120px] resize-none'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
                    <FormField
                      control={form.control}
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
                      control={form.control}
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
                      control={form.control}
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
                      control={form.control}
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

              <Card className='border-0 shadow-sm'>
                <CardHeader className='pb-4 border-b'>
                  <CardTitle className='text-xl'>Thời gian</CardTitle>
                </CardHeader>
                <CardContent className='pt-6'>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                    {/* Workshop Date with Calendar */}
                    <FormField
                      control={form.control}
                      name='workshopDate'
                      render={() => (
                        <FormItem>
                          <FormLabel>Thời gian diễn ra</FormLabel>
                          <div className='flex flex-col gap-2'>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant='outline'
                                    className={cn(
                                      'w-full h-11 pl-3 text-left font-normal',
                                      !workshopDate && 'text-muted-foreground'
                                    )}
                                  >
                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                    {workshopDate ? (
                                      format(workshopDate, 'dd/MM/yyyy', { locale: vi })
                                    ) : (
                                      <span>Chọn ngày</span>
                                    )}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className='w-auto p-0' align='start'>
                                <Calendar
                                  mode='single'
                                  selected={workshopDate}
                                  onSelect={setWorkshopDate}
                                  initialFocus
                                  className='rounded-md border'
                                />
                              </PopoverContent>
                            </Popover>

                            <div className='flex items-center gap-2 h-11'>
                              <div className='flex items-center gap-1 bg-background border rounded-md px-3 py-2 w-full'>
                                <Clock className='h-4 w-4 text-muted-foreground' />
                                <Select
                                  value={workshopTime.hour}
                                  onValueChange={(value) => setWorkshopTime({ ...workshopTime, hour: value })}
                                >
                                  <SelectTrigger className='w-[60px] border-0 p-0 h-auto focus:ring-0'>
                                    <SelectValue placeholder='HH' />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {hours.map((hour) => (
                                      <SelectItem key={hour} value={hour}>
                                        {hour}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <span className='text-muted-foreground'>:</span>
                                <Select
                                  value={workshopTime.minute}
                                  onValueChange={(value) => setWorkshopTime({ ...workshopTime, minute: value })}
                                >
                                  <SelectTrigger className='w-[60px] border-0 p-0 h-auto focus:ring-0'>
                                    <SelectValue placeholder='MM' />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {minutes.map((minute) => (
                                      <SelectItem key={minute} value={minute}>
                                        {minute}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Start Register Date with Calendar */}
                    <FormField
                      control={form.control}
                      name='startRegisterDate'
                      render={() => (
                        <FormItem>
                          <FormLabel>Thời gian bắt đầu đăng ký</FormLabel>
                          <div className='flex flex-col gap-2'>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant='outline'
                                    className={cn(
                                      'w-full h-11 pl-3 text-left font-normal',
                                      !startRegisterDate && 'text-muted-foreground'
                                    )}
                                  >
                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                    {startRegisterDate ? (
                                      format(startRegisterDate, 'dd/MM/yyyy', { locale: vi })
                                    ) : (
                                      <span>Chọn ngày</span>
                                    )}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className='w-auto p-0' align='start'>
                                <Calendar
                                  mode='single'
                                  selected={startRegisterDate}
                                  onSelect={setStartRegisterDate}
                                  initialFocus
                                  className='rounded-md border'
                                />
                              </PopoverContent>
                            </Popover>

                            <div className='flex items-center gap-2 h-11'>
                              <div className='flex items-center gap-1 bg-background border rounded-md px-3 py-2 w-full'>
                                <Clock className='h-4 w-4 text-muted-foreground' />
                                <Select
                                  value={startRegisterTime.hour}
                                  onValueChange={(value) => setStartRegisterTime({ ...startRegisterTime, hour: value })}
                                >
                                  <SelectTrigger className='w-[60px] border-0 p-0 h-auto focus:ring-0'>
                                    <SelectValue placeholder='HH' />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {hours.map((hour) => (
                                      <SelectItem key={hour} value={hour}>
                                        {hour}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <span className='text-muted-foreground'>:</span>
                                <Select
                                  value={startRegisterTime.minute}
                                  onValueChange={(value) =>
                                    setStartRegisterTime({ ...startRegisterTime, minute: value })
                                  }
                                >
                                  <SelectTrigger className='w-[60px] border-0 p-0 h-auto focus:ring-0'>
                                    <SelectValue placeholder='MM' />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {minutes.map((minute) => (
                                      <SelectItem key={minute} value={minute}>
                                        {minute}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* End Register Date with Calendar */}
                    <FormField
                      control={form.control}
                      name='endRegisterDate'
                      render={() => (
                        <FormItem>
                          <FormLabel>Thời gian kết thúc đăng ký</FormLabel>
                          <div className='flex flex-col gap-2'>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant='outline'
                                    className={cn(
                                      'w-full h-11 pl-3 text-left font-normal',
                                      !endRegisterDate && 'text-muted-foreground'
                                    )}
                                  >
                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                    {endRegisterDate ? (
                                      format(endRegisterDate, 'dd/MM/yyyy', { locale: vi })
                                    ) : (
                                      <span>Chọn ngày</span>
                                    )}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className='w-auto p-0' align='start'>
                                <Calendar
                                  mode='single'
                                  selected={endRegisterDate}
                                  onSelect={setEndRegisterDate}
                                  initialFocus
                                  className='rounded-md border'
                                />
                              </PopoverContent>
                            </Popover>

                            <div className='flex items-center gap-2 h-11'>
                              <div className='flex items-center gap-1 bg-background border rounded-md px-3 py-2 w-full'>
                                <Clock className='h-4 w-4 text-muted-foreground' />
                                <Select
                                  value={endRegisterTime.hour}
                                  onValueChange={(value) => setEndRegisterTime({ ...endRegisterTime, hour: value })}
                                >
                                  <SelectTrigger className='w-[60px] border-0 p-0 h-auto focus:ring-0'>
                                    <SelectValue placeholder='HH' />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {hours.map((hour) => (
                                      <SelectItem key={hour} value={hour}>
                                        {hour}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <span className='text-muted-foreground'>:</span>
                                <Select
                                  value={endRegisterTime.minute}
                                  onValueChange={(value) => setEndRegisterTime({ ...endRegisterTime, minute: value })}
                                >
                                  <SelectTrigger className='w-[60px] border-0 p-0 h-auto focus:ring-0'>
                                    <SelectValue placeholder='MM' />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {minutes.map((minute) => (
                                      <SelectItem key={minute} value={minute}>
                                        {minute}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className='border-0 shadow-sm'>
                <CardHeader className='pb-4 border-b'>
                  <CardTitle className='text-xl'>Thông tin đăng ký</CardTitle>
                </CardHeader>
                <CardContent className='pt-6'>
                  <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
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
                      control={form.control}
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
                      control={form.control}
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
                      control={form.control}
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
                      control={form.control}
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
            </TabsContent>

            <TabsContent value='food' className='space-y-6'>
              <Card className='border shadow-sm rounded-xl overflow-hidden'>
                <CardContent className='pt-6 px-6'>
                  <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
                    <div className='md:col-span-1'>
                      <div className='flex items-center justify-between mb-3'>
                        <h3 className='text-base font-medium text-gray-800'>Danh mục</h3>
                        <span className='text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full'>
                          {categories.length}
                        </span>
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

                    <div className='md:col-span-3'>
                      <div className='flex items-center justify-between mb-3'>
                        <h3 className='text-base font-medium text-gray-800'>Sản phẩm</h3>
                        <span className='text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full'>
                          {products.length}
                        </span>
                      </div>
                      <div className='border rounded-lg shadow-sm'>
                        <ScrollArea className='h-[500px]'>
                          <div className='p-4'>
                            {products.length === 0 ? (
                              <div className='flex flex-col items-center justify-center py-12 text-center'>
                                <div className='w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-3'>
                                  <span className='text-muted-foreground text-xl'>🍽️</span>
                                </div>
                                <p className='text-center text-muted-foreground'>
                                  Không có sản phẩm nào trong danh mục này
                                </p>
                              </div>
                            ) : (
                              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                {products.map((product) => (
                                  <div
                                    key={product.id}
                                    className={`flex items-start space-x-3 p-4 border rounded-lg transition-all ${
                                      isProductSelected(product.id)
                                        ? 'border-primary/50 bg-primary/5'
                                        : 'hover:bg-muted/30 border-muted'
                                    }`}
                                  >
                                    <Checkbox
                                      id={`product-${product.id}`}
                                      checked={isProductSelected(product.id)}
                                      onCheckedChange={(checked) => handleProductSelect(product, checked as boolean)}
                                      className='mt-1'
                                    />
                                    <label
                                      htmlFor={`product-${product.id}`}
                                      className='flex flex-1 flex-col cursor-pointer'
                                    >
                                      <span className='font-medium text-base'>{product.name}</span>
                                      <span className='text-sm text-muted-foreground line-clamp-2 mt-1'>
                                        {product.description}
                                      </span>
                                      <span className='text-sm font-medium mt-2 text-primary'>
                                        {product.price?.toLocaleString('vi-VN')} đ
                                      </span>
                                    </label>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className='flex justify-end gap-4 mt-8'>
            <Button
              type='button'
              variant='outline'
              onClick={() => navigate('/workshops')}
              className='min-w-[120px] h-11'
            >
              Hủy
            </Button>
            <Button type='submit' disabled={loading} className='min-w-[120px] h-11'>
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
          </div>
        </form>
      </Form>
    </div>
  )
}
