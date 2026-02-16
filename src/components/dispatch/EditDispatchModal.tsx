import React, { useEffect, useRef, useState } from "react";
import "../../styles/edit-dispatch-modal.css";
import {
  FiUserCheck,
  FiPackage,
  FiShield,
  FiTruck,
  FiDollarSign,
 
} from "react-icons/fi";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import type { SingleValue } from "react-select";



import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";

import {
  FiChevronDown,
  FiChevronUp,
  FiLock,
  FiCheckCircle,
} from "react-icons/fi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

import type { Dispatch } from "../../data/mockDispatches";
interface TimeOption {
  label: string;
  value: number;
}


type StatusType = "Need Confirmation" | "Closed" | "NIA";
type PriorityType = "P1" | "P2" | "P3";

const statusOptions: StatusType[] = ["Need Confirmation", "Closed"];

const timeOptions: TimeOption[] = [
  { label: "1 Hour", value: 1 },
  { label: "2 Hours", value: 2 },
  { label: "3 Hours", value: 3 },
  { label: "4 Hours", value: 4 },
  { label: "5 Hours", value: 5 },
  { label: "6 Hours", value: 6 },
  { label: "7 Hours", value: 7 },
  { label: "8 Hours", value: 8 },
];

const TimeSelect = ({
  value,
  onChange,
}: {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
}) => {
  return (
    <Select<TimeOption>
      options={timeOptions}
      value={
        timeOptions.find(option => option.value === value) ?? null
      }
      onChange={(selected: SingleValue<TimeOption>) =>
        onChange(selected?.value ?? null)
      }
      placeholder="Select Time"
      classNamePrefix="dispatchSelect"
      menuPortalTarget={document.body}
      menuPosition="fixed"
      isClearable
    />
  );
};


/* ======================
   SAFE PARSERS
====================== */
const parseDispatchDate = (v?: string): Date | null => {
  if (!v || v.trim() === "" || v === "To be updated") return null;
  const cleaned = v.replace(/[-.]/g, "/");
  const parts = cleaned.split("/");
  if (parts.length !== 3) return null;
  const day = Number(parts[0]),
    month = Number(parts[1]) - 1,
    year = Number(parts[2]);
  const parsed = new Date(year, month, day);
  return isNaN(parsed.getTime()) ? null : parsed;
};

const parseDispatchTime = (v?: string): Date => {
  if (!v) return new Date();
  const match = v.match(/^(\d{1,2}):(\d{2})(?:\s?(AM|PM))?$/i);
  if (!match) return new Date();
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10),
    period = match[3]?.toUpperCase();
  if (period === "PM" && hours < 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
};

interface Props {
  dispatch: Dispatch;
  onClose: () => void;
  onSave: (d: Dispatch) => void;
}

