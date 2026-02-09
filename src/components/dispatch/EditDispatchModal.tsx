import React, { useEffect, useRef, useState } from "react";
import "../../styles/edit-dispatch-modal.css";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";

import { FiChevronDown } from "react-icons/fi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

import type { Dispatch } from "../../data/mockDispatches";

type StatusType = "Need Confirmation" | "Closed" | "NIA";
type PriorityType = "P1" | "P2" | "P3";

const statusOptions: StatusType[] = ["Need Confirmation", "Closed"];

interface Props {
  dispatch: Dispatch;
  onClose: () => void;
  onSave: (d: Dispatch) => void;
}

/* ======================
   SAFE DATE PARSER
====================== */
const parseDispatchDate = (v?: string): Date | null => {
  console.log("🟡 parseDispatchDate input:", v);

  if (!v || v.trim() === "" || v === "To be updated") {
    console.log("➡️ No date found → returning null");
    return null;
  }

  // Replace any separator - or . with /
  const cleaned = v.replace(/[-.]/g, "/");
  const parts = cleaned.split("/");

  if (parts.length !== 3) {
    console.log("❌ Invalid date format:", v);
    return null;
  }

  const day = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const year = Number(parts[2]);

  const parsed = new Date(year, month, day);

  if (isNaN(parsed.getTime())) {
    console.log("❌ Parsed date is invalid:", parsed);
    return null;
  }

  console.log("✅ Parsed date object:", parsed);
  return parsed;
};

