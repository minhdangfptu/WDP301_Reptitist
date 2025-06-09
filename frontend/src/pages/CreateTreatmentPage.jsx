import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Card, Table, Container } from "react-bootstrap";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";
import { toast } from "react-toastify";

const styles = {
  sectionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
    marginBottom: "1.5rem",
  },
  sectionHeader: {
    backgroundColor: "rgba(249, 250, 251, 0.8)",
    borderBottom: "1px solid #e5e7eb",
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
};

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

function CreateTreatmentPage() {
  const navigate = useNavigate();
  const { reptileId } = useParams();
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
  const [noTreatment, setNoTreatment] = useState(false);

  const handleAddRow = () =>
    setTreatmentHistory((prev) => [
      ...prev,
      {
        disease: "",
        treatment_date: "",
        next_treatment_date: "",
        doctor_feedback: "",
        treatment_medicine: "",
        note: "",
      },
    ]);
  const handleRemoveRow = (idx) =>
    setTreatmentHistory((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      disease: disease,
      treatment_date: treatment_date,
      next_treatment_date: next_treatment_date,
      doctor_feedback: doctor_feedback,
      treatment_medicine: treatment_medicine,
      note: note,
    };
    try {
      await axios.put(
        `http://localhost:8080/reptitist/pet/create-treatment/${reptileId}`,
        data
      );
      toast.success("Đã lưu dữ liệu điều trị!");
      navigate(-1);
    } catch (error) {
      toast.error("Có lỗi khi lưu dữ liệu!");
      console.error(error);
    }
  };

  return (
    <>
      <Header />
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2
            className="fw-bold mb-0"
            style={{ marginBottom: 0, alignSelf: "center" }}
          >
            THEO DÕI SỨC KHỎE
          </h2>
          <div className="d-flex gap-2">{}</div>
        </div>
        <Form onSubmit={handleSubmit}>
          <Card style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Thông tin điều trị</h3>
            </div>
            <Card.Body style={styles.sectionContent}>
              {!noTreatment && (
                <>
                  <div style={styles.tableContainer}>
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
                            style={{ ...styles.tableHeaderCell, width: "60px" }}
                          ></th>
                        </tr>
                      </thead>
                      <tbody>
                        {treatmentHistory.map((row, idx) => (
                          <tr key={idx} style={styles.tableRow}>
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
                                            next_treatment_date: e.target.value,
                                          }
                                        : r
                                    )
                                  )
                                }
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
                                            treatment_medicine: e.target.value,
                                          }
                                        : r
                                    )
                                  )
                                }
                                placeholder="Thuốc..."
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
                              />
                            </td>
                            <td style={styles.tableCell}>
                              <button
                                type="button"
                                onClick={() => handleRemoveRow(idx)}
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
                  onClick={handleAddRow}
                  style={styles.addButton}
                  disabled={noTreatment}
                >
                  <PlusIcon />
                  Thêm dòng
                </button>
              </div>
            </Card.Body>
          </Card>
          <div style={styles.actionButtons}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={styles.backActionButton}
            >
              Quay lại
            </button>
            <button type="submit" style={styles.saveButton}>
              <SaveIcon />
              Lưu dữ liệu
            </button>
          </div>
        </Form>
      </Container>
      <Footer />
    </>
  );
}

export default CreateTreatmentPage;
