import React, { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import "../styles/dispatch-list.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faPlus, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

import { mockDispatches } from "../data/mockDispatches";
import type { Dispatch, Priority } from "../data/mockDispatches";

import DispatchDetailsOverlay from "../components/dispatch/DispatchDetailsOverlay";
import EditDispatchModal from "../components/dispatch/EditDispatchModal";

import { FiSearch, FiInbox, FiChevronDown, FiAlertTriangle, FiCalendar, FiPackage, FiMapPin } from "react-icons/fi";

/* ================= PRIORITY CONFIG ================= */
const priorityOrder: Record<Priority, number> = { P1: 1, P2: 2, P3: 3 };
const priorityOptions: Priority[] = ["P1", "P2", "P3"];
const priorityLabels: Record<Priority, string> = {
  P1: "P1 - High",
  P2: "P2 - Medium",
  P3: "P3 - Low",
};

const TO_BE_UPDATED = "To be updated";

/* ================= COMPONENT ================= */
const DispatchList: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [dispatches, setDispatches] = useState<Dispatch[]>(mockDispatches);
  const [search, setSearch] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<"All" | Priority>("All");
  const [activeTab, setActiveTab] = useState<"Need Confirmation" | "Closed">("Need Confirmation");

  const [selectedDispatch, setSelectedDispatch] = useState<Dispatch | null>(null);
  const [editDispatch, setEditDispatch] = useState<Dispatch | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  /* ================= TAB STATUS MAP ================= */
  const tabStatusMap: Record<"Need Confirmation" | "Closed", Dispatch["status"][]> = {
    "Need Confirmation": ["Need Confirmation", "NIA"],
    Closed: ["Closed"],
  };

  /* ================= HELPERS ================= */
  const validate = (val: any) =>
    val === undefined || val === null || String(val).trim() === "" ? TO_BE_UPDATED : String(val).trim();

  /* ================= FILE UPLOAD ================= */
  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      const parsed: Dispatch[] = rows.map((row, index) => ({
        id: Date.now() + index,
        code: validate(row["Item Name"]),
        po: validate(row["PoNo"]),
        client: validate(row["Client"]),
        priority: ["P1", "P2", "P3"].includes(row["Priority"]) ? row["Priority"] : "P3",
        status:
          row["Dispatch Status"] === "Closed"
            ? "Closed"
            : row["Dispatch Status"] === "NIA"
            ? "NIA"
            : "Need Confirmation",
        date: validate(row["Expected DelDate"]),
        time: validate(row["Time"]),
        quantity: validate(row["QTY"]),
        location: validate(row["Location/Vechile Details"]),
      }));

      setDispatches(parsed);
    };

    reader.readAsArrayBuffer(file);
  };

  /* ================= FILTER & SORT ================= */
  const filteredDispatches = React.useMemo(() => {
    return dispatches
      .filter(
        (d) =>
          d.code.toLowerCase().includes(search.toLowerCase()) ||
          d.client.toLowerCase().includes(search.toLowerCase())
      )
      .filter((d) => tabStatusMap[activeTab].includes(d.status))
      .filter((d) => selectedPriority === "All" || d.priority === selectedPriority)
      .sort((a, b) =>
        selectedPriority === "All" ? priorityOrder[a.priority] - priorityOrder[b.priority] : 0
      );
  }, [dispatches, search, activeTab, selectedPriority]);

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

  /* ================= RENDER ================= */
  return (
    <div className="dispatch-page">
      <div className="dispatch-container">
        {/* ================= HEADER ================= */}
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

          {/* ================= SEARCH + FILTER ================= */}
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
          </div>

          {/* ================= TABS ================= */}
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

        {/* ================= LIST ================= */}
        <div className="dispatch-list-body">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            hidden
            onChange={handleFileUpload}
          />

          {filteredDispatches.length === 0 ? (
            <div className="empty-state-container">
              <FiInbox size={50} style={{ color: "#94a3b8" }} />
              <h3>No dispatches found</h3>
              <p>Try changing your search or filters.</p>
            </div>
          ) : (
            filteredDispatches.map((d) => (
              <div key={d.id} className="dispatch-card" onClick={() => setSelectedDispatch(d)}>
                {/* CARD TOP */}
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

                {/* CARD BOTTOM GRID */}
                <div className="card-bottom-grid">
                  <div>
                    <label>
                      <FiCalendar className="calendar-icon" style={{ color: "#2563eb" }} />
                      Date & Time
                    </label>
                    <span>
                      {d.date}
                      <br />
                      {d.time}
                    </span>
                  </div>

                  <div>
                    <label>
                      <FiPackage className="quantity-icon" style={{ color: "#f97316" }} />
                      Qty
                    </label>
                    <span>{d.quantity}</span>
                  </div>

                  <div>
                    <label>
                      <FiMapPin className="location-icon" style={{ color: "#16a34a" }} />
                      Location
                    </label>
                    <span>{d.location}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ================= DETAILS OVERLAY ================= */}
      {selectedDispatch && (
        <DispatchDetailsOverlay
          dispatch={selectedDispatch}
          onClose={() => setSelectedDispatch(null)}
          onEdit={() => {
            // Prevent editing closed dispatches
            if (selectedDispatch.status !== "Closed") {
              setEditDispatch(selectedDispatch);
            } else {
              alert("Closed dispatches cannot be edited.");
            }
            setSelectedDispatch(null);
          }}
        />
      )}

      {/* ================= EDIT MODAL ================= */}
      {editDispatch && (
        <EditDispatchModal
          dispatch={editDispatch}
          onClose={() => setEditDispatch(null)}
          onSave={(updated) => {
            setDispatches((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
            setEditDispatch(null);
          }}
        />
      )}
    </div>
  );
};

export default DispatchList;
