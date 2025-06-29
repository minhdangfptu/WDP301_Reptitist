"use client";

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Card, Table, Container } from "react-bootstrap";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { baseUrl } from '../config';
// Internal CSS styles  
const styles = {
  pageContainer: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%)",
    padding: "2rem 0",
  },
  headerSection: {
    marginBottom: "2rem",
  },
  backButton: {
    background: "none",
    border: "none",
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
    marginBottom: "1rem",
    padding: "0.5rem 0",
    fontSize: "0.95rem",
    cursor: "pointer",
    transition: "color 0.2s ease",
  },
  pageTitle: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "0.5rem",
  },
  iconContainer: {
    width: "48px",
    height: "48px",
    backgroundColor: "#dcfce7",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  mainTitle: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#111827",
    margin: 0,
  },
  subtitle: {
    color: "#6b7280",
    fontSize: "1rem",
    margin: 0,
  },
  sectionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(229, 231, 235, 0.5)",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    marginBottom: "1.5rem",
  },
  sectionHeader: {
    backgroundColor: "rgba(249, 250, 251, 0.8)",
    borderBottom: "1px solid rgba(229, 231, 235, 0.5)",
    padding: "1rem 1.25rem",
    borderRadius: "12px 12px 0 0",
  },
  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "1.125rem",
    fontWeight: "600",
    margin: 0,
    color: "#374151",
  },
  sectionContent: {
    padding: "1.25rem",
  },
  currentWeightContainer: {
    maxWidth: "300px",
  },
  formLabel: {
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "0.25rem",
  },
  formInput: {
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    padding: "0.5rem 0.75rem",
    fontSize: "0.875rem",
    transition: "all 0.2s ease",
    backgroundColor: "#ffffff",
  },
  tableContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    overflow: "hidden",
  },
  tableHeader: {
    backgroundColor: "rgba(249, 250, 251, 0.8)",
  },
  tableHeaderCell: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#374151",
    padding: "0.75rem 1rem",
    border: "none",
    borderBottom: "1px solid #e5e7eb",
  },
  tableRow: {
    transition: "background-color 0.2s ease",
  },
  tableCell: {
    padding: "0.5rem 1rem",
    border: "none",
    borderBottom: "1px solid #f3f4f6",
    verticalAlign: "middle",
  },
  addButton: {
    backgroundColor: "#ffffff",
    border: "1px solid #d1d5db",
    color: "#16a34a",
    fontSize: "0.875rem",
    padding: "0.375rem 0.75rem",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginTop: "0.75rem",
    transition: "all 0.2s ease",
  },
  removeButton: {
    backgroundColor: "transparent",
    border: "1px solid transparent",
    color: "#dc2626",
    padding: "0.25rem",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },
  actionButtons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
    paddingTop: "1.5rem",
  },
  backActionButton: {
    backgroundColor: "#ffffff",
    border: "1px solid #d1d5db",
    color: "#374151",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    transition: "all 0.2s ease",
  },
  saveButton: {
    backgroundColor: "#16a34a",
    border: "1px solid #16a34a",
    color: "#ffffff",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    transition: "all 0.2s ease",
  },
  textarea: {
    minHeight: "60px",
    resize: "vertical",
  },
  checkbox: {
    width: "16px",
    height: "16px",
    accentColor: "#16a34a",
  },
  wideTable: {
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
  },
};

// Icon components
const ActivityIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#16a34a"
    strokeWidth="2"
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const ScaleIcon = ({ color = "currentColor" }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
  >
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="M7 21h10" />
    <path d="M12 3v18" />
    <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
  </svg>
);

