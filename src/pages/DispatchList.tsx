import React, { useState, useRef, useEffect } from "react"; 
import { getDispatches, updateDispatch, addDispatch } from "../services/dispatchService";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import "../styles/dispatch-list.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faPlus, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import type { Dispatch, Priority } from "../data/mockDispatches";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DispatchDetailsOverlay from "../components/dispatch/DispatchDetailsOverlay";
import EditDispatchModal from "../components/dispatch/EditDispatchModal";
import {
  FiSearch,
  FiInbox,
  FiChevronDown,
  FiAlertTriangle,
  FiCalendar,
  FiPackage,
  FiMapPin,
} from "react-icons/fi";

/* ================= PRIORITY CONFIG ================= */
const priorityOrder: Record<Priority, number> = { P1: 1, P2: 2, P3: 3 };
const priorityOptions: Priority[] = ["P1", "P2", "P3"];
const priorityLabels: Record<Priority, string> = {
  P1: "P1 - High",
  P2: "P2 - Medium",
  P3: "P3 - Low",
};

const TO_BE_UPDATED = "To be updated";

/* ================= DATE HELPERS ================= */
const normalizeDate = (value: any): string => {
  if (!value) return "";
  if (typeof value === "number") {
    const excelEpoch = new Date(1899, 11, 30);
    const jsDate = new Date(excelEpoch.getTime() + value * 86400000);
    return jsDate.toISOString().split("T")[0];
  }
  if (value instanceof Date) return value.toISOString().split("T")[0];
  const str = String(value).trim();
  const match = str.match(/^(\d{2})[.\-/](\d{2})[.\-/](\d{4})$/);
  if (match) return `${match[3]}-${match[2]}-${match[1]}`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  return "";
};

const formatDisplayDate = (value: string) => {
  if (!value || value === TO_BE_UPDATED) return TO_BE_UPDATED;
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(value)) return value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-");
    return `${day}.${month}.${year}`;
  }
  return value;
};

