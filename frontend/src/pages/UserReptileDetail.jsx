"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Menu, TrendingDown, MoreHorizontal } from "lucide-react"
import { SideBarUserReptile } from "../components/SideBarUserReptile"

export default function UserReptileDetail() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const weightData = [
    { month: "T1", value: 650 },
    { month: "T2", value: 700 },
    { month: "T3", value: 750 },
    { month: "T4", value: 720 },
    { month: "T5", value: 780 },
    { month: "T6", value: 800 },
    { month: "T7", value: 750 },
    { month: "T8", value: 790 },
    { month: "T9", value: 820 },
    { month: "T10", value: 780 },
    { month: "T11", value: 750 },
    { month: "T12", value: 770 },
  ]

  const sleepData = [
    { day: "Sáng", hours: 2 },
    { day: "Trưa", hours: 4 },
    { day: "Chiều", hours: 3 },
    { day: "Đêm", hours: 8 },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="relative h-48 bg-gradient-to-r from-teal-600 to-green-600 overflow-hidden">
        <img
          src="/chameleon-hero.jpg"
          alt="Chameleon"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30" />
        <div className="relative z-10 p-6 text-white">
          <h1 className="text-3xl font-bold">MĂNG ĐINH</h1>
          <p className="text-lg opacity-90">TẮC KÈ HOA</p>
        </div>
      </div>

      <div className="flex">
        {/* SideBarUserReptile Component */}
        <SideBarUserReptile isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="mb-6 lg:hidden">
            <Button variant="outline" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className="h-4 w-4" />
            </Button>
          </div>

          {/* Basic Information Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-center mb-6">THÔNG TIN CƠ BẢN</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Profile Picture */}
              <div className="flex justify-center">
                <Avatar className="w-32 h-32">
                  <AvatarImage src="/placeholder.svg?height=128&width=128" />
                  <AvatarFallback className="bg-blue-100">
                    <div className="w-full h-full bg-blue-200 rounded-full flex items-center justify-center">
                      <div className="w-12 h-12 bg-blue-400 rounded-full"></div>
                    </div>
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Basic Information Table */}
              <div className="md:col-span-1 lg:col-span-2">
                <div className="bg-white rounded-lg border p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium">Tên</span>
                        <span>Măng Đinh</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Miêu tả</span>
                        <span>Bò sát của MD</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Giống loài</span>
                        <span>Tắc kè hoa</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Tuổi</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full">
                            <div className="w-3/5 h-full bg-green-500 rounded-full"></div>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            5
                          </Badge>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Theo dõi từ</span>
                        <span>14/02/2025</span>
                      </div>
                      <div className="flex justify-end pt-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>Powered by</span>
                          <span className="font-semibold text-green-600">ReptilA</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Cards */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Weight Chart */}
              <Card className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-green-600 text-white">Tháng</Badge>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-center text-sm font-medium">Năm 2024</div>
                </CardHeader>
                <CardContent>
                  <div className="h-40 relative mb-4">
                    <svg className="w-full h-full" viewBox="0 0 300 160">
                      {/* Grid lines */}
                      <defs>
                        <pattern id="grid" width="25" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 25 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />

                      {/* Y-axis labels */}
                      <text x="10" y="20" fontSize="8" fill="#9ca3af">
                        300g
                      </text>
                      <text x="10" y="40" fontSize="8" fill="#9ca3af">
                        250g
                      </text>
                      <text x="10" y="60" fontSize="8" fill="#9ca3af">
                        200g
                      </text>
                      <text x="10" y="80" fontSize="8" fill="#9ca3af">
                        150g
                      </text>
                      <text x="10" y="100" fontSize="8" fill="#9ca3af">
                        100g
                      </text>
                      <text x="10" y="120" fontSize="8" fill="#9ca3af">
                        50g
                      </text>
                      <text x="15" y="140" fontSize="8" fill="#9ca3af">
                        0
                      </text>

                      {/* Line chart */}
                      <polyline
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2"
                        points="30,120 55,100 80,90 105,95 130,85 155,80 180,90 205,85 230,75 255,80 280,85 300,80"
                      />

                      {/* Data points */}
                      <circle cx="180" cy="90" r="4" fill="#10b981" />
                      <circle cx="180" cy="90" r="8" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.5" />

                      {/* Current value label */}
                      <rect x="165" y="70" width="30" height="15" fill="black" rx="2" />
                      <text x="180" y="80" fontSize="8" fill="white" textAnchor="middle">
                        70g
                      </text>

                      {/* X-axis labels */}
                      <text x="30" y="155" fontSize="8" fill="#9ca3af" textAnchor="middle">
                        T1
                      </text>
                      <text x="55" y="155" fontSize="8" fill="#9ca3af" textAnchor="middle">
                        T2
                      </text>
                      <text x="80" y="155" fontSize="8" fill="#9ca3af" textAnchor="middle">
                        T3
                      </text>
                      <text x="105" y="155" fontSize="8" fill="#9ca3af" textAnchor="middle">
                        T4
                      </text>
                      <text x="130" y="155" fontSize="8" fill="#9ca3af" textAnchor="middle">
                        T5
                      </text>
                      <text x="155" y="155" fontSize="8" fill="#9ca3af" textAnchor="middle">
                        T6
                      </text>
                      <text x="180" y="155" fontSize="8" fill="#9ca3af" textAnchor="middle">
                        T7
                      </text>
                      <text x="205" y="155" fontSize="8" fill="#9ca3af" textAnchor="middle">
                        T8
                      </text>
                      <text x="230" y="155" fontSize="8" fill="#9ca3af" textAnchor="middle">
                        T9
                      </text>
                      <text x="255" y="155" fontSize="8" fill="#9ca3af" textAnchor="middle">
                        T10
                      </text>
                      <text x="280" y="155" fontSize="8" fill="#9ca3af" textAnchor="middle">
                        T11
                      </text>
                      <text x="300" y="155" fontSize="8" fill="#9ca3af" textAnchor="middle">
                        T12
                      </text>
                    </svg>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Cân nặng</span>
                  </div>
                </CardContent>
              </Card>

              {/* Health Status */}
              <Card className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-blue-600 text-white">Sức khỏe</Badge>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-40">
                  <div className="text-center space-y-2">
                    <div className="text-4xl font-light text-gray-400">65</div>
                    <div className="flex items-center justify-center space-x-1">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      <span className="text-red-500 text-sm">8%</span>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <div className="text-sm">
                      Bệnh lý: <span className="font-medium">Không có</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sleep Chart */}
              <Card className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-green-600 text-white">Tháng</Badge>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-32 relative mb-4">
                    <svg className="w-full h-full" viewBox="0 0 200 120">
                      {/* Y-axis labels */}
                      <text x="10" y="15" fontSize="8" fill="#9ca3af">
                        3h
                      </text>
                      <text x="10" y="35" fontSize="8" fill="#9ca3af">
                        2h
                      </text>
                      <text x="10" y="55" fontSize="8" fill="#9ca3af">
                        1h
                      </text>
                      <text x="10" y="75" fontSize="8" fill="#9ca3af">
                        30p
                      </text>
                      <text x="10" y="95" fontSize="8" fill="#9ca3af">
                        20p
                      </text>

                      {/* Bar chart - Yesterday (gray bars) */}
                      <rect x="30" y="60" width="8" height="40" fill="#d1d5db" />
                      <rect x="60" y="40" width="8" height="60" fill="#d1d5db" />
                      <rect x="90" y="50" width="8" height="50" fill="#d1d5db" />
                      <rect x="120" y="30" width="8" height="70" fill="#d1d5db" />

                      {/* Bar chart - Today (green bars) */}
                      <rect x="40" y="50" width="8" height="50" fill="#10b981" />
                      <rect x="70" y="20" width="8" height="80" fill="#10b981" />
                      <rect x="100" y="40" width="8" height="60" fill="#10b981" />
                      <rect x="130" y="25" width="8" height="75" fill="#10b981" />
                    </svg>
                  </div>

                  {/* Time labels */}
                  <div className="grid grid-cols-4 gap-2 text-xs text-center text-gray-500 mb-4">
                    <span>Sáng</span>
                    <span>Trưa</span>
                    <span>Chiều</span>
                    <span>Tối</span>
                  </div>

                  {/* Analysis section */}
                  <div className="bg-gray-50 rounded-md p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Phân hồi</span>
                      <div className="flex items-center space-x-1">
                        <TrendingDown className="h-3 w-3 text-red-500" />
                        <span className="text-xs text-red-500">8%</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">Hoạt động ít hơn rõ rệt, cần thiết phải vận động nhiều hơn</p>
                    <div className="flex items-center space-x-4 text-xs">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span>Hôm qua</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Hôm nay</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
