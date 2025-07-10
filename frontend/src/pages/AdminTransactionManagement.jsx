import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { baseUrl } from '../config';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import paymentApi from '../api/paymentApi';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import '../css/AdminTransactionManagement.css';

const TRANSACTION_TYPES = [
  { value: 'all', label: 'Tất cả' },
  { value: 'payment', label: 'Thanh toán' },
  { value: 'refund', label: 'Hoàn tiền' },
  { value: 'subscription', label: 'Đăng ký' },
  { value: 'topup', label: 'Nạp tiền' },
];
const STATUS_TYPES = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: 'Đang chờ' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'failed', label: 'Thất bại' },
  { value: 'refunded', label: 'Đã hoàn tiền' },
];

const AdminTransactionManagement = () => {
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('management'); // 'management' or 'reports'
  
  // Management tab states
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [editTx, setEditTx] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  // Reports tab states
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [transactionType, setTransactionType] = useState('all');
  const [status, setStatus] = useState('all');

  useEffect(() => {
    if (user && hasRole('admin')) {
      if (activeTab === 'management') {
        fetchTransactions();
      } else {
        fetchReports();
      }
    }
  }, [user, activeTab, page, limit]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('refresh_token');
      const response = await axios.get(`${baseUrl}/reptitist/transactions/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setTransactions(response.data.transactions || []);
      setError('');
    } catch (err) {
      setError('Không thể tải dữ liệu giao dịch.');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      setReportsLoading(true);
      setReportsError('');
      const data = await paymentApi.getAdminFinancialReports({
        page,
        limit,
        startDate,
        endDate,
        transaction_type: transactionType,
        status,
      });
      setReports(data.transactions || []);
      setTotalPages(data.pagination?.pages || 1);
      setTotal(data.pagination?.total || 0);
    } catch (err) {
      setReportsError('Không thể tải báo cáo tài chính: ' + (err.response?.data?.message || err.message));
      setReports([]);
    } finally {
      setReportsLoading(false);
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchReports();
  };

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setTransactionType('all');
    setStatus('all');
    setPage(1);
    setTimeout(() => fetchReports(), 100);
  };

  // Xử lý filter thực tế
  const filterTransactions = () => {
    let filtered = [...transactions];
    if (statusFilter !== 'all') filtered = filtered.filter(tx => tx.status === statusFilter);
    if (userFilter.trim()) filtered = filtered.filter(tx => (tx.user?.username || tx.user_id)?.toLowerCase().includes(userFilter.trim().toLowerCase()));
    if (dateFilter !== 'all') {
      const now = new Date();
      let startDate;
      switch (dateFilter) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = null;
      }
      if (startDate) filtered = filtered.filter(tx => new Date(tx.transaction_date) >= startDate);
    }
    return filtered;
  };
  const filteredTransactions = filterTransactions();

  // Biểu đồ
  const statusCounts = filteredTransactions.reduce((acc, tx) => {
    acc[tx.status] = (acc[tx.status] || 0) + 1;
    return acc;
  }, {});
  const barChartData = Object.entries(statusCounts).map(([status, count]) => ({ name: status, value: count }));
  
  const typeCounts = filteredTransactions.reduce((acc, tx) => {
    acc[tx.transaction_type] = (acc[tx.transaction_type] || 0) + 1;
    return acc;
  }, {});
  const pieChartData = Object.entries(typeCounts).map(([type, count]) => ({ name: type, value: count }));
  
  const dateSums = {};
  filteredTransactions.forEach(tx => {
    const date = new Date(tx.transaction_date).toLocaleDateString('vi-VN');
    dateSums[date] = (dateSums[date] || 0) + tx.amount;
  });
  const lineChartData = Object.entries(dateSums).map(([date, sum]) => ({ name: date, value: sum }));

  // Xử lý xóa
  const handleDelete = async (id) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('refresh_token');
      await axios.delete(`${baseUrl}/reptitist/transactions/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setDeleteId(null);
      fetchTransactions();
    } catch (err) {
      alert(err?.response?.data?.message || 'Xóa thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  // Xử lý sửa
  const openEdit = (tx) => {
    setEditTx(tx);
    setEditForm({
      amount: tx.amount,
      transaction_type: tx.transaction_type,
      status: tx.status,
      description: tx.description || '',
    });
  };
  
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };
  
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const token = localStorage.getItem('refresh_token');
      await axios.put(`${baseUrl}/reptitist/transactions/${editTx._id}`, editForm, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setEditTx(null);
      fetchTransactions();
    } catch (err) {
      alert(err?.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  // Helper functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'pending': return 'status-pending';
      case 'failed': return 'status-failed';
      default: return 'status-pending';
    }
  };

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'subscription': return 'type-subscription';
      case 'topup': return 'type-topup';
      case 'refund': return 'type-refund';
      default: return 'type-subscription';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'pending': return 'Đang chờ';
      case 'failed': return 'Thất bại';
      default: return status;
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'subscription': return 'Đăng ký';
      case 'topup': return 'Nạp tiền';
      case 'refund': return 'Hoàn tiền';
      default: return type;
    }
  };

  // Export functions
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('BÁO CÁO TÀI CHÍNH', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Ngày xuất báo cáo: ${new Date().toLocaleDateString('vi-VN')}`, 20, 35);
    doc.text(`Tổng số giao dịch: ${total}`, 20, 45);
    doc.text(`Trang hiện tại: ${page}/${totalPages}`, 20, 55);
    
    // Filter info
    if (startDate || endDate || transactionType !== 'all' || status !== 'all') {
      doc.text('Thông tin lọc:', 20, 70);
      let yPos = 80;
      if (startDate) {
        doc.text(`Từ ngày: ${startDate}`, 30, yPos);
        yPos += 10;
      }
      if (endDate) {
        doc.text(`Đến ngày: ${endDate}`, 30, yPos);
        yPos += 10;
      }
      if (transactionType !== 'all') {
        doc.text(`Loại giao dịch: ${TRANSACTION_TYPES.find(t => t.value === transactionType)?.label}`, 30, yPos);
        yPos += 10;
      }
      if (status !== 'all') {
        doc.text(`Trạng thái: ${STATUS_TYPES.find(s => s.value === status)?.label}`, 30, yPos);
        yPos += 10;
      }
    }
    
    // Table header
    const tableY = 120;
    doc.setFontSize(10);
    doc.setFillColor(240, 240, 240);
    doc.rect(20, tableY, 170, 10, 'F');
    
    doc.text('Ngày giao dịch', 25, tableY + 7);
    doc.text('Người dùng', 60, tableY + 7);
    doc.text('Loại giao dịch', 90, tableY + 7);
    doc.text('Số tiền', 120, tableY + 7);
    doc.text('Phí', 140, tableY + 7);
    doc.text('Thực nhận', 160, tableY + 7);
    doc.text('Trạng thái', 180, tableY + 7);
    
    // Table data
    let currentY = tableY + 15;
    reports.forEach((tx, index) => {
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }
      
      doc.text(formatDate(tx.transaction_date).split(' ')[0], 25, currentY);
      doc.text(tx.user_id?.username || tx.user_id?.email || 'N/A', 60, currentY);
      doc.text(tx.transaction_type, 90, currentY);
      doc.text(formatCurrency(tx.amount), 120, currentY);
      doc.text(formatCurrency(tx.fee), 140, currentY);
      doc.text(formatCurrency(tx.net_amount), 160, currentY);
      doc.text(tx.status, 180, currentY);
      
      currentY += 8;
    });
    
    // Footer
    doc.setFontSize(10);
    doc.text(`Trang ${doc.getCurrentPageInfo().pageNumber}`, 105, 280, { align: 'center' });
    
    // Save file
    const fileName = `bao-cao-tai-chinh-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  const exportToDOCX = async () => {
    // Create table rows
    const tableRows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: 'Ngày giao dịch', alignment: AlignmentType.CENTER })] }),
          new TableCell({ children: [new Paragraph({ text: 'Người dùng', alignment: AlignmentType.CENTER })] }),
          new TableCell({ children: [new Paragraph({ text: 'Loại giao dịch', alignment: AlignmentType.CENTER })] }),
          new TableCell({ children: [new Paragraph({ text: 'Số tiền', alignment: AlignmentType.CENTER })] }),
          new TableCell({ children: [new Paragraph({ text: 'Phí', alignment: AlignmentType.CENTER })] }),
          new TableCell({ children: [new Paragraph({ text: 'Thực nhận', alignment: AlignmentType.CENTER })] }),
          new TableCell({ children: [new Paragraph({ text: 'Trạng thái', alignment: AlignmentType.CENTER })] }),
          new TableCell({ children: [new Paragraph({ text: 'Mô tả', alignment: AlignmentType.CENTER })] }),
        ],
      }),
    ];

    // Add data rows
    reports.forEach(tx => {
      tableRows.push(
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: formatDate(tx.transaction_date).split(' ')[0] })] }),
            new TableCell({ children: [new Paragraph({ text: tx.user_id?.username || tx.user_id?.email || 'N/A' })] }),
            new TableCell({ children: [new Paragraph({ text: tx.transaction_type })] }),
            new TableCell({ children: [new Paragraph({ text: formatCurrency(tx.amount) })] }),
            new TableCell({ children: [new Paragraph({ text: formatCurrency(tx.fee) })] }),
            new TableCell({ children: [new Paragraph({ text: formatCurrency(tx.net_amount) })] }),
            new TableCell({ children: [new Paragraph({ text: tx.status })] }),
            new TableCell({ children: [new Paragraph({ text: tx.description || '' })] }),
          ],
        })
      );
    });

    // Create document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: 'BÁO CÁO TÀI CHÍNH',
              heading: 'Heading1',
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: `Ngày xuất báo cáo: ${new Date().toLocaleDateString('vi-VN')}`,
              spacing: { before: 400 },
            }),
            new Paragraph({
              text: `Tổng số giao dịch: ${total}`,
            }),
            new Paragraph({
              text: `Trang hiện tại: ${page}/${totalPages}`,
            }),
            new Paragraph({
              text: '',
              spacing: { before: 400 },
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: tableRows,
            }),
          ],
        },
      ],
    });

    // Generate and save file
    const blob = await Packer.toBlob(doc);
    const fileName = `bao-cao-tai-chinh-${new Date().toISOString().split('T')[0]}.docx`;
    saveAs(blob, fileName);
  };

  if (!user || !hasRole('admin')) {
    return (
      <>
        <Header />
        <div className="admin-transaction-management">
          <div className="um-no-access">
            <i className="fas fa-exclamation-triangle um-warning-icon"></i>
            <h2>Không có quyền truy cập</h2>
            <p>Bạn không có quyền xem trang này. Chỉ có Admin mới có thể truy cập.</p>
            <a href="/" className="pm-btn pm-btn-primary">
              <i className="fas fa-home"></i>
              Về trang chủ
            </a>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="admin-transaction-management">
        {/* Page Header */}
        <div className="pm-page-header">
          <div className="pm-page-header-content">
            <div className="pm-page-header-text">
              <h1>
                <i className="fas fa-chart-line"></i>
                Quản lý giao dịch & Báo cáo tài chính
              </h1>
              <p>Thống kê, chỉnh sửa, xóa và lọc các giao dịch của hệ thống</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="pm-tabs-section">
          <div className="pm-tabs">
            <button 
              className={`pm-tab ${activeTab === 'management' ? 'pm-tab-active' : ''}`}
              onClick={() => setActiveTab('management')}
            >
              <i className="fas fa-cogs"></i>
              Quản lý giao dịch
            </button>
            <button 
              className={`pm-tab ${activeTab === 'reports' ? 'pm-tab-active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <i className="fas fa-file-invoice-dollar"></i>
              Báo cáo tài chính
            </button>
          </div>
        </div>

        {/* Management Tab Content */}
        {activeTab === 'management' && (
          <>
            {/* Filter section */}
            <div className="pm-filters-section">
              <div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '150px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Trạng thái:</label>
                    <select 
                      className="pm-filter-select" 
                      value={statusFilter} 
                      onChange={e => setStatusFilter(e.target.value)}
                    >
                      <option value="all">Tất cả trạng thái</option>
                      <option value="completed">Hoàn thành</option>
                      <option value="pending">Đang chờ</option>
                      <option value="failed">Thất bại</option>
                    </select>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '150px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Thời gian:</label>
                    <select 
                      className="pm-filter-select" 
                      value={dateFilter} 
                      onChange={e => setDateFilter(e.target.value)}
                    >
                      <option value="all">Tất cả thời gian</option>
                      <option value="today">Hôm nay</option>
                      <option value="week">Tuần này</option>
                      <option value="month">Tháng này</option>
                      <option value="year">Năm nay</option>
                    </select>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '200px', flex: 1 }}>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Tìm kiếm:</label>
                    <input 
                      className="pm-search-input" 
                      type="text" 
                      placeholder="Tìm theo tên user..." 
                      value={userFilter} 
                      onChange={e => setUserFilter(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts section */}
            <div className="transaction-charts-grid">
              <div className="chart-card">
                <h3>
                  <i className="fas fa-chart-bar"></i>
                  Trạng thái giao dịch
                </h3>
                <div className="chart-container">
                  {barChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={barChartData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="chart-empty">
                      <i className="fas fa-chart-bar"></i>
                      <span>Không có dữ liệu</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="chart-card">
                <h3>
                  <i className="fas fa-chart-line"></i>
                  Tổng tiền theo ngày
                </h3>
                <div className="chart-container">
                  {lineChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={lineChartData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="chart-empty">
                      <i className="fas fa-chart-line"></i>
                      <span>Không có dữ liệu</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="chart-card">
                <h3>
                  <i className="fas fa-chart-pie"></i>
                  Loại giao dịch
                </h3>
                <div className="chart-container">
                  {pieChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie 
                          data={pieChartData} 
                          dataKey="value" 
                          nameKey="name" 
                          cx="50%" 
                          cy="50%" 
                          outerRadius={80} 
                          label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][index % 5]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="chart-empty">
                      <i className="fas fa-chart-pie"></i>
                      <span>Không có dữ liệu</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Transaction table */}
            <div className="pm-table-section">
              <div>
                <h2>Danh sách giao dịch ({filteredTransactions.length})</h2>
                {loading ? (
                  <div className="pm-loading-state">
                    <div className="loading-spinner"></div>
                    <p>Đang tải dữ liệu...</p>
                  </div>
                ) : error ? (
                  <div style={{ color: '#ef4444', textAlign: 'center', padding: '40px' }}>
                    <i className="fas fa-exclamation-circle" style={{ fontSize: '48px', marginBottom: '16px' }}></i>
                    <p>{error}</p>
                  </div>
                ) : filteredTransactions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                    <i className="fas fa-inbox" style={{ fontSize: '48px', marginBottom: '16px' }}></i>
                    <p>Không có giao dịch nào</p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="pm-products-table">
                      <thead>
                        <tr>
                          <th>ID Giao dịch</th>
                          <th>User</th>
                          <th>Loại giao dịch</th>
                          <th>Số tiền</th>
                          <th>Trạng thái</th>
                          <th>Ngày giao dịch</th>
                          <th>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.map(tx => (
                          <tr key={tx._id} className="pm-table-row">
                            <td>
                              <span className="transaction-id">{tx._id}</span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  fontSize: '14px',
                                  fontWeight: '600'
                                }}>
                                  {(tx.user_id?.username || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div style={{ fontWeight: '600', color: '#1f2937' }}>
                                    {tx.user_id?.username || 'N/A'}
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                    ID: {tx.user_id?._id?.slice(-8) || 'N/A'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className={getTypeBadgeClass(tx.transaction_type)}>
                                {getTypeText(tx.transaction_type)}
                              </span>
                            </td>
                            <td>
                              <span className={`transaction-amount ${tx.amount > 0 ? 'positive' : 'negative'}`}>
                                {formatCurrency(tx.amount)}
                              </span>
                            </td>
                            <td>
                              <span className={getStatusBadgeClass(tx.status)}>
                                {getStatusText(tx.status)}
                              </span>
                            </td>
                            <td>
                              <div>
                                <div style={{ fontWeight: '500', color: '#1f2937' }}>
                                  {new Date(tx.transaction_date).toLocaleDateString('vi-VN')}
                                </div>
                                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                  {new Date(tx.transaction_date).toLocaleTimeString('vi-VN')}
                                </div>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                  className="pm-btn pm-btn-danger" 
                                  disabled={tx.status !== 'pending' || actionLoading} 
                                  onClick={() => setDeleteId(tx._id)}
                                  style={{ fontSize: '12px', padding: '6px 12px' }}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                                <button 
                                  className="pm-btn pm-btn-edit" 
                                  disabled={actionLoading} 
                                  onClick={() => openEdit(tx)}
                                  style={{ fontSize: '12px', padding: '6px 12px' }}
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Reports Tab Content */}
        {activeTab === 'reports' && (
          <>
            <form className="pm-filters-section" onSubmit={handleFilterSubmit}>
              <div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '150px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Loại giao dịch:</label>
                    <select 
                      className="pm-filter-select" 
                      value={transactionType} 
                      onChange={e => setTransactionType(e.target.value)}
                    >
                      {TRANSACTION_TYPES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '150px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Trạng thái:</label>
                    <select 
                      className="pm-filter-select" 
                      value={status} 
                      onChange={e => setStatus(e.target.value)}
                    >
                      {STATUS_TYPES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '150px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Từ ngày:</label>
                    <input 
                      className="pm-filter-input" 
                      type="date" 
                      value={startDate} 
                      onChange={e => setStartDate(e.target.value)} 
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '150px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Đến ngày:</label>
                    <input 
                      className="pm-filter-input" 
                      type="date" 
                      value={endDate} 
                      onChange={e => setEndDate(e.target.value)} 
                    />
                  </div>
                  <button type="submit" className="pm-btn pm-btn-primary">
                    <i className="fas fa-search"></i> Lọc
                  </button>
                  <button type="button" className="pm-btn pm-btn-secondary" onClick={handleResetFilters}>
                    <i className="fas fa-undo"></i> Đặt lại
                  </button>
                </div>
              </div>
            </form>

            <div className="pm-table-section">
              <div>
                <h2>Báo cáo tài chính</h2>
                {reportsLoading ? (
                  <div className="pm-loading-state">
                    <div className="loading-spinner"></div>
                    <p>Đang tải dữ liệu...</p>
                  </div>
                ) : reportsError ? (
                  <div style={{ color: '#ef4444', textAlign: 'center', padding: '40px' }}>
                    <i className="fas fa-exclamation-circle" style={{ fontSize: '48px', marginBottom: '16px' }}></i>
                    <p>{reportsError}</p>
                    <button className="pm-btn pm-btn-primary" onClick={fetchReports}>
                      <i className="fas fa-redo"></i> Thử lại
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '1rem', background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                      <span>Tổng số giao dịch: <b>{total}</b></span>
                      <span>Trang: <b>{page}/{totalPages}</b></span>
                    </div>
                    
                    {/* Export buttons */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', padding: '1rem', background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                      <button 
                        className="pm-btn pm-btn-primary" 
                        onClick={exportToPDF}
                        disabled={reports.length === 0}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                      >
                        <i className="fas fa-file-pdf"></i>
                        Xuất PDF
                      </button>
                      <button 
                        className="pm-btn pm-btn-secondary" 
                        onClick={exportToDOCX}
                        disabled={reports.length === 0}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                      >
                        <i className="fas fa-file-word"></i>
                        Xuất DOCX
                      </button>
                      <div style={{ marginLeft: 'auto', fontSize: '0.875rem', color: '#6b7280' }}>
                        {reports.length > 0 ? `Xuất ${reports.length} giao dịch` : 'Không có dữ liệu để xuất'}
                      </div>
                    </div>
                    
                    <div style={{ overflowX: 'auto' }}>
                      <table className="pm-products-table">
                        <thead>
                          <tr>
                            <th>Ngày giao dịch</th>
                            <th>Người dùng</th>
                            <th>Loại giao dịch</th>
                            <th>Số tiền</th>
                            <th>Phí</th>
                            <th>Thực nhận</th>
                            <th>Trạng thái</th>
                            <th>Mô tả</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reports.length === 0 ? (
                            <tr><td colSpan="8" style={{textAlign: 'center', padding: '2rem'}}>Không có dữ liệu</td></tr>
                          ) : reports.map(tx => (
                            <tr key={tx._id} className="pm-table-row">
                              <td>{formatDate(tx.transaction_date)}</td>
                              <td>{tx.user_id?.username || tx.user_id?.email || 'N/A'}</td>
                              <td>{tx.transaction_type}</td>
                              <td>{formatCurrency(tx.amount)}</td>
                              <td>{formatCurrency(tx.fee)}</td>
                              <td>{formatCurrency(tx.net_amount)}</td>
                              <td>{tx.status}</td>
                              <td>{tx.description || ''}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Pagination */}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem', padding: '1rem', background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                      <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="pm-btn pm-btn-secondary">
                        <i className="fas fa-chevron-left"></i> Trước
                      </button>
                      <span>Trang {page} / {totalPages}</span>
                      <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="pm-btn pm-btn-secondary">
                        Sau <i className="fas fa-chevron-right"></i>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {/* Modal xác nhận xóa */}
        {deleteId && (
          <div className="pm-modal-overlay">
            <div className="pm-modal pm-delete-modal">
              <div className="pm-modal-header">
                <h3>
                  <i className="fas fa-exclamation-triangle" style={{ color: '#ef4444' }}></i>
                  Xác nhận xóa giao dịch
                </h3>
              </div>
              <div className="pm-modal-body">
                <p>Bạn có chắc chắn muốn xóa giao dịch này không? Hành động này không thể hoàn tác.</p>
              </div>
              <div className="pm-modal-footer">
                <button 
                  className="pm-btn pm-btn-secondary" 
                  onClick={() => setDeleteId(null)} 
                  disabled={actionLoading}
                >
                  <i className="fas fa-times"></i>
                  Hủy
                </button>
                <button 
                  className="pm-btn pm-btn-danger" 
                  onClick={() => handleDelete(deleteId)} 
                  disabled={actionLoading}
                >
                  <i className="fas fa-trash"></i>
                  {actionLoading ? 'Đang xóa...' : 'Xác nhận xóa'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal sửa giao dịch */}
        {editTx && (
          <div className="pm-modal-overlay">
            <form className="pm-modal" onSubmit={handleEditSubmit} style={{ minWidth: '400px' }}>
              <div className="pm-modal-header">
                <h3>
                  <i className="fas fa-edit" style={{ color: '#f59e0b' }}></i>
                  Chỉnh sửa giao dịch
                </h3>
              </div>
              <div className="pm-modal-body">
                <div className="pm-form-group">
                  <label>Số tiền:</label>
                  <input 
                    className="pm-form-input" 
                    name="amount" 
                    type="number" 
                    value={editForm.amount} 
                    disabled 
                    style={{ background: '#f3f4f6', color: '#6b7280' }}
                  />
                  <small style={{ color: '#6b7280', fontSize: '12px' }}>Số tiền không thể thay đổi</small>
                </div>
                
                <div className="pm-form-group">
                  <label>Loại giao dịch:</label>
                  <input 
                    className="pm-form-input" 
                    name="transaction_type" 
                    value={getTypeText(editForm.transaction_type)} 
                    disabled 
                    style={{ background: '#f3f4f6', color: '#6b7280' }}
                  />
                  <small style={{ color: '#6b7280', fontSize: '12px' }}>Loại giao dịch không thể thay đổi</small>
                </div>
                
                <div className="pm-form-group">
                  <label>Trạng thái: <span style={{ color: '#ef4444' }}>*</span></label>
                  <select 
                    className="pm-form-input" 
                    name="status" 
                    value={editForm.status} 
                    onChange={handleEditChange} 
                    required
                  >
                    <option value="pending">Đang chờ</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="failed">Thất bại</option>
                  </select>
                </div>
                
                <div className="pm-form-group">
                  <label>Mô tả:</label>
                  <input 
                    className="pm-form-input" 
                    name="description" 
                    value={editForm.description} 
                    disabled 
                    style={{ background: '#f3f4f6', color: '#6b7280' }}
                  />
                  <small style={{ color: '#6b7280', fontSize: '12px' }}>Mô tả không thể thay đổi</small>
                </div>
              </div>
              <div className="pm-modal-footer">
                <button 
                  className="pm-btn pm-btn-secondary" 
                  type="button" 
                  onClick={() => setEditTx(null)} 
                  disabled={actionLoading}
                >
                  <i className="fas fa-times"></i>
                  Hủy
                </button>
                <button 
                  className="pm-btn pm-btn-primary" 
                  type="submit" 
                  disabled={actionLoading}
                >
                  <i className="fas fa-save"></i>
                  {actionLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default AdminTransactionManagement;