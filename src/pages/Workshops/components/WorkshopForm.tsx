import { useEffect, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Form } from '@/components/ui/form'

import WorkshopService from '@/services/workshop-service'
import CategoryService from '@/services/category-service'
import ProductService from '@/services/product-service'
import ZoneService from '@/services/zone-service'

import { setHours, setMinutes, getHours, getMinutes } from 'date-fns'
import WorkshopFormBasicInfo from './WorkshopForm/WorkshopFormBasicInfo'
import WorkshopFormTimeInfo from './WorkshopForm/WorkshopFormTimeInfo'
import WorkshopFormRegisterInfo from './WorkshopForm/WorkshopFormRegisterInfo'
import WorkshopFormFoodMenu from './WorkshopForm/WorkshopFormFoodMenu'

import { ZoneResponse } from '@/types/zone'
import { CategoryModel } from '@/types/category'
import { ProductModel } from '@/types/product'
import { WorkshopCreate } from '@/types/workshop'

const formSchema = z.object({
  name: z.string().min(1),
  header: z.string().min(1),
  description: z.string().min(1),
  location: z.string().min(1),
  organizer: z.string().min(1),
  hotLineContact: z.string().min(1),
  workshopDate: z.string().min(1),
  startRegisterDate: z.string().min(1),
  endRegisterDate: z.string().min(1),
  totalFee: z.number().min(0),
  maxPizzaPerRegister: z.number().min(0),
  maxParticipantPerRegister: z.number().min(0),
  zoneId: z.string().min(1),
  productIds: z.array(z.string().uuid())
})

type WorkshopFormProps = {
  initialData?: WorkshopCreate
  isEditing?: boolean
}

