export function LoadingSpinner() {
  return (
    <div className='flex justify-center items-center p-8 h-[400px]'>
      <div className='flex flex-col items-center gap-2'>
        <div className='animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full'></div>
        <div className='text-red-600 font-medium'>Đang tải dữ liệu...</div>
      </div>
    </div>
  )
}
