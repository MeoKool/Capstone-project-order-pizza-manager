import React, { useState } from 'react'
// import FoodList from './components/FoodList'
import { Utensils, Wheat, Ruler, SquareMenu, Pizza } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import IngredientsPage from './components/Ingredients'
import ProductSizePage from './components/Product-Size'
import FoodList from './components/FoodList'
import CategoryPage from './components/Category'

const MenuFood: React.FC = () => {
  const [, setActiveTab] = useState("product")

  return (

    <div className='mx-auto p-4 max-w-full'>
      <h1 className='text-2xl font-bold mb-6'>Quản lý thực đơn</h1>
      <Tabs defaultValue="product" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-4xl grid-cols-5">
          <TabsTrigger value="product" className="flex items-center gap-2">
            <Pizza className="h-4 w-4" />
            <span className="hidden sm:inline">Thực đơn</span>
          </TabsTrigger>
          <TabsTrigger value="recipe" className="flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            <span className="hidden sm:inline">Công thức</span>
          </TabsTrigger>
          <TabsTrigger value="productSize" className="flex items-center gap-2">
            <Ruler className="h-4 w-4" />
            <span className="hidden sm:inline">Kích cỡ</span>
          </TabsTrigger>

          <TabsTrigger value="ingredient" className="flex items-center gap-2">
            <Wheat className="h-4 w-4" />
            <span className="hidden sm:inline">Nguyên Liệu</span>
          </TabsTrigger>
          <TabsTrigger value="category" className="flex items-center gap-2">
            <SquareMenu className="h-4 w-4" />
            <span className="hidden sm:inline">Loại</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="product">
          <FoodList />
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
        {/*  */}
        <TabsContent value="productSize">
          <Card>
            <CardHeader>
              <CardTitle>Kích cỡ (ProductSize)</CardTitle>
              <CardDescription>Quản lý các kích cỡ khác nhau của sản phẩm.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <ProductSizePage />
            </CardContent>
          </Card>
        </TabsContent>
        {/*  */}
        <TabsContent value="ingredient">
          <IngredientsPage />
        </TabsContent>
        {/*  */}
        <TabsContent value="category">
          <Card>
            <CardHeader>
              <CardTitle>Loại món</CardTitle>
              <CardDescription>Quản lý các loại món ăn .</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <CategoryPage />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default MenuFood
