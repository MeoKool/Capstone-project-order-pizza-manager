import React, { useState } from 'react'
import { AddFoodDialog } from './components/AddFoodDialog'
import { Button } from '@/components/ui/button'

const MenuFood: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div>
      <Button onClick={() => setDialogOpen(true)}>Thêm món ăn mới</Button>

      <AddFoodDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}

export default MenuFood
