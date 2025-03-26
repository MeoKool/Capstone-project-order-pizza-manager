import React, { useState } from 'react'
// import FoodList from './components/FoodList'
import { Box, Package, Utensils, Wheat } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import FoodList from './components/FoodList'

const MenuFood: React.FC = () => {
  const [, setActiveTab] = useState("product")

  return (

    <div className='mx-auto p-4 max-w-full'>
      <h1 className='text-2xl font-bold mb-6'>Quản lý thực đơn</h1>
      <Tabs defaultValue="product" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="product" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Thực đơn</span>
          </TabsTrigger>
          <TabsTrigger value="productSize" className="flex items-center gap-2">
            <Box className="h-4 w-4" />
            <span className="hidden sm:inline">ProductSize</span>
            <span className="sm:hidden">Kích cỡ</span>
            <span className="hidden sm:inline text-muted-foreground">- Kích cỡ</span>
          </TabsTrigger>
          <TabsTrigger value="recipe" className="flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            <span className="hidden sm:inline">Recipe</span>
            <span className="sm:hidden">Công thức</span>
            <span className="hidden sm:inline text-muted-foreground">- Công thức</span>
          </TabsTrigger>
          <TabsTrigger value="ingredient" className="flex items-center gap-2">
            <Wheat className="h-4 w-4" />
            <span className="hidden sm:inline">Ingredient</span>
            <span className="sm:hidden">Nguyên Liệu</span>
            <span className="hidden sm:inline text-muted-foreground">- Nguyên Liệu</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="product">
          <Card>
            <CardHeader>
              <CardTitle>Thực đơn</CardTitle>
              <CardDescription>Quản lý thông tin về Thực đơn của bạn.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <FoodList />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="productSize">
          <Card>
            <CardHeader>
              <CardTitle>Kích cỡ (ProductSize)</CardTitle>
              <CardDescription>Quản lý các kích cỡ khác nhau của sản phẩm.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="h-40 rounded-md border border-dashed flex items-center justify-center">
                <p className="text-muted-foreground">Nội dung Kích cỡ ở đây</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="recipe">
          <Card>
            <CardHeader>
              <CardTitle>Công thức (Recipe)</CardTitle>
              <CardDescription>Quản lý các công thức chế biến sản phẩm.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="h-40 rounded-md border border-dashed flex items-center justify-center">
                <p className="text-muted-foreground">Nội dung Công thức ở đây</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="ingredient">
          <Card>
            <CardHeader>
              <CardTitle>Nguyên Liệu (Ingredient)</CardTitle>
              <CardDescription>Quản lý thông tin về các nguyên liệu sử dụng.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="h-40 rounded-md border border-dashed flex items-center justify-center">
                <p className="text-muted-foreground">Nội dung Nguyên Liệu ở đây</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default MenuFood
