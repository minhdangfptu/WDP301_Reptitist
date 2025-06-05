// import { Button } from "@/components/ui/button"

export function SideBarUserReptile({ isOpen, onClose }) {
  const menuItems = [
    {
      title: "THÔNG TIN CƠ BẢN",
      items: ["Tên", "Tuổi", "Giống loài", "Cân nặng", "Sức khỏe", "Bệnh lý", "Tình trạng hoạt động"],
    },
    { title: "THEO DÕI SỨC KHỎE", items: ["Tăng trưởng", "Chế độ dinh dưỡng", "Lịch sử điều trị"] },
    { title: "GỢI Ý CẢI THIỆN", items: ["Nâng cao hoạt động", "Môi trường", "Dinh dưỡng", "Bệnh lý"] },
    { title: "CÔNG CỤ", items: ["Nhật ký hàng ngày", "Lịch", "Ghi chú", "Chia sẻ thông tin"] },
  ]

  return (
    <>
      {/* SideBarUserReptile */}
      <div
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } fixed lg:relative lg:translate-x-0 z-30 w-64 h-screen bg-white shadow-lg transition-transform duration-300 ease-in-out`}
      >
        {/* SideBarUserReptile Header */}
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">MD</span>
            </div>
            <span className="font-semibold">Măng Đinh</span>
          </div>
        </div>

        {/* SideBarUserReptile Content */}
        <div className="p-4 space-y-6 overflow-y-auto h-full">
          {menuItems.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold text-sm text-gray-600 mb-2">{section.title}</h3>
              <ul className="space-y-1">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start px-2 py-1 h-auto text-sm text-gray-700 hover:bg-gray-100 font-normal"
                    >
                      {item}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile SideBarUserReptile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={onClose} />}
    </>
  )
}