/* ================= COMPONENT ================= */
const DispatchList: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [loading, setLoading] = useState(true); // ✅ Loading state
  const [search, setSearch] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<"All" | Priority>("All");
  const [activeTab, setActiveTab] = useState<"Need Confirmation" | "Closed">("Need Confirmation");
  const [selectedDate, setSelectedDate] = useState("");

  const [selectedDispatch, setSelectedDispatch] = useState<Dispatch | null>(null);
  const [editDispatch, setEditDispatch] = useState<Dispatch | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const tabStatusMap: Record<"Need Confirmation" | "Closed", Dispatch["status"][]> = {
    "Need Confirmation": ["Need Confirmation"],
    Closed: ["Closed"],
  };

  const validate = (val: any) =>
    val === undefined || val === null || String(val).trim() === ""
      ? TO_BE_UPDATED
      : String(val).trim();

  /* ================= LOAD DISPATCHES ================= */
  useEffect(() => {
    const fetchDispatches = async () => {
      try {
        const data = await getDispatches();
        setDispatches(data);
      } catch (error) {
        console.error("Failed to fetch dispatches", error);
      } finally {
        setLoading(false); // ✅ Set loading false after fetch
      }
    };
    fetchDispatches();
  }, []);

  /* ================= FILE UPLOAD ================= */
  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      const parsed: Omit<Dispatch, "id">[] = rows.map((row) => ({
        code: validate(row["Item Name"]),
        po: validate(row["PoNo"]),
        client: validate(row["Client"]),
        priority: ["P1", "P2", "P3"].includes(row["Priority"]) ? row["Priority"] : "P3",
        status:
          row["Dispatch Status"] === "Closed"
            ? "Closed"
            : "Need Confirmation",
        date: normalizeDate(row["Expected DelDate"]) || TO_BE_UPDATED,
        time: validate(row["Time"]),
        quantity: validate(row["QTY"]),
        location: validate(row["Location/Vechile Details"]),
      }));

      try {
        const savedDispatches: Dispatch[] = [];
        for (const d of parsed) {
          const saved = await addDispatch(d);
          savedDispatches.push(saved);
        }
        setDispatches((prev) => [...prev, ...savedDispatches]);
      } catch (error) {
        console.error("Failed to upload dispatches", error);
        alert("Failed to upload dispatches. Please try again.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  /* ================= FILTER ================= */
  const filteredDispatches = React.useMemo(() => {
    return dispatches
      .filter(
        (d) =>
          d.code.toLowerCase().includes(search.toLowerCase()) ||
          d.client.toLowerCase().includes(search.toLowerCase())
      )
      .filter((d) => tabStatusMap[activeTab].includes(d.status))
      .filter((d) => selectedPriority === "All" || d.priority === selectedPriority)
      .filter((d) => {
        if (!selectedDate) return true;
        if (!d.date || d.date === TO_BE_UPDATED) return false;
        return normalizeDate(d.date) === selectedDate;
      })
      .sort((a, b) =>
        selectedPriority === "All" ? priorityOrder[a.priority] - priorityOrder[b.priority] : 0
      );
  }, [dispatches, search, activeTab, selectedPriority, selectedDate]);

  /* ================= OUTSIDE CLICK ================= */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= UI ================= */
  return (
    <div className="dispatch-page">
      <div className="dispatch-container">
        <div className="sticky-header-group">
          <div className="dispatch-header">
            <h2>Dispatches</h2>
            <div className="header-icons">
              <button className="btn-upload" onClick={handleUploadClick}>
                <FontAwesomeIcon icon={faUpload} />
              </button>
              <button className="btn-add" onClick={() => navigate("/add-dispatch")}>
                <FontAwesomeIcon icon={faPlus} />
              </button>
              <button className="btn-logout" onClick={() => navigate("/")}>
                <FontAwesomeIcon icon={faRightFromBracket} />
              </button>
            </div>
          </div>

          <div className="search-filter-row modern">
            <div className="search-box">
              <FiSearch />
              <input
                placeholder="Search by Client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="priority-dropdown" ref={dropdownRef}>
              <div className="dropdown-header" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <span>{selectedPriority === "All" ? "Priority" : priorityLabels[selectedPriority]}</span>
                <FiChevronDown />
              </div>
              {dropdownOpen && (
                <div className="dropdown-options">
                  <div
                    className="dropdown-option"
                    onClick={() => {
                      setSelectedPriority("All");
                      setDropdownOpen(false);
                    }}
                  >
                    All
                  </div>
                  {priorityOptions.map((p) => (
                    <div
                      key={p}
                      className="dropdown-option"
                      onClick={() => {
                        setSelectedPriority(p);
                        setDropdownOpen(false);
                      }}
                    >
                      {priorityLabels[p]}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="date-filter">
              <FiCalendar />
              <DatePicker
                selected={selectedDate ? new Date(selectedDate) : null}
                onChange={(date: Date | null) =>
                  setSelectedDate(date ? date.toISOString().split("T")[0] : "")
                }
                dateFormat="dd/MM/yyyy"
                placeholderText="Select Date"
                className="datepicker-input"
              />
            </div>
          </div>

          <div className="tabs pill">
            {["Need Confirmation", "Closed"].map((tab) => (
              <button
                key={tab}
                className={activeTab === tab ? "active" : ""}
                onClick={() => setActiveTab(tab as any)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="dispatch-list-body">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            hidden
            onChange={handleFileUpload}
          />
          

          {loading ? (
            <div className="empty-state-container">
               <div className="loading-spinner"></div>
    <p>Loading dispatches...</p>
            </div>
          ) : filteredDispatches.length === 0 ? (
            <div className="empty-state-container">
              <FiInbox size={50} style={{ color: "#94a3b8" }} />
              <h3>No dispatches found</h3>
              <p>Try changing your search or filters.</p>
            </div>
          ) : (
            filteredDispatches.map((d) => (
              <div key={d.id} className="dispatch-card" onClick={() => setSelectedDispatch(d)}>
                <div className="card-top">
                  <div>
                    <h3>{d.code}</h3>
                    <p>PO: {d.po}</p>
                    <p>Client: {d.client}</p>
                  </div>
                  {activeTab !== "Closed" && (
                    <span className={`badge-priority ${d.priority.toLowerCase()}`}>
                      {d.priority} {d.priority === "P1" && <FiAlertTriangle />}
                    </span>
                  )}
                </div>

                <div className="card-bottom-grid">
                  <div>
                    <label>
                      <FiCalendar className="calendar-icon" /> Date & Time
                    </label>
                    <span>
                      {formatDisplayDate(d.date)}
                      <br />
                      {d.time}
                    </span>
                  </div>
                  <div>
                    <label>
                      <FiPackage className="quantity-icon" /> Qty
                    </label>
                    <span>{d.quantity}</span>
                  </div>
                  <div>
                    <label>
                      <FiMapPin className="location-icon" /> Location
                    </label>
                    <span>{d.location}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedDispatch && (
        <DispatchDetailsOverlay
          dispatch={selectedDispatch}
          onClose={() => setSelectedDispatch(null)}
          onEdit={() => {
            if (selectedDispatch.status !== "Closed") setEditDispatch(selectedDispatch);
            else alert("Closed dispatches cannot be edited.");
            setSelectedDispatch(null);
          }}
        />
      )}

      {editDispatch && (
        <EditDispatchModal
          dispatch={editDispatch}
          onClose={() => setEditDispatch(null)}
          onSave={async (updated) => {
            try {
              const saved = await updateDispatch(updated.id, updated);
              setDispatches((prev) =>
                prev.map((d) => (d.id === saved.id ? saved : d))
              );
              setEditDispatch(null);
            } catch (error) {
              console.error("Failed to update dispatch", error);
              alert("Failed to save changes. Please try again.");
            }
          }}
        />
      )}
    </div>
  );
};

export default DispatchList;
