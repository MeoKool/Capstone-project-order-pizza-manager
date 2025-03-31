import React, { useState } from 'react'
import { Utensils, Wheat, Ruler, SquareMenu, Pizza } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import IngredientsPage from './components/Ingredients'
import ProductSizePage from './components/ProductSize/Product-Size'
import FoodList from './components/FoodList'
import CategoryPage from './components/Category'
import RecipesPage from './components/Recipe'

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

        {/* ////////////// */}
        <TabsContent value="product">
          <FoodList />
        </TabsContent>
        <TabsContent value="recipe">
          <RecipesPage />
        </TabsContent>
        {/*  */}
        <TabsContent value="productSize">
          <ProductSizePage />
        </TabsContent>
        {/*  */}
        <TabsContent value="ingredient">
          <IngredientsPage />
        </TabsContent>
        {/* Category */}
        <TabsContent value="category">
          <CategoryPage />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default MenuFood