const EditDispatchModal: React.FC<Props> = ({ dispatch, onClose, onSave }) => {
  const userRole = sessionStorage.getItem("role") || "superuser";
  const isSuper = userRole === "superuser";

  // MASTER STATES
  const [client, setClient] = useState(dispatch.client || "");
  const [po, setPo] = useState(dispatch.po || "");
  const [item, setItem] = useState(dispatch.code || "");
  const [quantity, setQuantity] = useState(
    dispatch.quantity !== undefined ? String(dispatch.quantity) : "",
  );
  const [location, setLocation] = useState(dispatch.location || "");
  const [date, setDate] = useState<Date | null>(
    parseDispatchDate(dispatch.date),
  );
  const [time, setTime] = useState<Date>(parseDispatchTime(dispatch.time));
  const [status, setStatus] = useState<StatusType>(
    dispatch.status || "Need Confirmation",
  );
  const [priority, setPriority] = useState<PriorityType>(
    dispatch.priority || "P1",
  );

  // ROLE STATES
  const [formData, setFormData] = useState<Dispatch>({ ...dispatch });

  // UI STATES
  const [statusOpen, setStatusOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const [openSection, setOpenSection] = useState<string | null>("master");

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node))
        setStatusOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const handleSave = () => {
    const savedDate = date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
      : "";
    const savedTime = time
      ? `${String(time.getHours()).padStart(2, "0")}:${String(time.getMinutes()).padStart(2, "0")}`
      : "";

    onSave({
      ...formData,
      client,
      po,
      code: item,
      quantity: Number(quantity),
      location,
      status,
      priority,
      date: savedDate,
      time: savedTime,
    });
  };

  const RenderRadio = (field: keyof Dispatch, label: string) => (
    <div className="edit-group">
      <label>{label}</label>
      <div className="radio-container">
        <label className="radio-option">
          <input
            type="radio"
            checked={formData[field] === "Yes"}
            onChange={() => setFormData({ ...formData, [field]: "Yes" })}
          />
          <span>Yes</span>
        </label>
        <label className="radio-option">
          <input
            type="radio"
            checked={formData[field] === "No"}
            onChange={() => setFormData({ ...formData, [field]: "No" })}
          />
          <span>No</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="edit-overlay" onClick={onClose}>
      <div className="edit-sheet" onClick={(e) => e.stopPropagation()}>
       <div className="edit-header">
  <div className="edit-header-left">
    <h2 className="edit-title">Modify Dispatch Record</h2>
    <span className="edit-subtitle">Review and update the dispatch information as required</span>
  </div>

  <button className="edit-close" onClick={onClose}>
    <FontAwesomeIcon icon={faXmark} />
  </button>
</div>


        <div className="edit-body">
          {/* 1. MASTER DATA ACCORDION */}
          <div className="edit-accordion master">
            <div
              className="accordion-trigger"
              onClick={() =>
                setOpenSection(openSection === "master" ? null : "master")
              }
            >
              <span>
                <FiLock /> Core Dispatch Details
              </span>
              {openSection === "master" ? <FiChevronUp /> : <FiChevronDown />}
            </div>
            {openSection === "master" && (
              <div className="accordion-content">
                <div className="edit-grid">
                  <div className="edit-group">
                    <label>Client Name</label>
                    <InputText
                      value={client}
                      onChange={(e) => setClient(e.target.value)}
                    />
                  </div>
                  <div className="edit-group">
                    <label>PO Number</label>
                    <InputText
                      value={po}
                      onChange={(e) => setPo(e.target.value)}
                    />
                  </div>
                  <div className="edit-group">
                    <label>Item / Description</label>
                    <InputText
                      value={item}
                      onChange={(e) => setItem(e.target.value)}
                    />
                  </div>
                  <div className="edit-group">
                    <label>Date & Time</label>
                    <div className="edit-datetime">
                      <DatePicker
                        selected={date}
                        onChange={(d: Date | null) => setDate(d)}
                        dateFormat="dd/MM/yyyy"
                        className="edit-input"
                        portalId="root"
                      />
                      <DatePicker
                        selected={time}
                        onChange={(t: Date | null) => t && setTime(t)}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        dateFormat="h:mm aa"
                        className="edit-input"
                        portalId="root"
                      />
                    </div>
                  </div>
                  <div className="edit-group">
                    <label>Quantity</label>
                    <InputText
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
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

                  <div className="edit-group" ref={statusRef}>
                    <label>Status</label>
                    <div
                      className="edit-dropdown"
                      onClick={() => setStatusOpen(!statusOpen)}
                    >
                      <span>{status}</span>
                      <FiChevronDown />
                    </div>
                    {statusOpen && (
                      <div className="edit-dropdown-menu">
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

                <div className="edit-group">
  <label>Priority Override</label>
  <div className="priority-slider">
    {(["P1", "P2", "P3"] as PriorityType[]).map((p) => (
      <button
        key={p}
        type="button"
        className={`priority-btn ${
          priority === p ? `active ${p.toLowerCase()}` : ""
        }`}
        onClick={() => setPriority(p)}
      >
        {p}
      </button>
    ))}
  </div>
</div>

                </div>
              </div>
            )}
          </div>

          {/* 2. PLANT MANAGER SECTION */}
       
{(userRole === "plantManager" || isSuper) && (
  <div className="edit-accordion plant">

    {/* Accordion Header */}
    <div
      className="accordion-trigger"
      onClick={() =>
        setOpenSection(prev => (prev === "pm" ? null : "pm"))
      }
    >
      <span>
        <FiUserCheck className="section-icon" />
        Plant Manager
      </span>
      {openSection === "pm" ? <FiChevronUp /> : <FiChevronDown />}
    </div>

    {/* Accordion Content */}
    {openSection === "pm" && (
      <div className="accordion-content pm-content">

        {/* PO Verification */}
        <label className="edit-label-sm required">
          PO Verification
        </label>

        <div className="radio-group">
          <label className="radio-option">
            <input
              type="radio"
              name="pmPoVerified"
              value="Yes"
              checked={formData.pmPoVerified === "Yes"}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  pmPoVerified: e.target.value,
                }))
              }
            />
            <span>Yes</span>
          </label>

          <label className="radio-option">
            <input
              type="radio"
              name="pmPoVerified"
              value="No"
              checked={formData.pmPoVerified === "No"}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  pmPoVerified: e.target.value,
                }))
              }
            />
            <span>No</span>
          </label>
        </div>

        {/* Time Required */}
        <label className="edit-label-sm required">
          Time Required (Hours)
        </label>
        <TimeSelect
  value={formData.pmTimeRequired}
  onChange={(value) =>
    setFormData(prev => ({
      ...prev,
      pmTimeRequired: value,
    }))
  }
