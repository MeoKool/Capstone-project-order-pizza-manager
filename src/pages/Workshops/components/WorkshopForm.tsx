import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ZoneResponse } from '@/types/zone'
import { CategoryModel } from '@/types/category'
import { ProductModel } from '@/types/product'
import WorkshopService from '@/services/workshop-service'
import ZoneService from '@/services/zone-service'
import CategoryService from '@/services/category-service'
import ProductService from '@/services/product-service'
import { Workshop, WorkshopFoodDetail, WorkshopStatus } from '@/types/workshop'

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

  const workshopService = WorkshopService.getInstance()
  const zoneService = ZoneService.getInstance()
  const categoryService = CategoryService.getInstance()
  const productService = ProductService.getInstance()

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
          workshopDate: new Date(workshop.workshopDate).toISOString().slice(0, 16),
          startRegisterDate: new Date(workshop.startRegisterDate).toISOString().slice(0, 16),
          endRegisterDate: new Date(workshop.endRegisterDate).toISOString().slice(0, 16),
          totalFee: Number(workshop.totalFee),
          maxRegister: Number(workshop.maxRegister),
          maxPizzaPerRegister: Number(workshop.maxPizzaPerRegister),
          maxParticipantPerRegister: Number(workshop.maxParticipantPerRegister)
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
        { id: crypto.randomUUID(), productId: product.id, product: product.name }
      ])
    } else {
      // Remove product from selected products
      setSelectedProducts(selectedProducts.filter((item) => item.productId !== product.id))
    }
  }

  const isProductSelected = (productId: string) => {
    return selectedProducts.some((item) => item.productId === productId)
  }

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

      if (isEditing && id) {
        // // const response = await workshopService.updateWorkshop(id, workshopData)
        // if (response.success) {
        //   navigate('/workshops')
        // }
      } else {
        // // const response = await workshopService.createWorkshop(workshopData)
        // if (response.success) {
        //   navigate('/workshops')
        // }
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
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>{isEditing ? 'Chỉnh sửa workshop' : 'Tạo workshop mới'}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='space-y-4'>
            <Tabs defaultValue='basic' className='w-full'>
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='basic'>Thông tin cơ bản</TabsTrigger>
                <TabsTrigger value='food'>Thực đơn</TabsTrigger>
              </TabsList>

              <TabsContent value='basic' className='space-y-4 pt-4'>
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
              </TabsContent>

              <TabsContent value='food' className='space-y-4 pt-4'>
                <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                  <div className='md:col-span-1 space-y-4'>
                    <h3 className='text-lg font-medium'>Danh mục</h3>
                    <div className='border rounded-md p-2'>
                      <ScrollArea className='h-[400px]'>
                        <div className='space-y-2'>
                          {categories.map((category) => (
                            <Button
                              key={category.id}
                              variant={selectedCategory === category.id ? 'default' : 'outline'}
                              className='w-full justify-start'
                              onClick={() => setSelectedCategory(category.id)}
                            >
                              {category.name}
                            </Button>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>

                  <div className='md:col-span-3 space-y-4'>
                    <h3 className='text-lg font-medium'>Sản phẩm</h3>
                    <div className='border rounded-md p-2'>
                      <ScrollArea className='h-[400px]'>
                        <div className='space-y-2'>
                          {products.length === 0 ? (
                            <p className='text-center text-muted-foreground py-4'>
                              Không có sản phẩm nào trong danh mục này
                            </p>
                          ) : (
                            products.map((product) => (
                              <div key={product.id} className='flex items-center space-x-2 p-2 border-b'>
                                <Checkbox
                                  id={`product-${product.id}`}
                                  checked={isProductSelected(product.id)}
                                  onCheckedChange={(checked) => handleProductSelect(product, checked as boolean)}
                                />
                                <label
                                  htmlFor={`product-${product.id}`}
                                  className='flex flex-1 items-center justify-between cursor-pointer'
                                >
                                  <div>
                                    <p className='text-sm font-medium'>{product.name}</p>
                                    <p className='text-xs text-muted-foreground'>{product.description}</p>
                                  </div>
                                  <p className='text-sm font-medium'>{product.price.toLocaleString('vi-VN')} đ</p>
                                </label>
                              </div>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className='flex justify-center '>
            <Button variant='destructive' className='mr-5' type='button' onClick={() => navigate('/workshops')}>
              Hủy
            </Button>
            <Button variant='green' type='submit' disabled={loading}>
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
