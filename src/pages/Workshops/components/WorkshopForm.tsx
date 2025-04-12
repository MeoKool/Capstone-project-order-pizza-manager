import type React from 'react'

import { useEffect, useRef, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { ArrowLeft, ArrowRight, Check, Save, ListIcon } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'

import WorkshopService from '@/services/workshop-service'
import CategoryService from '@/services/category-service'
import ProductService from '@/services/product-service'
import ZoneService from '@/services/zone-service'

import { setHours, setMinutes, getHours, getMinutes, isAfter, isBefore } from 'date-fns'
import WorkshopFormBasicInfo from './WorkshopForm/WorkshopFormBasicInfo'
import WorkshopFormTimeInfo from './WorkshopForm/WorkshopFormTimeInfo'
import WorkshopFormRegisterInfo from './WorkshopForm/WorkshopFormRegisterInfo'
import WorkshopFormFoodMenu from './WorkshopForm/WorkshopFormFoodMenu'

import type { ZoneResponse } from '@/types/zone'
import type { ProductModel } from '@/types/product'
import type { WorkshopCreate } from '@/types/workshop'

// Cập nhật schema để chấp nhận undefined cho các trường số
const formSchema = z.object({
  name: z.string().min(1, {
    message: 'Tên workshop không được để trống.'
  }),
  header: z.string().min(1, {
    message: 'Tiêu đề không được để trống.'
  }),
  description: z.string().min(1, {
    message: 'Mô tả không được để trống.'
  }),
  location: z.string().min(1, {
    message: 'Địa điểm không được để trống.'
  }),
  organizer: z.string().min(1, {
    message: 'Người tổ chức không được để trống.'
  }),
  hotLineContact: z.string().min(1, {
    message: 'Số hotline không được để trống.'
  }),
  workshopDate: z.string().min(1, {
    message: 'Thời gian diễn ra không được để trống.'
  }),
  startRegisterDate: z.string().min(1, {
    message: 'Thời gian bắt đầu đăng ký không được để trống.'
  }),
  endRegisterDate: z.string().min(1, {
    message: 'Thời gian kết thúc đăng ký không được để trống.'
  }),
  totalFee: z
    .number()
    .nonnegative({
      message: 'Phí tham gia không được âm.'
    })
    .optional()
    .default(0),
  maxRegister: z
    .number()
    .nonnegative({
      message: 'Số lượng đăng ký tối đa không được âm.'
    })
    .optional()
    .default(0),
  maxPizzaPerRegister: z
    .number()
    .nonnegative({
      message: 'Số pizza tối đa/đăng ký không được âm.'
    })
    .optional()
    .default(0),
  maxParticipantPerRegister: z
    .number()
    .nonnegative({
      message: 'Số người tối đa/đăng ký không được âm.'
    })
    .optional()
    .default(0),
  productIds: z.array(z.string()).min(1, {
    message: 'Vui lòng chọn ít nhất 1 món ăn.'
  }),
  zoneId: z.string().min(1, {
    message: 'Vui lòng chọn khu vực.'
  })
})

type WorkshopFormProps = {
  initialData?: WorkshopCreate
  isEditing?: boolean
}

export default function WorkshopForm({ initialData, isEditing = false }: WorkshopFormProps) {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const prevButtonRef = useRef<HTMLButtonElement>(null)
  const [zones, setZones] = useState<ZoneResponse[]>([])
  const [products, setProducts] = useState<ProductModel[]>([])
  const [showExitDialog, setShowExitDialog] = useState(false)

  // Step management
  const [currentStep, setCurrentStep] = useState(0)
  const steps = [
    { id: 'basic', title: 'Thông tin cơ bản' },
    { id: 'time', title: 'Thời gian' },
    { id: 'register', title: 'Thông tin đăng ký' },
    { id: 'food', title: 'Thực đơn' }
  ]

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
      maxRegister: 0,
      maxPizzaPerRegister: 0,
      maxParticipantPerRegister: 0,
      productIds: [],
      zoneId: ''
    },
    mode: 'onChange'
  })

  const productIds = form.watch('productIds')
  const formIsDirty = form.formState.isDirty

  useEffect(() => {
    fetchZones()
    fetchPizzaProducts()
    if (isEditing && id && !initialData) {
      fetchWorkshop(id)
    }
  }, [id, isEditing, initialData])

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

  // Thay đổi: Hàm mới để lấy sản phẩm Pizza
  const fetchPizzaProducts = async () => {
    try {
      // Đầu tiên lấy danh sách categories để tìm category "Pizza"
      const categoriesResponse = await CategoryService.getInstance().getAllCategories()
      if (categoriesResponse.success) {
        const pizzaCategory = categoriesResponse.result.items.find(
          (category) => category.name.toLowerCase() === 'pizza'
        )

        if (pizzaCategory) {
          // Nếu tìm thấy category Pizza, lấy các sản phẩm trong category đó
          const productsResponse = await ProductService.getInstance().getProductsByCategory(pizzaCategory.id)
          if (productsResponse.success) {
            setProducts(productsResponse.result.items)
          }
        } else {
          // Nếu không tìm thấy category Pizza, hiển thị thông báo
          console.warn('Không tìm thấy danh mục Pizza')
          toast.warning('Không tìm thấy danh mục Pizza')
          setProducts([])
        }
      }
    } catch (error) {
      console.error('Error fetching pizza products:', error)
      toast.error('Có lỗi khi tải danh sách sản phẩm')
    }
  }

  const fetchWorkshop = async (workshopId: string) => {
    try {
      setFetchingData(true)
      const res = await WorkshopService.getInstance().getWorkshopById(workshopId)
      if (res.success) {
        const w = res.result
        // Đảm bảo productIds là một mảng
        const productIds = w.workshopFoodDetails?.map((p) => p.productId) || []

        form.reset({
          ...w,
          productIds: productIds
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
    } catch (error) {
      console.error('Error fetching workshop:', error)
      toast.error('Có lỗi khi tải dữ liệu workshop')
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

  // Cập nhật phần onSubmit để đảm bảo các giá trị số không bị undefined
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)

      // Create date objects with the correct time values
      const workshopDateTime = new Date(workshopDate!)
      workshopDateTime.setHours(Number.parseInt(workshopTime.hour), Number.parseInt(workshopTime.minute))

      const startRegDateTime = new Date(startRegisterDate!)
      startRegDateTime.setHours(Number.parseInt(startRegisterTime.hour), Number.parseInt(startRegisterTime.minute))

      const endRegDateTime = new Date(endRegisterDate!)
      endRegDateTime.setHours(Number.parseInt(endRegisterTime.hour), Number.parseInt(endRegisterTime.minute))

      // Log the dates for debugging
      console.log('Workshop Date:', workshopDateTime.toISOString())
      console.log('Start Register Date:', startRegDateTime.toISOString())
      console.log('End Register Date:', endRegDateTime.toISOString())

      const payload = {
        ...values,
        totalFee: values.totalFee ?? 0,
        maxRegister: values.maxRegister ?? 0,
        maxPizzaPerRegister: values.maxPizzaPerRegister ?? 0,
        maxParticipantPerRegister: values.maxParticipantPerRegister ?? 0,
        // Use the date objects we created above
        workshopDate: workshopDateTime.toISOString(),
        startRegisterDate: startRegDateTime.toISOString(),
        endRegisterDate: endRegDateTime.toISOString(),
        zoneName: zones.find((z) => z.id === values.zoneId)?.name || ''
      }

      const res =
        isEditing && id
          ? await WorkshopService.getInstance().updateWorkshop(id) // Make sure to pass payload here
          : await WorkshopService.getInstance().createWorkshop(payload)

      if (res.success) {
        toast.success(isEditing ? 'Cập nhật thành công' : 'Tạo mới thành công')
        navigate('/workshops')
      } else {
        toast.error(res.message || 'Vui lòng thử lại sau')
      }
    } catch (err) {
      console.error(err)
      toast.error('Có lỗi xảy ra. Vui lòng thử lại sau')
    } finally {
      setLoading(false)
    }
  }

  // Kiểm tra xem các trường trong bước hiện tại đã hợp lệ chưa
  const validateCurrentStep = async () => {
    let fieldsToValidate: string[] = []
    let isValid = true

    // Xác định các trường cần kiểm tra dựa trên bước hiện tại
    switch (currentStep) {
      case 0: // Thông tin cơ bản
        fieldsToValidate = ['name', 'header', 'description', 'location', 'organizer', 'hotLineContact', 'zoneId']
        break
      case 1: // Thời gian
        fieldsToValidate = ['workshopDate', 'startRegisterDate', 'endRegisterDate']

        // Kiểm tra thêm lỗi thời gian
        if (!workshopDate || !startRegisterDate || !endRegisterDate) {
          isValid = false
          toast.error('Vui lòng chọn đầy đủ các mốc thời gian')
        }

        // Kiểm tra thời gian kết thúc đăng ký có lớn hơn thời gian diễn ra không
        if (workshopDate && endRegisterDate) {
          const workshopDateTime = new Date(workshopDate)
          workshopDateTime.setHours(Number.parseInt(workshopTime.hour), Number.parseInt(workshopTime.minute))

          const endRegDateTime = new Date(endRegisterDate)
          endRegDateTime.setHours(Number.parseInt(endRegisterTime.hour), Number.parseInt(endRegisterTime.minute))

          // Compare dates in the same timezone
          if (isAfter(endRegDateTime, workshopDateTime)) {
            isValid = false
            toast.error('Thời gian kết thúc đăng ký không được lớn hơn thời gian diễn ra')
          }
        }

        // Kiểm tra thời gian bắt đầu đăng ký có lớn hơn thời gian diễn ra không
        if (workshopDate && startRegisterDate) {
          const workshopDateTime = new Date(workshopDate)
          workshopDateTime.setHours(Number.parseInt(workshopTime.hour), Number.parseInt(workshopTime.minute))

          const startRegDateTime = new Date(startRegisterDate)
          startRegDateTime.setHours(Number.parseInt(startRegisterTime.hour), Number.parseInt(startRegisterTime.minute))

          // Compare dates in the same timezone
          if (isAfter(startRegDateTime, workshopDateTime)) {
            isValid = false
            toast.error('Thời gian bắt đầu đăng ký không được lớn hơn thời gian diễn ra')
          }
        }

        // Kiểm tra thời gian kết thúc đăng ký có nhỏ hơn thời gian bắt đầu đăng ký không
        if (startRegisterDate && endRegisterDate) {
          const startRegDateTime = new Date(startRegisterDate)
          startRegDateTime.setHours(Number.parseInt(startRegisterTime.hour), Number.parseInt(startRegisterTime.minute))

          const endRegDateTime = new Date(endRegisterDate)
          endRegDateTime.setHours(Number.parseInt(endRegisterTime.hour), Number.parseInt(endRegisterTime.minute))

          // Compare dates in the same timezone
          if (isBefore(endRegDateTime, startRegDateTime)) {
            isValid = false
            toast.error('Thời gian kết thúc đăng ký phải sau thời gian bắt đầu đăng ký')
          }
        }

        break
      case 2: // Thông tin đăng ký
        fieldsToValidate = ['totalFee', 'maxRegister', 'maxPizzaPerRegister', 'maxParticipantPerRegister']
        break
      case 3: // Thực đơn
        // Bắt buộc phải chọn ít nhất 1 món ăn
        fieldsToValidate = ['productIds']
        break
    }

    // Kiểm tra tính hợp lệ của các trường
    const formValid = await form.trigger(fieldsToValidate as any)

    // Kết hợp kết quả kiểm tra form và kiểm tra thời gian
    if (!formValid || !isValid) {
      // Hiển thị thông báo lỗi nếu có trường không hợp lệ
      if (currentStep === 3 && !formValid) {
        toast.error('Vui lòng chọn ít nhất 1 món ăn')
      } else if (!formValid) {
        toast.error('Vui lòng điền đầy đủ thông tin trước khi tiếp tục')
      }
      return false
    }

    return true
  }

  const nextStep = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent any default form submission
    e.stopPropagation() // Stop event bubbling

    // Kiểm tra tính hợp lệ của bước hiện tại trước khi chuyển sang bước tiếp theo
    const isValid = await validateCurrentStep()

    if (isValid && currentStep < steps.length - 1) {
      // Chỉ cập nhật state, không gọi API
      setCurrentStep((prev) => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleBackToList = () => {
    if (formIsDirty) {
      setShowExitDialog(true)
    } else {
      navigate('/workshops')
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
      <div className='flex items-center justify-between mb-6'>
        <p className='text-muted-foreground'>Điền thông tin chi tiết để {isEditing ? 'cập nhật' : 'tạo'} workshop</p>
        <Button variant='outline' onClick={handleBackToList} className='flex items-center gap-2'>
          <ListIcon className='h-4 w-4' />
          Quay lại danh sách
        </Button>
      </div>

      {/* Step Progress Bar */}
      <div className='mb-8'>
        <div className='flex items-center justify-between'>
          {steps.map((step, index) => (
            <div key={step.id} className='flex flex-col items-center'>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 
                  ${
                    currentStep >= index ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-gray-500'
                  }`}
              >
                {currentStep > index ? <Check className='h-5 w-5' /> : <span>{index + 1}</span>}
              </div>
              <span className={`mt-2 text-sm ${currentStep >= index ? 'text-green-500 font-medium' : 'text-gray-500'}`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className={`h-1 w-24 mt-4 ${currentStep > index ? 'bg-green-500' : 'bg-gray-300'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <FormProvider {...form}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <Card className='shadow-md border border-gray-200 rounded-xl'>
              <CardHeader className='border-b bg-gray-50'>
                <CardTitle>{steps[currentStep].title}</CardTitle>
              </CardHeader>
              <CardContent className='pt-6'>
                {currentStep === 0 && <WorkshopFormBasicInfo zones={zones} />}

                {currentStep === 1 && (
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
                )}

                {currentStep === 2 && <WorkshopFormRegisterInfo />}

                {currentStep === 3 && (
                  <WorkshopFormFoodMenu
                    products={products}
                    handleProductSelect={handleProductSelect}
                    isProductSelected={isProductSelected}
                  />
                )}
              </CardContent>
              <CardFooter className='flex justify-between border-t p-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={currentStep === 0 ? () => navigate('/workshops') : prevStep}
                  className='min-w-[120px] h-11'
                >
                  {currentStep === 0 ? (
                    'Hủy'
                  ) : (
                    <>
                      <ArrowLeft className='mr-2 h-4 w-4' />
                      Quay lại
                    </>
                  )}
                </Button>

                <div className='flex gap-2'>
                  {currentStep < steps.length - 1 ? (
                    <Button type='button' onClick={nextStep} className='min-w-[120px] h-11' ref={prevButtonRef}>
                      Tiếp theo
                      <ArrowRight className='ml-2 h-4 w-4' />
                    </Button>
                  ) : (
                    <Button
                      type='submit'
                      disabled={loading}
                      className='min-w-[120px] h-11'
                      onClick={async (e) => {
                        // Kiểm tra bước cuối cùng trước khi submit
                        const isValid = await validateCurrentStep()
                        if (!isValid) {
                          e.preventDefault()
                        }
                      }}
                    >
                      {loading ? (
                        <>
                          <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent'></div>
                          Đang xử lý
                        </>
                      ) : (
                        <>
                          <Save className='mr-2 h-4 w-4' />
                          {isEditing ? 'Cập nhật' : 'Tạo mới'}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </FormProvider>

      {/* Dialog xác nhận khi rời khỏi form có thay đổi chưa lưu */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận rời khỏi trang</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có thay đổi chưa được lưu. Bạn có chắc chắn muốn rời khỏi trang này không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Tiếp tục chỉnh sửa</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate('/workshops')} className='bg-red-500 hover:bg-red-600'>
              Rời khỏi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
