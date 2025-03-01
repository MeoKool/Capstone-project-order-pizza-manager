import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import React, { useState } from 'react'
import TableManagement from './table-management'
import ZoneManagement from './zone-management'

const InTables: React.FC = () => {

    const [activeTab, setActiveTab] = useState("tables")

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className={`space-y-8`}>
            <TabsList className=''>
                <TabsTrigger value="tables">Quản lý bàn ăn</TabsTrigger>
                <TabsTrigger value="zones">Quản lý khu vực</TabsTrigger>
            </TabsList>
            <TabsContent value="tables" className="w-full">
                <TableManagement />
            </TabsContent>
            <TabsContent value="zones" className="w-full">
                <ZoneManagement />
            </TabsContent>
        </Tabs>
    )
}

export default InTables