export default function WorkshopForm({ initialData, isEditing = false }: WorkshopFormProps) {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [zones, setZones] = useState<ZoneResponse[]>([])
  const [categories, setCategories] = useState<CategoryModel[]>([])
  const [products, setProducts] = useState<ProductModel[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(isEditing && !initialData)

  const [workshopDate, setWorkshopDate] = useState<Date | undefined>(
    initialData ? new Date(initialData.workshopDate) : undefined
  )
  const [startRegisterDate, setStartRegisterDate] = useState<Date | undefined>(
    initialData ? new Date(initialData.startRegisterDate) : undefined
  )
  const [endRegisterDate, setEndRegisterDate] = useState<Date | undefined>(
    initialData ? new Date(initialData.endRegisterDate) : undefined
  )

  const [workshopTime, setWorkshopTime] = useState({ hour: '00', minute: '00' })
  const [startRegisterTime, setStartRegisterTime] = useState({ hour: '00', minute: '00' })
  const [endRegisterTime, setEndRegisterTime] = useState({ hour: '00', minute: '00' })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
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
      maxPizzaPerRegister: 0,
      maxParticipantPerRegister: 0,
      zoneId: '',
      productIds: []
    }
  })

  const productIds = form.watch('productIds')

  useEffect(() => {
    fetchZones()
    fetchCategories()
    if (isEditing && id && !initialData) {
      fetchWorkshop(id)
    }
  }, [id, isEditing, initialData])

  useEffect(() => {
    if (selectedCategory) {
      fetchProductsByCategory(selectedCategory)
    }
  }, [selectedCategory])

  useEffect(() => {
    if (workshopDate) {
      const dateWithTime = setHours(setMinutes(workshopDate, +workshopTime.minute), +workshopTime.hour)
      form.setValue('workshopDate', dateWithTime.toString())
    }
  }, [workshopDate, workshopTime])

  useEffect(() => {
    if (startRegisterDate) {
      const dateWithTime = setHours(setMinutes(startRegisterDate, +startRegisterTime.minute), +startRegisterTime.hour)
      form.setValue('startRegisterDate', dateWithTime.toString())
    }
  }, [startRegisterDate, startRegisterTime])

  useEffect(() => {
    if (endRegisterDate) {
      const dateWithTime = setHours(setMinutes(endRegisterDate, +endRegisterTime.minute), +endRegisterTime.hour)
      form.setValue('endRegisterDate', dateWithTime.toString())
    }
  }, [endRegisterDate, endRegisterTime])

  const fetchZones = async () => {
    const response = await ZoneService.getInstance().getAllZones()
    if (response.success) setZones(response.result.items)
  }

  const fetchCategories = async () => {
    const response = await CategoryService.getInstance().getAllCategories()
    if (response.success) {
      const items = response.result.items
      setCategories(items)
      if (items.length > 0) setSelectedCategory(items[0].id)
    }
  }

  const fetchProductsByCategory = async (categoryId: string) => {
    const response = await ProductService.getInstance().getProductsByCategory(categoryId)
    if (response.success) setProducts(response.result.items)
  }

  const fetchWorkshop = async (workshopId: string) => {
    try {
      setFetchingData(true)
      const res = await WorkshopService.getInstance().getWorkshopById(workshopId)
      if (res.success) {
        const w = res.result
        form.reset({
          ...w,
          productIds: w.workshopFoodDetails?.map((p) => p.productId) || []
        })
        const wd = new Date(w.workshopDate)
        const sr = new Date(w.startRegisterDate)
        const er = new Date(w.endRegisterDate)

        setWorkshopDate(wd)
        setStartRegisterDate(sr)
        setEndRegisterDate(er)
        setWorkshopTime({
          hour: String(getHours(wd)).padStart(2, '0'),
          minute: String(getMinutes(wd)).padStart(2, '0')
        })
        setStartRegisterTime({
          hour: String(getHours(sr)).padStart(2, '0'),
          minute: String(getMinutes(sr)).padStart(2, '0')
        })
        setEndRegisterTime({
          hour: String(getHours(er)).padStart(2, '0'),
          minute: String(getMinutes(er)).padStart(2, '0')
        })
      }
    } finally {
      setFetchingData(false)
    }
  }

  const handleProductSelect = (productId: string, isChecked: boolean) => {
    const current = new Set(productIds)
    if (isChecked) {
      current.add(productId)
    } else {
      current.delete(productId)
    }
    form.setValue('productIds', Array.from(current))
  }

  const isProductSelected = (productId: string) => productIds.includes(productId)

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)

      const payload = {
        ...values,
        workshopDate: new Date(values.workshopDate).toISOString(),
        startRegisterDate: new Date(values.startRegisterDate).toISOString(),
        endRegisterDate: new Date(values.endRegisterDate).toISOString(),
        zone: null,
        zoneName: zones.find((z) => z.id === values.zoneId)?.name || ''
      }

      const res =
        isEditing && id
          ? await WorkshopService.getInstance().createWorkshop(payload) //update workshop
          : await WorkshopService.getInstance().createWorkshop(payload)

      if (res.success) navigate('/workshops')
    } catch (err) {
      console.error(err)
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
      <p className='text-muted-foreground mb-6'>Điền thông tin chi tiết để {isEditing ? 'cập nhật' : 'tạo'} workshop</p>

      <FormProvider {...form}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <Tabs defaultValue='basic' className='w-full'>
              <TabsList className='grid grid-cols-2 h-12 rounded-xl p-1 bg-muted shadow-sm'>
                <TabsTrigger value='basic'>Thông tin cơ bản</TabsTrigger>
                <TabsTrigger value='food'>Thực đơn</TabsTrigger>
              </TabsList>

              <TabsContent value='basic' className='space-y-6'>
                <WorkshopFormBasicInfo zones={zones} />
                <WorkshopFormTimeInfo
                  workshopDate={workshopDate}
                  setWorkshopDate={setWorkshopDate}
                  workshopTime={workshopTime}
                  setWorkshopTime={setWorkshopTime}
                  startRegisterDate={startRegisterDate}
                  setStartRegisterDate={setStartRegisterDate}
                  startRegisterTime={startRegisterTime}
                  setStartRegisterTime={setStartRegisterTime}
                  endRegisterDate={endRegisterDate}
                  setEndRegisterDate={setEndRegisterDate}
                  endRegisterTime={endRegisterTime}
                  setEndRegisterTime={setEndRegisterTime}
                />
                <WorkshopFormRegisterInfo />
              </TabsContent>

              <TabsContent value='food' className='space-y-6'>
                <WorkshopFormFoodMenu
                  categories={categories}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  products={products}
                  handleProductSelect={handleProductSelect}
                  isProductSelected={isProductSelected}
                />
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
      </FormProvider>
    </div>
  )
}