/>


        {/* <div className="dropdown-wrapper">
       <Dropdown
  value={formData.pmTimeRequired}
  options={timeOptions}
  onChange={(e) =>
    setFormData(prev => ({
      ...prev,
      pmTimeRequired: e.value,
    }))
  }
  
  placeholder="Select Time"
  className="dispatch-dropdown modern-dropdown"
  showClear
/>




          
        
        </div> */}

  




        {/* Comments */}
        <label className="edit-label-sm">
          Comments
        </label>

        <InputTextarea
          value={formData.pmComments || ""}
          onChange={(e) =>
            setFormData(prev => ({
              ...prev,
              pmComments: e.target.value,
            }))
          }
          placeholder="Enter comments"
          rows={3}
          className="edit-input"
        />
      </div>
    )}
  </div>
)}

          
       

{/* 3. FG SECTION */}
{(userRole === "fg" || isSuper) && (
  <div className="edit-accordion fg">

    {/* Accordion Header */}
    <div
      className="accordion-trigger"
      onClick={() => setOpenSection(prev => (prev === "fg" ? null : "fg"))}
    >
      <span>
        <FiPackage className="section-icon" />
        FG Section
      </span>
      {openSection === "fg" ? <FiChevronUp /> : <FiChevronDown />}
    </div>

    {/* Accordion Content */}
    {openSection === "fg" && (
      <div className="accordion-content fg-content">

        {/* Material Availability */}
        <label className="edit-label-sm required">Material Availability</label>
        <div className="radio-group">
          <label className="radio-option">
            <input
              type="radio"
              name="fgMaterial"
              value="Yes"
              checked={formData.fgMaterial === "Yes"}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, fgMaterial: e.target.value }))
              }
            />
            <span>Yes</span>
          </label>

          <label className="radio-option">
            <input
              type="radio"
              name="fgMaterial"
              value="No"
              checked={formData.fgMaterial === "No"}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, fgMaterial: e.target.value }))
              }
            />
            <span>No</span>
          </label>
        </div>

        {/* Time Required */}
        <label className="edit-label-sm required">Time Required (Hours)</label>
     
      
        <TimeSelect
  value={formData.fgTime}
  onChange={(value) =>
    setFormData(prev => ({ ...prev, fgTime: value }))
  }