/* ======================
   SAFE TIME PARSER
====================== */
const parseDispatchTime = (v?: string): Date => {
  console.log("🟡 parseDispatchTime input:", v);

  if (!v) {
    console.log("➡️ No time → defaulting to current time");
    return new Date();
  }

  const match = v.match(/^(\d{1,2}):(\d{2})(?:\s?(AM|PM))?$/i);
  if (!match) {
    console.log("❌ Invalid time format → defaulting to now:", v);
    return new Date();
  }

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3]?.toUpperCase();

  if (period === "PM" && hours < 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  const d = new Date();
  d.setHours(hours, minutes, 0, 0);

  console.log("✅ Parsed time object:", d);
  return d;
};
const EditDispatchModal: React.FC<Props> = ({ dispatch, onClose, onSave }) => {
  const [client, setClient] = useState(dispatch.client || "");
  const [po, setPo] = useState(dispatch.po || "");
  const [item, setItem] = useState(dispatch.code || "");
  const [quantity, setQuantity] = useState(
    dispatch.quantity !== undefined && dispatch.quantity !== null
      ? String(dispatch.quantity)
      : ""
  );
  const [location, setLocation] = useState(dispatch.location || "");

  /* ---------- DATE & TIME ---------- */
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date>(new Date());

  const [status, setStatus] = useState<StatusType>(dispatch.status || "Need Confirmation");
  const [priority, setPriority] = useState<PriorityType>(dispatch.priority || "P1");

  const [statusOpen, setStatusOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);

  const statusRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setStatusOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // Populate state if dispatch changes
  useEffect(() => {
    if (!dispatch) return;

    setClient(dispatch.client || "");
    setPo(dispatch.po || "");
    setItem(dispatch.code || "");
    setQuantity(
      dispatch.quantity !== undefined && dispatch.quantity !== null
        ? String(dispatch.quantity)
        : ""
    );
    setLocation(dispatch.location || "");
  const parsedDate = parseDispatchDate(dispatch.date);
    console.log("📅 Final date state:", parsedDate);
    setDate(parsedDate);

    const parsedTime = parseDispatchTime(dispatch.time);
    console.log("⏰ Final time state:", parsedTime);
    setTime(parsedTime);
    setStatus(dispatch.status || "Need Confirmation");
    setPriority(dispatch.priority || "P1");
  }, [dispatch]);

  const handleSave = () => {
    // Fix quantity parsing
    const qtyValue = quantity.trim();
    const parsedQty = Number(qtyValue);

    const finalQuantity =
      qtyValue === ""
        ? dispatch.quantity ?? 0
        : isNaN(parsedQty)
        ? qtyValue // allow string fallback
        : parsedQty;
       console.log("💾 Saving dispatch...");

    const savedDate = date ? date.toLocaleDateString("en-GB") : "";
    const savedTime = time.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    console.log("📤 Saving date:", savedDate);
    console.log("📤 Saving time:", savedTime);  

    onSave({
      ...dispatch,
      client,
      po,
      code: item,
      quantity: finalQuantity,
      location,
      date: savedDate, // ✅ string ONLY
      time: savedTime, status,
      priority,
    });
  };

  return (
    <div className="edit-overlay" onClick={onClose}>
      <div className="edit-sheet" onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="edit-header">
          <h2>Edit Dispatch</h2>
          <button className="edit-close" onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <hr />

        {/* BODY */}
        <div className="edit-body">
          <div className="edit-grid">
            <div className="edit-group">
              <label>Client Name</label>
              <InputText value={client} onChange={(e) => setClient(e.target.value)} />
            </div>

            <div className="edit-group">
              <label>PO Number</label>
              <InputText value={po} onChange={(e) => setPo(e.target.value)} />
            </div>

            <div className="edit-group">
              <label>Item / Description</label>
              <InputText value={item} onChange={(e) => setItem(e.target.value)} />
            </div>

            <div className="edit-group">
              <label>Date & Time</label>
              <div className="edit-datetime">
                <DatePicker
                  selected={date}
                   onChange={(d: Date | null) => {
                    console.log("🟢 DatePicker change:", d);
                    setDate(d);
                  }}
                  dateFormat="dd/MM/yyyy"
                  className="edit-input"
                  popperContainer={({ children }) => <div style={{ position: "relative" }}>{children}</div>}
                  popperPlacement="bottom-start"
                  dropdownMode="select"
                />
                <DatePicker
                  selected={time}
                onChange={(t: Date | null) => {
                    console.log("🟢 TimePicker change:", t);
                    if (t) setTime(t);
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  dateFormat="h:mm aa"
                  className="edit-input"
                  popperContainer={({ children }) => <div style={{ position: "relative" }}>{children}</div>}
                  popperPlacement="bottom-start"
                  dropdownMode="select"
                />
              </div>
            </div>

            <div className="edit-group">
              <label>Quantity</label>
              <InputText value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>

            <div className="edit-group">
              <label>Location / Vehicle</label>
              <InputTextarea
                value={location}
                rows={1}
                autoResize
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            {/* STATUS */}
            <div className="edit-group" ref={statusRef}>
              <label>Status</label>
              <div
                className="edit-dropdown"
                onClick={() => {
                  if (statusRef.current) {
                    const rect = statusRef.current.getBoundingClientRect();
                    const spaceBelow = window.innerHeight - rect.bottom;
                    setOpenUp(spaceBelow < 200);
                  }
                  setStatusOpen(!statusOpen);
                }}
              >
                <span>{status}</span>
                <FiChevronDown />
              </div>
              {statusOpen && (
                <div className={`edit-dropdown-menu ${openUp ? "up" : "down"}`}>
                  {statusOptions.map((s) => (
                    <div
                      key={s}
                      className="edit-dropdown-item"
                      onClick={() => {
                        setStatus(s);
                        setStatusOpen(false);
                      }}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PRIORITY */}
            <div className="edit-group">
              <label>Priority Override</label>
              <div className="priority-slider">
                <div className={`priority-indicator ${priority.toLowerCase()}`} />
                {(["P1", "P2", "P3"] as PriorityType[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`priority-btn ${priority === p ? "active" : ""}`}
                    onClick={() => setPriority(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="edit-footer">
          <button className="btn-primary" onClick={handleSave}>
            Save Dispatch
          </button>
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditDispatchModal;
