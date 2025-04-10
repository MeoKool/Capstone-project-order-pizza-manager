'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'

// Daily revenue data (last 10 days)
const dailyData = [
  { name: '01/04', value: 2450000 },
  { name: '02/04', value: 2180000 },
  { name: '03/04', value: 2320000 },
  { name: '04/04', value: 2780000 },
  { name: '05/04', value: 3120000 },
  { name: '06/04', value: 3580000 },
  { name: '07/04', value: 4250000 },
  { name: '08/04', value: 3920000 },
  { name: '09/04', value: 3650000 },
  { name: '10/04', value: 2580000 }
]

// Weekly revenue data (last 5 weeks)
const weeklyData = [
  { name: 'Tuần 1', value: 24500000 },
  { name: 'Tuần 2', value: 28800000 },
  { name: 'Tuần 3', value: 32200000 },
  { name: 'Tuần 4', value: 29900000 },
  { name: 'Tuần 5', value: 33300000 }
]

// Monthly revenue data (last 12 months)
const monthlyData = [
  { name: 'T5/23', value: 98500000 },
  { name: 'T6/23', value: 102800000 },
  { name: 'T7/23', value: 118200000 },
  { name: 'T8/23', value: 125900000 },
  { name: 'T9/23', value: 115300000 },
  { name: 'T10/23', value: 108500000 },
  { name: 'T11/23', value: 122800000 },
  { name: 'T12/23', value: 148200000 },
  { name: 'T1/24', value: 135900000 },
  { name: 'T2/24', value: 125300000 },
  { name: 'T3/24', value: 132800000 },
  { name: 'T4/24', value: 138200000 }
]

// Revenue by category data
const categoryData = [
  { name: 'Món chính', value: 45 },
  { name: 'Đồ uống', value: 25 },
  { name: 'Tráng miệng', value: 15 },
  { name: 'Khai vị', value: 15 }
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(value)
}

export default function RevenueCharts() {
  const [, setActiveTab] = useState('daily')

  return (
    <Card className='lg:col-span-2'>
      <CardHeader className='px-4 py-3 border-b'>
        <div className='flex justify-between items-center'>
          <div>
            <CardTitle className='text-base'>Biểu đồ doanh thu</CardTitle>
            <CardDescription className='text-xs'>Phân tích doanh thu theo thời gian và danh mục</CardDescription>
          </div>
          <select className='text-xs border rounded px-2 py-1'>
            <option>Năm 2024</option>
            <option>Năm 2023</option>
          </select>
        </div>
      </CardHeader>
      <CardContent className='p-4'>
        <Tabs defaultValue='daily' onValueChange={setActiveTab} className='space-y-3'>
          <TabsList className='grid w-full grid-cols-4 h-8'>
            <TabsTrigger value='daily' className='text-xs'>
              Theo ngày
            </TabsTrigger>
            <TabsTrigger value='weekly' className='text-xs'>
              Theo tuần
            </TabsTrigger>
            <TabsTrigger value='monthly' className='text-xs'>
              Theo tháng
            </TabsTrigger>
            <TabsTrigger value='category' className='text-xs'>
              Theo danh mục
            </TabsTrigger>
          </TabsList>

          <TabsContent value='daily' className='h-[250px] mt-0'>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart data={dailyData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <XAxis dataKey='name' tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={(value) => `${value / 1000000}M`} tick={{ fontSize: 10 }} />
                <CartesianGrid strokeDasharray='3 3' />
                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Doanh thu']} />
                <Line type='monotone' dataKey='value' stroke='#8884d8' strokeWidth={2} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value='weekly' className='h-[250px] mt-0'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <XAxis dataKey='name' tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={(value) => `${value / 1000000}M`} tick={{ fontSize: 10 }} />
                <CartesianGrid strokeDasharray='3 3' />
                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Doanh thu']} />
                <Bar dataKey='value' fill='#4f46e5' radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value='monthly' className='h-[250px] mt-0'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <XAxis dataKey='name' tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={(value) => `${value / 1000000}M`} tick={{ fontSize: 10 }} />
                <CartesianGrid strokeDasharray='3 3' />
                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Doanh thu']} />
                <Bar dataKey='value' fill='#10b981' radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value='category' className='h-[250px] mt-0'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <Pie
                  data={categoryData}
                  cx='50%'
                  cy='50%'
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill='#8884d8'
                  dataKey='value'
                >
                  {categoryData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Tỷ lệ']} />
                <Legend layout='horizontal' verticalAlign='bottom' align='center' />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