/>


        {/* Comments */}
        <label className="edit-label-sm">Comments</label>
        <InputTextarea
          value={formData.fgComments || ""}
          onChange={(e) =>
            setFormData(prev => ({ ...prev, fgComments: e.target.value }))
          }
          placeholder="Enter comments"
          rows={3}
          className="edit-input"
        />

      </div>
    )}
  </div>
)}

{/* 4. QC SECTION */}
{(userRole === "qc" || isSuper) && (
  <div className="edit-accordion qc">

    {/* Accordion Header */}
    <div
      className="accordion-trigger"
      onClick={() => setOpenSection(prev => (prev === "qc" ? null : "qc"))}
    >
      <span>
        <FiShield className="section-icon" />
        QC Section
      </span>
      {openSection === "qc" ? <FiChevronUp /> : <FiChevronDown />}
    </div>

    {/* Accordion Content */}
    {openSection === "qc" && (
      <div className="accordion-content qc-content">

        {/* Quality Clearance */}
        <label className="edit-label-sm required">Quality Clearance</label>
        <div className="radio-group">
          <label className="radio-option">
            <input
              type="radio"
              name="qcClearance"
              value="Yes"
              checked={formData.qcClearance === "Yes"}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, qcClearance: e.target.value }))
              }
            />
            <span>Yes</span>
          </label>

          <label className="radio-option">
            <input
              type="radio"
              name="qcClearance"
              value="No"
              checked={formData.qcClearance === "No"}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, qcClearance: e.target.value }))
              }
            />
            <span>No</span>
          </label>
        </div>

        {/* Time Required */}
        <label className="edit-label-sm required">Time Required (Hours)</label>
        <TimeSelect
  value={formData.qcTime}
  onChange={(value) =>
    setFormData(prev => ({ ...prev, qcTime: value }))
  }
/>


        {/* Comments */}
        <label className="edit-label-sm">Comments</label>
        <InputTextarea
          value={formData.qcComments || ""}
          onChange={(e) =>
            setFormData(prev => ({ ...prev, qcComments: e.target.value }))
          }
          placeholder="Enter comments"
          rows={3}
          className="edit-input"
        />

      </div>
    )}
  </div>
)}

{/* 5. DISPATCH SECTION */}
{(userRole === "dispatch" || isSuper) && (
  <div className="edit-accordion dispatch">

    {/* Accordion Header */}
    <div
      className="accordion-trigger"
      onClick={() => setOpenSection(prev => (prev === "dispatch" ? null : "dispatch"))}
    >
      <span>
        <FiTruck className="section-icon" />
        Dispatch Section
      </span>
      {openSection === "dispatch" ? <FiChevronUp /> : <FiChevronDown />}
    </div>

    {/* Accordion Content */}
    {openSection === "dispatch" && (
      <div className="accordion-content dispatch-content">

        {/* Vehicle Availability */}
        <label className="edit-label-sm required">Vehicle Availability</label>
        <div className="radio-group">
          <label className="radio-option">
            <input
              type="radio"
              name="dispatchVehicle"
              value="Yes"
              checked={formData.dispatchVehicle === "Yes"}
              onChange={e =>
                setFormData(prev => ({ ...prev, dispatchVehicle: e.target.value }))
              }
            />
            <span>Yes</span>
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="dispatchVehicle"
              value="No"
              checked={formData.dispatchVehicle === "No"}
              onChange={e =>
                setFormData(prev => ({ ...prev, dispatchVehicle: e.target.value }))
              }
            />
            <span>No</span>
          </label>
        </div>

        {/* Hamali Availability */}
        <label className="edit-label-sm required">Hamali Availability</label>
        <div className="radio-group">
          <label className="radio-option">
            <input
              type="radio"
              name="dispatchHamali"
              value="Yes"
              checked={formData.dispatchHamali === "Yes"}
              onChange={e =>
                setFormData(prev => ({ ...prev, dispatchHamali: e.target.value }))
              }
            />
            <span>Yes</span>
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="dispatchHamali"
              value="No"
              checked={formData.dispatchHamali === "No"}
              onChange={e =>
                setFormData(prev => ({ ...prev, dispatchHamali: e.target.value }))
              }
            />
            <span>No</span>
          </label>
        </div>

        {/* Shipment Summary */}
        <label className="edit-label-sm">Shipment Summary</label>
        <InputTextarea
          value={formData.dispatchSummary || ""}
          onChange={e =>
            setFormData(prev => ({ ...prev, dispatchSummary: e.target.value }))
          }
          placeholder="Enter shipment summary"
          rows={3}
          className="edit-input"
        />

        {/* Time Required */}
        <label className="edit-label-sm required">Time Required (Hours)</label>
        <TimeSelect
  value={formData.dispatchTime}
  onChange={(value) =>
    setFormData(prev => ({ ...prev, dispatchTime: value }))
  }
/>

     

        {/* Comments */}
        <label className="edit-label-sm">Comments</label>
        <InputTextarea
          value={formData.dispatchComments || ""}
          onChange={e =>
            setFormData(prev => ({ ...prev, dispatchComments: e.target.value }))
          }
          placeholder="Enter comments"
          rows={3}
          className="edit-input"
        />

      </div>
    )}
  </div>
)}

