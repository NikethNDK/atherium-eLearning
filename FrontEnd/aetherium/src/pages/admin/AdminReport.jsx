import React, { useEffect, useState } from "react";
import { adminAPI } from "../../services/api";
import { PDFDownloadLink, Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

const periods = [
  { value: "all", label: "All Time" },
  { value: "day", label: "Per Day" },
  { value: "month", label: "Per Month" },
  { value: "year", label: "Per Year" },
];

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 12, fontFamily: "Helvetica" },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 8, textAlign: "center" },
  subHeader: { fontSize: 14, marginBottom: 4, textAlign: "center" },
  table: { display: "table", width: "auto", marginTop: 16 },
  tableRow: { flexDirection: "row" },
  tableCellHeader: { fontWeight: "bold", padding: 4, border: "1px solid #333", backgroundColor: "#eee", minWidth: 80 },
  tableCell: { padding: 4, border: "1px solid #333", minWidth: 80 },
});

const ReportPDF = ({ report, filters }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Aetherium</Text>
      <Text style={styles.subHeader}>Period: {filters.period || "All Time"}</Text>
      <Text style={styles.subHeader}>Report generated: {new Date().toLocaleDateString()}</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableCellHeader}>Course</Text>
          <Text style={styles.tableCellHeader}>Instructor</Text>
          <Text style={styles.tableCellHeader}>Period</Text>
          <Text style={styles.tableCellHeader}>Students</Text>
          <Text style={styles.tableCellHeader}>Revenue</Text>
        </View>
        {report.map((row, idx) => (
          <View style={styles.tableRow} key={idx}>
            <Text style={styles.tableCell}>{row.course_title}</Text>
            <Text style={styles.tableCell}>{row.instructor_name}</Text>
            <Text style={styles.tableCell}>{row.period || "All Time"}</Text>
            <Text style={styles.tableCell}>{row.num_students}</Text>
            <Text style={styles.tableCell}>₹{row.revenue.toLocaleString()}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

const AdminReport = () => {
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [report, setReport] = useState([]);
  const today = new Date().toISOString().slice(0, 10);
const [filters, setFilters] = useState({
  course_id: "",
  instructor_id: "",
  period: "day",
  start_date: today,
  end_date: today,
});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    adminAPI.getAllCourses().then(setCourses);
    adminAPI.getAllInstructors().then(setInstructors);
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    const params = {};
    if (filters.course_id) params.course_id = filters.course_id;
    if (filters.instructor_id) params.instructor_id = filters.instructor_id;
    if (filters.period) params.period = filters.period;
    if (filters.start_date) params.start_date = filters.start_date;
    if (filters.end_date) params.end_date = filters.end_date;
    const data = await adminAPI.getCourseReport(params);
    setReport(data);
    setLoading(false);
  };

  const downloadCSV = async () => {
    const params = {};
    if (filters.course_id) params.course_id = filters.course_id;
    if (filters.instructor_id) params.instructor_id = filters.instructor_id;
    if (filters.period) params.period = filters.period;
    if (filters.start_date) params.start_date = filters.start_date;
    if (filters.end_date) params.end_date = filters.end_date;
    const response = await adminAPI.downloadCourseReportCSV(params);
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "course_report.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Course</label>
          <select
            className="border rounded px-3 py-2 w-full"
            value={filters.course_id}
            onChange={e => setFilters(f => ({ ...f, course_id: e.target.value }))}
          >
            <option value="">All</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Instructor</label>
          <select
            className="border rounded px-3 py-2 w-full"
            value={filters.instructor_id}
            onChange={e => setFilters(f => ({ ...f, instructor_id: e.target.value }))}
          >
            <option value="">All</option>
            {instructors.map(i => (
              <option key={i.id} value={i.id}>{i.firstname} {i.lastname}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Period</label>
          <select
            className="border rounded px-3 py-2 w-full"
            value={filters.period}
            onChange={e => setFilters(f => ({ ...f, period: e.target.value }))}
          >
            {periods.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <input
            type="date"
            className="border rounded px-3 py-2 w-full"
            value={filters.start_date}
            onChange={e => setFilters(f => ({ ...f, start_date: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <input
            type="date"
            className="border rounded px-3 py-2 w-full"
            value={filters.end_date}
            onChange={e => setFilters(f => ({ ...f, end_date: e.target.value }))}
          />
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium"
          onClick={fetchReport}
          disabled={loading}
        >
          {loading ? "Loading..." : "Filter"}
        </button>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium"
          onClick={downloadCSV}
        >
          Download CSV
        </button>
        <PDFDownloadLink
          document={<ReportPDF report={report} filters={filters} />}
          fileName="Aetherium_Course_Report.pdf"
          className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium"
        >
          {({ loading }) => (loading ? "Preparing PDF..." : "Download PDF")}
        </PDFDownloadLink>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="px-4 py-2">Course</th>
              <th className="px-4 py-2">Instructor</th>
              <th className="px-4 py-2">Period</th>
              <th className="px-4 py-2">Students</th>
              <th className="px-4 py-2">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {report.map((row, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-4 py-2">{row.course_title}</td>
                <td className="px-4 py-2">{row.instructor_name}</td>
                <td className="px-4 py-2">
                  {row.period ? new Date(row.period).toLocaleDateString() : "All Time"}
                </td>
                <td className="px-4 py-2">{row.num_students}</td>
                <td className="px-4 py-2">₹{row.revenue.toLocaleString()}</td>
              </tr>
            ))}
            {report.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">No data found for selected filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReport;