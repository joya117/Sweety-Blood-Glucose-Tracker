import { useEffect, useState } from "react";
import API from "./api";

function Dashboard() {
  // States
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [reportType, setReportType] = useState("daily");

  const [reportDate, setReportDate] = useState(
    new Date().toLocaleDateString("en-CA"),
  );

  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");

  const [formData, setFormData] = useState({
    reading_date: new Date().toLocaleDateString("en-CA"),
    time_slot: "morning_fasting",
    value_mg_dl: "",
  });

  const today = new Date().toLocaleDateString("en-CA");

  const todayReadings = readings.filter(
    (reading) => reading.reading_date === today,
  );

  const glucoseValues = readings.map((reading) => Number(reading.value_mg_dl));

  const highestReading = 160;

  const lowestReading =
    glucoseValues.length > 0 ? Math.min(...glucoseValues) : "--";
  // Fetch all readings
  const fetchReadings = async () => {
    try {
      const response = await API.get("/readings");
      setReadings(response.data.readings);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load readings.");
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setEditingId(null);
    setFormData({
      reading_date: new Date().toLocaleDateString("en-CA"),
      time_slot: "morning_fasting",
      value_mg_dl: "",
    });
  };

  // Add or update reading
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const payload = {
        ...formData,
        value_mg_dl: Number(formData.value_mg_dl),
      };

      if (editingId !== null) {
        await API.put(`/readings/${editingId}`, payload);
        setMessage("Reading updated successfully!");
      } else {
        await API.post("/readings", payload);
        setMessage("Reading added successfully!");
      }

      resetForm();
      await fetchReadings();
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to save reading.");
    }
  };

  // Edit reading
  const handleEdit = (reading) => {
    setEditingId(reading.id);

    setFormData({
      reading_date: reading.reading_date,
      time_slot: reading.time_slot,
      value_mg_dl: String(reading.value_mg_dl),
    });

    setMessage("Editing reading. Update the details below.");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Delete reading
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this reading?",
    );

    if (!confirmed) return;

    try {
      await API.delete(`/readings/${id}`);
      setMessage("Reading deleted successfully!");

      if (editingId === id) {
        resetForm();
      }

      await fetchReadings();
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to delete reading.");
    }
  };
  // Fetch selected report
  const fetchReport = async () => {
    setReportLoading(true);
    setReportError("");
    setReportData(null);

    try {
      let endpoint = "";

      if (reportType === "daily") {
        endpoint = "daily";
      } else if (reportType === "month-to-date") {
        endpoint = "month-to-date";
      } else if (reportType === "previous-month") {
        endpoint = "previous-month";
      }

      const response = await API.get(
        `/readings/reports/${endpoint}?date=${reportDate}`,
      );

      setReportData(response.data);
    } catch (err) {
      setReportError(err.response?.data?.message || "Unable to load report.");
    } finally {
      setReportLoading(false);
    }
  };

  // Load readings when dashboard opens
  useEffect(() => {
    fetchReadings();
  }, []);

  return (
    <div className="dashboard">
      <h2>Glucose Dashboard</h2>
      <p>Monitor and manage your blood glucose readings.</p>

      <div className="dashboard-summary">
        <div className="summary-card">
          <h3>Total Readings</h3>
          <h2>{readings.length}</h2>
          <p>All recorded readings</p>
        </div>

        <div className="summary-card">
          <h3>Today's Readings</h3>
          <h2>{todayReadings.length}</h2>
          <p>Readings recorded today</p>
        </div>

        <div className="summary-card">
          <h3>Highest Reading</h3>
          <h2>{highestReading}</h2>
          <p>mg/dL</p>
        </div>

        <div className="summary-card">
          <h3>Lowest Reading</h3>
          <h2>{lowestReading}</h2>
          <p>mg/dL</p>
        </div>
      </div>

      {/* Add or Edit reading form */}
      <section className="add-reading">
        <h3>{editingId !== null ? "Edit Reading" : "Add New Reading"}</h3>

        <form onSubmit={handleSubmit}>
          <label>Date</label>
          <input
            type="date"
            value={formData.reading_date}
            max={new Date().toLocaleDateString("en-CA")}
            onChange={(e) =>
              setFormData({
                ...formData,
                reading_date: e.target.value,
              })
            }
            required
          />

          <label>Time Slot</label>
          <select
            value={formData.time_slot}
            onChange={(e) =>
              setFormData({
                ...formData,
                time_slot: e.target.value,
              })
            }
            required
          >
            <option value="morning_fasting">Morning Fasting</option>
            <option value="after_breakfast">After Breakfast</option>
            <option value="after_lunch">After Lunch</option>
            <option value="after_dinner">After Dinner</option>
          </select>

          <label>Glucose Level (mg/dL)</label>
          <input
            type="number"
            min="40"
            max="600"
            step="1"
            placeholder="Enter glucose level"
            value={formData.value_mg_dl}
            onChange={(e) =>
              setFormData({
                ...formData,
                value_mg_dl: e.target.value,
              })
            }
            required
          />

          <button type="submit">
            {editingId !== null ? "Update Reading" : "Add Reading"}
          </button>

          {editingId !== null && (
            <button
              type="button"
              onClick={() => {
                resetForm();
                setMessage("");
              }}
            >
              Cancel Edit
            </button>
          )}
        </form>

        {message && <p>{message}</p>}
      </section>

      {/* Display readings */}
      <section className="readings-section">
        <h3>Your Readings</h3>

        {loading && <p>Loading readings...</p>}

        {error && <p className="auth-error">{error}</p>}

        {!loading && !error && readings.length === 0 && (
          <p>No readings yet. Add your first glucose reading!</p>
        )}

        {!loading && !error && readings.length > 0 && (
          <div className="readings-list">
            {readings.map((reading) => (
              <div className="reading-card" key={reading.id}>
                <div>
                  <h4>{reading.time_slot.replaceAll("_", " ")}</h4>
                  <p>{reading.reading_date}</p>
                </div>

                <div>
                  <strong>{reading.value_mg_dl} mg/dL</strong>

                  <button onClick={() => handleEdit(reading)}>Edit</button>

                  <button onClick={() => handleDelete(reading.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Reports Section */}
      <section className="reports-section">
        <h3>Glucose Reports</h3>
        <p>View your glucose statistics and reading history.</p>

        <div className="report-controls">
          <button
            className={reportType === "daily" ? "active" : ""}
            onClick={() => setReportType("daily")}
          >
            Daily
          </button>

          <button
            className={reportType === "month-to-date" ? "active" : ""}
            onClick={() => setReportType("month-to-date")}
          >
            Month to Date
          </button>

          <button
            className={reportType === "previous-month" ? "active" : ""}
            onClick={() => setReportType("previous-month")}
          >
            Previous Month
          </button>
        </div>

        <div className="report-date">
          <label>Select Date</label>
          <input
            type="date"
            value={reportDate}
            max={new Date().toLocaleDateString("en-CA")}
            onChange={(e) => setReportDate(e.target.value)}
          />
        </div>

        <button
          className="generate-report"
          onClick={fetchReport}
          disabled={reportLoading}
        >
          {reportLoading ? "Generating..." : "Generate Report"}
        </button>

        {reportError && <p className="auth-error">{reportError}</p>}

        {reportData && (
          <div className="report-results">
            <h4>
              Report: {reportData.from_date || reportData.date}
              {reportData.to_date && ` to ${reportData.to_date}`}
            </h4>

            {!reportData.has_readings ? (
              <p>No readings available for this period.</p>
            ) : (
              <>
                <div className="report-summary">
                  <div>
                    <span>Highest</span>
                    <strong>{reportData.summary.highest} mg/dL</strong>
                  </div>

                  <div>
                    <span>Lowest</span>
                    <strong>{reportData.summary.lowest} mg/dL</strong>
                  </div>

                  <div>
                    <span>Average</span>
                    <strong>{reportData.summary.average} mg/dL</strong>
                  </div>

                  <div>
                    <span>Total Readings</span>
                    <strong>{reportData.summary.total_readings}</strong>
                  </div>
                </div>

                <h4>Reading Details</h4>

                <div className="readings-list">
                  {reportData.readings.map((reading) => (
                    <div className="reading-card" key={reading.id}>
                      <div>
                        <h4>{reading.time_slot.replaceAll("_", " ")}</h4>
                        <p>{reading.reading_date}</p>
                      </div>

                      <strong>{reading.value_mg_dl} mg/dL</strong>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
