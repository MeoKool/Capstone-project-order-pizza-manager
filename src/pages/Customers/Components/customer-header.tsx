import { useCustomer } from './customer-provider'

export function CustomerHeader() {
  const { totalCount } = useCustomer()

  return (
    <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border shadow-sm'>
      <div>
        <p className='text-muted-foreground flex items-center'>
          <span className='inline-block w-2 h-2 rounded-full bg-primary mr-2'></span>
          Tổng số khách hàng: <span className='font-medium ml-1'>{totalCount}</span>
        </p>
      </div>
    </div>
  )
}