const MoonIcon = ({ color = "currentColor" }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

const StethoscopeIcon = ({ color = "currentColor" }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
  >
    <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
    <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
    <circle cx="20" cy="10" r="2" />
  </svg>
);

const AppleIcon = ({ color = "currentColor" }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
  >
    <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
    <path d="M10 2c1 .5 2 2 2 5" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

const PlusIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

const MinusIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M5 12h14" />
  </svg>
);

const SaveIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

function ReptileHealthTrackingPage() {
  const { reptileId } = useParams();
  const navigate = useNavigate();
  const [currentWeight, setCurrentWeight] = useState("");
  const [weightHistory, setWeightHistory] = useState([
    { date: "", weight: "" },
  ]);
  const [sleepingStatus, setSleepingStatus] = useState([
    { status: "", date: "" },
  ]);
  const [sleepingHistory, setSleepingHistory] = useState([
    { date: "", hours: "" },
  ]);
  const [treatmentHistory, setTreatmentHistory] = useState([
    {
      disease: "",
      treatment_date: "",
      next_treatment_date: "",
      doctor_feedback: "",
      treatment_medicine: "",
      note: "",
    },
  ]);
  const [nutritionHistory, setNutritionHistory] = useState([
    {
      created_at: "",
      food_items: "",
      food_quantity: "",
      is_fasting: false,
      feces_condition: "",
    },
  ]);
  const [noTreatment, setNoTreatment] = useState(false);

  // Handle adding/removing rows for tables
  const handleAddRow = (setter, row) => setter((prev) => [...prev, row]);
  const handleRemoveRow = (setter, idx) =>
    setter((prev) => prev.filter((_, i) => i !== idx));

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      reptileId,
      current_weight: currentWeight,
      weight_history: weightHistory,
      sleeping_status: sleepingStatus,
      sleeping_history: sleepingHistory,
      treatment_history: noTreatment ? [] : treatmentHistory,
      nutrition_history: nutritionHistory,
    };
    try {
      await axios.put(
        `${baseUrl}/reptitist/pet/health-history/${reptileId}`,
        data
      );
      toast.success("Đã lưu dữ liệu điều trị!");
      setTimeout(() => {
        navigate(`/your-pet/detail/${reptileId}`);
      }, 1500);
    } catch (error) {
      toast.error("Có lỗi khi lưu dữ liệu!");
      console.error(error);
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />
      <Header />
      <div style={styles.pageContainer}>
        <Container>
          <div style={styles.headerSection}>
            <button
              style={styles.backButton}
              onClick={() => navigate(-1)}
              onMouseEnter={(e) => (e.target.style.color = "#374151")}
              onMouseLeave={(e) => (e.target.style.color = "#6b7280")}
            >
              <ArrowLeftIcon />
              <span style={{ marginLeft: "0.5rem" }}>Quay lại</span>
            </button>

            <div style={styles.pageTitle}>
              <div style={styles.iconContainer}>
                <ActivityIcon />
              </div>
              <div>
                <h1 style={styles.mainTitle}>Thêm dữ liệu theo dõi sức khỏe</h1>
                <p style={styles.subtitle}>
                  Ghi lại thông tin sức khỏe chi tiết cho thú cưng của bạn
                  <div style={{ fontSize: 12, color: "red" }}>Lưu ý: Đây là dữ liệu để AI có thể học hỏi và cải thiện dữ liệu của bạn. 
                    <br></br>Dữ liệu theo dõi sức khỏe không thể sửa đổi. Vui lòng kiểm tra kỹ trước khi lưu.</div>
                </p>
                
              </div>
            </div>
          </div>

          <Form onSubmit={handleSubmit}>
            {/* Current Weight */}
            <Card style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>
                  <ScaleIcon color="#2563eb" />
                  Cân nặng hiện tại
                </h3>
              </div>
              <Card.Body style={styles.sectionContent}>
                <div style={styles.currentWeightContainer}>
                  <Form.Group>
                    <Form.Label style={styles.formLabel}>
                      Cân nặng (gram)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      value={currentWeight}
                      onChange={(e) => setCurrentWeight(e.target.value)}
                      placeholder="Nhập cân nặng hiện tại của bò sát"
                      style={styles.formInput}
                      required
                      min={0}
                      onFocus={(e) => (e.target.style.borderColor = "#16a34a")}
                      onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                    />
                  </Form.Group>
                </div>
              </Card.Body>
            </Card>

            {/* Sleeping Status */}
            <Card style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>
                  <MoonIcon color="#4f46e5" />
                  Trạng thái ngủ gần nhất
                </h3>
              </div>
              <Card.Body style={styles.sectionContent}>
                <div style={styles.tableContainer}>
                  <Table responsive className="mb-0">
                    <thead style={styles.tableHeader}>
                      <tr>
                        <th style={styles.tableHeaderCell}>Trạng thái</th>
                        <th style={styles.tableHeaderCell}>Ngày</th>
                        <th
                          style={{ ...styles.tableHeaderCell, width: "60px" }}
                        ></th>
                      </tr>
                    </thead>
                    <tbody>
                      {sleepingStatus.map((row, idx) => (
                        <tr
                          key={idx}
                          style={styles.tableRow}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "rgba(249, 250, 251, 0.5)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                        >
                          <td style={styles.tableCell}>
                            <Form.Control
                              value={row.status}
                              onChange={(e) =>
                                setSleepingStatus((h) =>
                                  h.map((r, i) =>
                                    i === idx
                                      ? { ...r, status: e.target.value }
                                      : r
                                  )
                                )
                              }
                              placeholder="Trạng thái ngủ của bò sát (mất ngủ, ngủ ít, ngủ nhiều, ngủ bình thường)"
                              style={styles.formInput}
                              required
                            />
                          </td>
                          <td style={styles.tableCell}>
                            <Form.Control
                              type="date"
                              value={row.date}
                              onChange={(e) =>
                                setSleepingStatus((h) =>
                                  h.map((r, i) =>
                                    i === idx
                                      ? { ...r, date: e.target.value }
                                      : r
                                  )
                                )
                              }
                              style={styles.formInput}
                              required
                            />
                          </td>
                          <td style={styles.tableCell}>
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveRow(setSleepingStatus, idx)
                              }
                              disabled={sleepingStatus.length === 1}
                              style={{
                                ...styles.removeButton,
                                opacity: sleepingStatus.length === 1 ? 0.5 : 1,
                                cursor:
                                  sleepingStatus.length === 1
                                    ? "not-allowed"
                                    : "pointer",
                              }}
                              onMouseEnter={(e) => {
                                if (sleepingStatus.length > 1) {
                                  e.target.style.backgroundColor = "#fef2f2";
                                  e.target.style.borderColor = "#fecaca";
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = "transparent";
                                e.target.style.borderColor = "transparent";
                              }}
                            >
                              <MinusIcon />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleAddRow(setSleepingStatus, { status: "", date: "" })
                  }
                  style={styles.addButton}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#f0fdf4";
                    e.target.style.borderColor = "#16a34a";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#ffffff";
                    e.target.style.borderColor = "#d1d5db";
                  }}
                >
                  <PlusIcon />
                  Thêm dòng
                </button>
              </Card.Body>
            </Card>

            {/* Sleeping History */}
            <Card style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>
                  <MoonIcon color="#475569" />
                  Dữ liệu giấc ngủ
                </h3>
              </div>
              <Card.Body style={styles.sectionContent}>
                <div style={styles.tableContainer}>
                  <Table responsive className="mb-0">
                    <thead style={styles.tableHeader}>
                      <tr>
                        <th style={styles.tableHeaderCell}>Ngày</th>
                        <th style={styles.tableHeaderCell}>Giờ ngủ</th>
                        <th
                          style={{ ...styles.tableHeaderCell, width: "60px" }}
                        ></th>
                      </tr>
                    </thead>
                    <tbody>
                      {sleepingHistory.map((row, idx) => (
                        <tr
                          key={idx}
                          style={styles.tableRow}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "rgba(249, 250, 251, 0.5)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                        >
                          <td style={styles.tableCell}>
                            <Form.Control
                              type="date"
                              value={row.date}
                              onChange={(e) =>
                                setSleepingHistory((h) =>
                                  h.map((r, i) =>
                                    i === idx
                                      ? { ...r, date: e.target.value }
                                      : r
                                  )
                                )
                              }
                              style={styles.formInput}
                              required
                            />
                          </td>
                          <td style={styles.tableCell}>
                            <Form.Control
                              type="number"
                              value={row.hours}
                              onChange={(e) =>
                                setSleepingHistory((h) =>
                                  h.map((r, i) =>
                                    i === idx
                                      ? { ...r, hours: e.target.value }
                                      : r
                                  )
                                )
                              }
                              placeholder="Số giờ ngủ của bò sát"
                              style={styles.formInput}
                              required
                              min={0}
                            />
                          </td>
                          <td style={styles.tableCell}>
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveRow(setSleepingHistory, idx)
                              }
                              disabled={sleepingHistory.length === 1}
                              style={{
                                ...styles.removeButton,
                                opacity: sleepingHistory.length === 1 ? 0.5 : 1,
                                cursor:
                                  sleepingHistory.length === 1
                                    ? "not-allowed"
                                    : "pointer",
                              }}
                              onMouseEnter={(e) => {
                                if (sleepingHistory.length > 1) {
                                  e.target.style.backgroundColor = "#fef2f2";
                                  e.target.style.borderColor = "#fecaca";
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = "transparent";
                                e.target.style.borderColor = "transparent";
                              }}
                            >
                              <MinusIcon />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleAddRow(setSleepingHistory, { date: "", hours: "" })
                  }
                  style={styles.addButton}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#f0fdf4";
                    e.target.style.borderColor = "#16a34a";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#ffffff";
                    e.target.style.borderColor = "#d1d5db";
                  }}
                >
                  <PlusIcon />
                  Thêm dòng
                </button>
              </Card.Body>
            </Card>

            {/* Treatment History */}
            <Card style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>
                  <StethoscopeIcon color="#dc2626" />
                  Thông tin điều trị
                </h3>
              </div>
              <Card.Body style={styles.sectionContent}>
                {/* Nếu chưa từng điều trị thì ẩn bảng */}
                {!noTreatment && (
                  <>
                    <div
                      style={{ ...styles.tableContainer, ...styles.wideTable }}
                    >
                      <Table responsive className="mb-0">
                        <thead style={styles.tableHeader}>
                          <tr>
                            <th
                              style={{
                                ...styles.tableHeaderCell,
                                minWidth: "120px",
                              }}
                            >
                              Bệnh
                            </th>
                            <th
                              style={{
                                ...styles.tableHeaderCell,
                                minWidth: "150px",
                              }}
                            >
                              Ngày điều trị
                            </th>
                            <th
                              style={{
                                ...styles.tableHeaderCell,
                                minWidth: "150px",
                              }}
                            >
                              Ngày tái khám
                            </th>
                            <th
                              style={{
                                ...styles.tableHeaderCell,
                                minWidth: "120px",
                              }}
                            >
                              Thuốc
                            </th>
                            <th
                              style={{
                                ...styles.tableHeaderCell,
                                minWidth: "150px",
                              }}
                            >
                              Phản hồi bác sĩ
                            </th>
                            <th
                              style={{
                                ...styles.tableHeaderCell,
                                minWidth: "120px",
                              }}
                            >
                              Ghi chú
                            </th>
                            <th
                              style={{
                                ...styles.tableHeaderCell,
                                width: "60px",
                              }}
                            ></th>
                          </tr>
                        </thead>
                        <tbody>
                          {treatmentHistory.map((row, idx) => (
                            <tr
                              key={idx}
                              style={styles.tableRow}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "rgba(249, 250, 251, 0.5)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "transparent")
                              }
                            >
                              <td style={styles.tableCell}>
                                <Form.Control
                                  value={row.disease}
                                  onChange={(e) =>
                                    setTreatmentHistory((h) =>
                                      h.map((r, i) =>
                                        i === idx
                                          ? { ...r, disease: e.target.value }
                                          : r
                                      )
                                    )
                                  }
                                  placeholder="Tên bệnh..."
                                  style={styles.formInput}
                                  required
                                />
                              </td>
                              <td style={styles.tableCell}>
                                <Form.Control
                                  type="date"
                                  value={row.treatment_date}
                                  onChange={(e) =>
                                    setTreatmentHistory((h) =>
                                      h.map((r, i) =>
                                        i === idx
                                          ? {
                                              ...r,
                                              treatment_date: e.target.value,
                                            }
                                          : r
                                      )
                                    )
                                  }
                                  style={styles.formInput}
                                  required
                                />
                              </td>
                              <td style={styles.tableCell}>
                                <Form.Control
                                  type="date"
                                  value={row.next_treatment_date}
                                  onChange={(e) =>
                                    setTreatmentHistory((h) =>
                                      h.map((r, i) =>
                                        i === idx
                                          ? {
                                              ...r,
                                              next_treatment_date:
                                                e.target.value,
                                            }
                                          : r
                                      )
                                    )
                                  }
                                  style={styles.formInput}
                                />
                              </td>
                              <td style={styles.tableCell}>
                                <Form.Control
                                  value={row.treatment_medicine}
                                  onChange={(e) =>
                                    setTreatmentHistory((h) =>
                                      h.map((r, i) =>
                                        i === idx
                                          ? {
                                              ...r,
                                              treatment_medicine:
                                                e.target.value,
                                            }
                                          : r
                                      )
                                    )
                                  }
                                  placeholder="Thuốc..."
                                  style={styles.formInput}
                                />
                              </td>
                              <td style={styles.tableCell}>
                                <Form.Control
                                  as="textarea"
                                  value={row.doctor_feedback}
                                  onChange={(e) =>
                                    setTreatmentHistory((h) =>
                                      h.map((r, i) =>
                                        i === idx
                                          ? {
                                              ...r,
                                              doctor_feedback: e.target.value,
                                            }
                                          : r
                                      )
                                    )
                                  }
                                  placeholder="Phản hồi..."
                                  style={{
                                    ...styles.formInput,
                                    ...styles.textarea,
                                  }}
                                />
                              </td>
                              <td style={styles.tableCell}>
                                <Form.Control
                                  as="textarea"
                                  value={row.note}
                                  onChange={(e) =>
                                    setTreatmentHistory((h) =>
                                      h.map((r, i) =>
                                        i === idx
                                          ? { ...r, note: e.target.value }
                                          : r
                                      )
                                    )
                                  }
                                  placeholder="Ghi chú..."
                                  style={{
                                    ...styles.formInput,
                                    ...styles.textarea,
                                  }}
                                />
                              </td>
                              <td style={styles.tableCell}>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveRow(setTreatmentHistory, idx)
                                  }
                                  disabled={treatmentHistory.length === 1}
                                  style={{
                                    ...styles.removeButton,
                                    opacity:
                                      treatmentHistory.length === 1 ? 0.5 : 1,
                                    cursor:
                                      treatmentHistory.length === 1
                                        ? "not-allowed"
                                        : "pointer",
                                  }}
                                  onMouseEnter={(e) => {
                                    if (treatmentHistory.length > 1) {
                                      e.target.style.backgroundColor =
                                        "#fef2f2";
                                      e.target.style.borderColor = "#fecaca";
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.backgroundColor =
                                      "transparent";
                                    e.target.style.borderColor = "transparent";
                                  }}
                                >
                                  <MinusIcon />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </>
                )}
                <div className="d-flex align-items-center gap-3 mt-3">
                  <button
                    type="button"
                    onClick={() =>
                      handleAddRow(setTreatmentHistory, {
                        disease: "",
                        treatment_date: "",
                        next_treatment_date: "",
                        doctor_feedback: "",
                        treatment_medicine: "",
                        note: "",
                      })
                    }
                    style={styles.addButton}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#f0fdf4";
                      e.target.style.borderColor = "#16a34a";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "#ffffff";
                      e.target.style.borderColor = "#d1d5db";
                    }}
                    disabled={noTreatment}
                  >
                    <PlusIcon />
                    Thêm dòng
                  </button>
                  <Form.Check
                    type="checkbox"
                    label="Chưa từng điều trị"
                    checked={noTreatment}
                    onChange={(e) => setNoTreatment(e.target.checked)}
                    style={{
                      fontWeight: 500,
                      color: "#dc2626",
                      marginLeft: "8px",
                    }}
                  />
                </div>
              </Card.Body>
            </Card>

            {/* Nutrition History */}
            <Card style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>
                  <AppleIcon color="#ea580c" />
                  Thông tin dinh dưỡng
                </h3>
              </div>
              <Card.Body style={styles.sectionContent}>
                <div style={{ ...styles.tableContainer, ...styles.wideTable }}>
                  <Table responsive className="mb-0">
                    <thead style={styles.tableHeader}>
                      <tr>
                        <th
                          style={{
                            ...styles.tableHeaderCell,
                            minWidth: "180px",
                          }}
                        >
                          Ngày giờ
                        </th>
                        <th
                          style={{
                            ...styles.tableHeaderCell,
                            minWidth: "120px",
                          }}
                        >
                          Thức ăn
                        </th>
                        <th
                          style={{
                            ...styles.tableHeaderCell,
                            minWidth: 100,
                          }}
                        >
                          Số lượng 
                        </th>
                        <th
                          style={{
                            ...styles.tableHeaderCell,
                            minWidth: "80px",
                          }}
                        >
                          Có nhịn ăn ?
                        </th>
                        <th
                          style={{
                            ...styles.tableHeaderCell,
                            minWidth: "120px",
                          }}
                        >
                          Tình trạng phân
                        </th>
                        <th
                          style={{ ...styles.tableHeaderCell, width: "60px" }}
                        ></th>
                      </tr>
                    </thead>
                    <tbody>
                      {nutritionHistory.map((row, idx) => (
                        <tr
                          key={idx}
                          style={styles.tableRow}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "rgba(249, 250, 251, 0.5)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                        >
                          <td style={styles.tableCell}>
                            <Form.Control
                              type="datetime-local"
                              value={row.created_at}
                              onChange={(e) =>
                                setNutritionHistory((h) =>
                                  h.map((r, i) =>
                                    i === idx
                                      ? { ...r, created_at: e.target.value }
                                      : r
                                  )
                                )
                              }
                              style={styles.formInput}
                              required
                            />
                          </td>
                          <td style={styles.tableCell}>
                            <Form.Control
                              value={row.food_items}
                              onChange={(e) =>
                                setNutritionHistory((h) =>
                                  h.map((r, i) =>
                                    i === idx
                                      ? { ...r, food_items: e.target.value }
                                      : r
                                  )
                                )
                              }
                              placeholder="Thức ăn..."
                              style={styles.formInput}
                              required
                            />
                          </td>
                          <td style={styles.tableCell}>
                            <Form.Control
                              value={row.food_quantity}
                              onChange={(e) =>
                                setNutritionHistory((h) =>
                                  h.map((r, i) =>
                                    i === idx
                                      ? { ...r, food_quantity: e.target.value }
                                      : r
                                  )
                                )
                              }
                              placeholder="Số lượng (bát, lít, kg, g, ml, ...)"
                              style={styles.formInput}
                              required
                            />
                          </td>
                          <td
                            style={{ ...styles.tableCell, textAlign: "center" }}
                          >
                            <Form.Check
                              type="checkbox"
                              checked={row.is_fasting}
                              onChange={(e) =>
                                setNutritionHistory((h) =>
                                  h.map((r, i) =>
                                    i === idx
                                      ? { ...r, is_fasting: e.target.checked }
                                      : r
                                  )
                                )
                              }
                              style={styles.checkbox}
                            />
                          </td>
                          <td style={styles.tableCell}>
                            <Form.Control
                              value={row.feces_condition}
                              onChange={(e) =>
                                setNutritionHistory((h) =>
                                  h.map((r, i) =>
                                    i === idx
                                      ? {
                                          ...r,
                                          feces_condition: e.target.value,
                                        }
                                      : r
                                  )
                                )
                              }
                              placeholder="Tình trạng..."
                              style={styles.formInput}
                            />
                          </td>
                          <td style={styles.tableCell}>
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveRow(setNutritionHistory, idx)
                              }
                              disabled={nutritionHistory.length === 1}
                              style={{
                                ...styles.removeButton,
                                opacity:
                                  nutritionHistory.length === 1 ? 0.5 : 1,
                                cursor:
                                  nutritionHistory.length === 1
                                    ? "not-allowed"
                                    : "pointer",
                              }}
                              onMouseEnter={(e) => {
                                if (nutritionHistory.length > 1) {
                                  e.target.style.backgroundColor = "#fef2f2";
                                  e.target.style.borderColor = "#fecaca";
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = "transparent";
                                e.target.style.borderColor = "transparent";
                              }}
                            >
                              <MinusIcon />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleAddRow(setNutritionHistory, {
                      created_at: "",
                      food_items: "",
                      food_quantity: "",
                      is_fasting: false,
                      feces_condition: "",
                    })
                  }
                  style={styles.addButton}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#f0fdf4";
                    e.target.style.borderColor = "#16a34a";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#ffffff";
                    e.target.style.borderColor = "#d1d5db";
                  }}
                >
                  <PlusIcon />
                  Thêm dòng
                </button>
              </Card.Body>
            </Card>

            {/* Action Buttons */}
            <div style={styles.actionButtons}>
              <button
                type="button"
                onClick={() => navigate(-1)}
                style={styles.backActionButton}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#f9fafb";
                  e.target.style.borderColor = "#9ca3af";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#ffffff";
                  e.target.style.borderColor = "#d1d5db";
                }}
              >
                <ArrowLeftIcon />
                Quay lại
              </button>
              <button
                type="submit"
                style={styles.saveButton}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#15803d";
                  e.target.style.borderColor = "#15803d";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#16a34a";
                  e.target.style.borderColor = "#16a34a";
                }}
              >
                <SaveIcon />
                Lưu dữ liệu
              </button>
            </div>
          </Form>
        </Container>
      </div>
      <Footer />
    </>
  );
}

export default ReptileHealthTrackingPage;
