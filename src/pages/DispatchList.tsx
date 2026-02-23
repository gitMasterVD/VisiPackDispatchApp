import React, { useState, useRef, useEffect } from "react";
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
import axios from "axios";

const SPREADSHEET_ID = "1P2nCUyLzWtEF9UbAsd7mY2WIIl9DRObMPD6B_TUuJ4Y";
const RANGE = "Sheet1!A1:Z1000";

const TO_BE_UPDATED = "To be updated";


/* ================= PRIORITY CONFIG ================= */
const priorityOrder: Record<Priority, number> = { P1: 1, P2: 2, P3: 3 };
const priorityOptions: Priority[] = ["P1", "P2", "P3"];
const priorityLabels: Record<Priority, string> = {
  P1: "P1 - High",
  P2: "P2 - Medium",
  P3: "P3 - Low",
};

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
const normalizeToYMD = (value: any): string => {
  if (!value) return "";

  if (value instanceof Date) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, "0");
    const d = String(value.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  const str = String(value).trim();

  const match1 = str.match(/^(\d{2})[.\-/](\d{2})[.\-/](\d{4})$/);
  if (match1) {
    return `${match1[3]}-${match1[2]}-${match1[1]}`;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  if (str.includes("T")) {
    return str.split("T")[0];
  }

  return "";
};
const validate = (val: any) =>
  val === undefined || val === null || String(val).trim() === ""
    ? TO_BE_UPDATED
    : String(val).trim();



    export const getDispatches = async (): Promise<Dispatch[]> => {
      const token = localStorage.getItem("google_token");
      const role = sessionStorage.getItem("role");
      if (!token) throw new Error("No Google token found");
    
      const res = await axios.get(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    
      const rows = res.data.values;
      if (!rows || rows.length < 2) return [];
    
      const headers = rows[0];
      const dataRows = rows.slice(1);
    
      const getColumnIndex = (header: string) => headers.indexOf(header);
    
      const filteredData = dataRows
        .map((row: string[], index: number) => {
          const getValue = (header: string) => {
            const i = getColumnIndex(header);
            return i !== -1 ? row[i] : "";
          };
    
          const priorityRaw = getValue("Priority");
          const priority: Priority =
            priorityRaw === "P1" || priorityRaw === "P2" || priorityRaw === "P3"
              ? priorityRaw
              : "P3";
    
          return {
            id: String(index + 1),
            code: validate(getValue("Item Name")),
            po: validate(getValue("PoNo")),
            client: validate(getValue("Client")),
            priority,
            status:
              getValue("Dispatch Status") === "Closed"
                ? "Closed"
                : "Need Confirmation",
            date: normalizeDate(getValue("Expected DelDate")),
            time: validate(getValue("Time")),
            quantity: Number(getValue("QTY")) || 0,
            location: validate(getValue("Location/Vechile Details")),
    
            // role fields
            pmPoVerified: getValue("pmPoVerified"),
            fgMaterial: getValue("fgMaterial"),
            qcClearance: getValue("qcClearance"),
            itemAvailability: getValue("itemAvailability"),
          };
        })
        .filter((dispatch: any) => {
           
          switch (role) {
            case "fg":
              return dispatch.pmPoVerified === "Yes";
    
            case "qc":
              return dispatch.fgMaterial === "Yes";
    
            case "dispatch":
              return dispatch.qcClearance === "Yes";
    
            case "finance":
              return dispatch.itemAvailability === "Yes";
    
            default:
              return true; // admin or other roles
          }
        });
    
      return filteredData;
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);


  const [selectedDispatch, setSelectedDispatch] = useState<Dispatch | null>(null);
  const [editDispatch, setEditDispatch] = useState<Dispatch | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const tabStatusMap: Record<"Need Confirmation" | "Closed", Dispatch["status"][]> = {
    "Need Confirmation": ["Need Confirmation"],
    Closed: ["Closed"],
  };
  

  const updateDispatch = async (updatedData: any, rowIndex: number) => {
    const token = localStorage.getItem("google_token");
    const role = sessionStorage.getItem("role");
  
    if (!token) throw new Error("No Google token found");
    if (!role) throw new Error("User role not found");
  
    // rowIndex starts from 0, row 1 is header
    const actualRow = rowIndex + 2;
  
    /* ================= ROLE COLUMN MAPPING ================= */
    const roleColumnMap: Record<string, string[]> = {
      superuser: [
        "A","B","C","D","E","F","G","H","I",
        "J","K","L",
        "M","N","O",
        "P","Q","R",
        "T","U","V","W","X","Y","Z",
        "AA","AB","AC"
      ],
  
      plantManager: ["J","K","L"],
      fg: ["M","N","O"],
      qc: ["P","Q","R"],
      dispatch: ["T","U","V","W","X","Y","Z"],
      finance: ["AA","AB","AC"]
    };
  
    const allowedColumns = roleColumnMap[role] || [];
  
    /* ================= COLUMN VALUE MAP (FIXED) ================= */
    const valuesMap: Record<string, any> = {
      // MASTER
      A: updatedData.client,
      B: updatedData.code,
      C: updatedData.date,
      D: updatedData.quantity,
      E: updatedData.location,
      F: updatedData.status,
      G: updatedData.time,
      H: updatedData.po,
      I: updatedData.priority,
  
      // PLANT MANAGER
      J: updatedData.pmPoVerified,
      K: updatedData.pmTimeRequired,
      L: updatedData.pmComments,
  
      // FG
      M: updatedData.fgMaterial,
      N: updatedData.fgTime,
      O: updatedData.fgComments,
  
      // QC
      P: updatedData.qcClearance,
      Q: updatedData.qcTime,
      R: updatedData.qcComments,
  
      // DISPATCH
      T: updatedData.itemAvailability,
      U: updatedData.dispatchTime,
      V: updatedData.vehicalAvailability,
      W: updatedData.dispatchHamali,
      X: updatedData.dispatchComments,
      Y: updatedData.shipment,
      Z: updatedData.dispatchSummary,
  
      // FINANCE
      AA: updatedData.financeTime,
      AB: updatedData.financeChallan,
      AC: updatedData.financeComments,
    };
  
    /* ================= BUILD BATCH UPDATE ================= */
    const dataToUpdate = allowedColumns
      .filter((col) => valuesMap[col] !== undefined && valuesMap[col] !== null)
      .map((col) => ({
        range: `Sheet1!${col}${actualRow}`,
        values: [[valuesMap[col]]],
      }));
  
    if (dataToUpdate.length === 0) {
      console.error("No matching fields found for role:", role);
      throw new Error("No allowed fields to update for this role");
    }
  
    await axios.post(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values:batchUpdate`,
      {
        valueInputOption: "USER_ENTERED",
        data: dataToUpdate,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  
    return updatedData;
  };

 

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

        const selectedNormalized = normalizeToYMD(selectedDate);
        const dispatchNormalized = normalizeToYMD(d.date);

        return selectedNormalized === dispatchNormalized;
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
              <button
                className="btn-logout"
                onClick={() => {
                  // Clear all stored auth/session data
                  localStorage.removeItem("google_token");
                  localStorage.removeItem("google_user"); // if you store user
                  sessionStorage.clear(); // optional

                  // Optional: revoke Google token
                  if ((window as any).google?.accounts?.oauth2) {
                    (window as any).google.accounts.oauth2.revoke(
                      localStorage.getItem("google_token"),
                      () => console.log("Token revoked")
                    );
                  }

                  // Redirect to login page
                  navigate("/");
                }}
              >
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
                selected={selectedDate}
                onChange={(date: Date | null) => setSelectedDate(date)}
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
              const rowIndex = editDispatch.id - 1;
          
              const saved = await updateDispatch(updated, rowIndex);
          
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
