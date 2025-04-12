export function StaffZoneGuide() {
  return (
    <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800'>
      <h2 className='font-semibold text-lg mb-2'>Hướng dẫn sử dụng:</h2>
      <ol className='list-decimal pl-5 space-y-1'>
        <li>Kéo thẻ nhân viên từ khu vực hiện tại</li>
        <li>Thả vào khu vực mới để chuyển nhân viên</li>
        <li>Hệ thống sẽ tự động cập nhật sau khi chuyển thành công</li>
      </ol>
    </div>
  )
}
