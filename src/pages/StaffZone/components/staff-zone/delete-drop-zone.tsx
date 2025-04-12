import { useDroppable } from '@dnd-kit/core'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'

interface DeleteDropZoneProps {
  isOver: boolean
}

export function DeleteDropZone({ isOver }: DeleteDropZoneProps) {
  const { setNodeRef } = useDroppable({
    id: 'delete-zone'
  })

  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      ref={setNodeRef}
      className={`
        fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full 
        shadow-lg transition-all duration-300 ease-in-out
        ${isOver || isHovered ? 'bg-red-500 scale-110' : 'bg-red-100'}
        ${isOver ? 'animate-pulse' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Trash2 className={`h-6 w-6 transition-colors ${isOver || isHovered ? 'text-white' : 'text-red-500'}`} />
      {isOver && (
        <div className='absolute -top-10 whitespace-nowrap rounded-md bg-red-500 px-3 py-1 text-sm font-medium text-white'>
          Thả để xóa
        </div>
      )}
    </div>
  )
}