{/* 6. FINANCE SECTION */}
{(userRole === "finance" || isSuper) && (
  <div className="edit-accordion finance">

    {/* Accordion Header */}
    <div
      className="accordion-trigger"
      onClick={() => setOpenSection(prev => (prev === "finance" ? null : "finance"))}
    >
      <span>
        <FiDollarSign className="section-icon" />
        Finance Section
      </span>
      {openSection === "finance" ? <FiChevronUp /> : <FiChevronDown />}
    </div>

    {/* Accordion Content */}
    {openSection === "finance" && (
      <div className="accordion-content finance-content">

        {/* Dispatch Summary Ready */}
        <label className="edit-label-sm required">Dispatch Summary Ready</label>
        <div className="radio-group">
          <label className="radio-option">
            <input
              type="radio"
              name="financeDispatch"
              value="Yes"
              checked={formData.financeDispatch === "Yes"}
              onChange={e =>
                setFormData(prev => ({ ...prev, financeDispatch: e.target.value }))
              }
            />
            <span>Yes</span>
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="financeDispatch"
              value="No"
              checked={formData.financeDispatch === "No"}
              onChange={e =>
                setFormData(prev => ({ ...prev, financeDispatch: e.target.value }))
              }
            />
            <span>No</span>
          </label>
        </div>

        {/* Challan Prepared */}
        <label className="edit-label-sm required">Challan Prepared</label>
        <div className="radio-group">
          <label className="radio-option">
            <input
              type="radio"
              name="financeChallan"
              value="Yes"
              checked={formData.financeChallan === "Yes"}
              onChange={e =>
                setFormData(prev => ({ ...prev, financeChallan: e.target.value }))
              }
            />
            <span>Yes</span>
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="financeChallan"
              value="No"
              checked={formData.financeChallan === "No"}
              onChange={e =>
                setFormData(prev => ({ ...prev, financeChallan: e.target.value }))
              }
            />
            <span>No</span>
          </label>
        </div>

        {/* Time Required */}
        <label className="edit-label-sm required">Time Required (Hours)</label>
       
        <TimeSelect
  value={formData.financeTime}
  onChange={(value) =>
    setFormData(prev => ({ ...prev, financeTime: value }))
  }
/>


        {/* Comments */}
        <label className="edit-label-sm">Comments</label>
        <InputTextarea
          value={formData.financeComments || ""}
          onChange={e =>
            setFormData(prev => ({ ...prev, financeComments: e.target.value }))
          }
          placeholder="Enter comments"
          rows={3}
          className="edit-input"
        />

      </div>
    )}
  </div>
)}

        </div>

        <div className="edit-footer">
          <button className="btn-primary" onClick={handleSave}>
            Save Changes
          </button>
          <button className="btn-secondary" onClick={onClose}>
             Discard Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditDispatchModal;
