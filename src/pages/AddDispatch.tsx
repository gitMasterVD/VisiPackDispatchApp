import { useState, useRef, useEffect } from "react";
import "../styles/add-dispatch.css";           
import "react-datepicker/dist/react-datepicker.css"; 
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { FiArrowLeft, FiChevronDown } from "react-icons/fi";
import DatePicker from "react-datepicker";

// ✅ import addDispatch from service
import { addDispatch } from "../services/dispatchService";

const statusOptions: string[] = ["Need Confirmation", "Closed"];
const priorityOptions: string[] = ["P1 - High", "P2 - Medium", "P3 - Low"];

const AddDispatch = () => {
  const [client, setClient] = useState<string>("");
  const [po, setPo] = useState<string>("");
  const [item, setItem] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [status, setStatus] = useState<string>("Need Confirmation");
  const [priority, setPriority] = useState<string>("P1 - High");
  const [date, setDate] = useState<Date | null>(new Date());
  const [time, setTime] = useState<Date | null>(new Date());

  const [statusOpen, setStatusOpen] = useState<boolean>(false);
  const [priorityOpen, setPriorityOpen] = useState<boolean>(false);
  const [statusUp, setStatusUp] = useState<boolean>(false);
  const [priorityUp, setPriorityUp] = useState<boolean>(false);

  const [datePopper, setDatePopper] = useState<"top-start" | "bottom-start">("bottom-start");
  const [timePopper, setTimePopper] = useState<"top-start" | "bottom-start">("bottom-start");

  const statusRef = useRef<HTMLDivElement>(null);
  const priorityRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) setStatusOpen(false);
      if (priorityRef.current && !priorityRef.current.contains(event.target as Node)) setPriorityOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleStatusDropdown = () => {
    if (statusRef.current) {
      const rect = statusRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setStatusUp(spaceBelow < 200);
    }
    setStatusOpen(!statusOpen);
  };

  const togglePriorityDropdown = () => {
    if (priorityRef.current) {
      const rect = priorityRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setPriorityUp(spaceBelow < 200);
    }
    setPriorityOpen(!priorityOpen);
  };

  const handleDateOpen = () => {
    if (dateRef.current) {
      const rect = dateRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const calendarHeight = 280;
      setDatePopper(spaceBelow < calendarHeight ? "top-start" : "bottom-start");
    }
  };

  const handleTimeOpen = () => {
    if (timeRef.current) {
      const rect = timeRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const calendarHeight = 280;
      setTimePopper(spaceBelow < calendarHeight ? "top-start" : "bottom-start");
    }
  };

  // ✅ BACKEND-READY SAVE
  const handleSave = async () => {
    if (!client || !po || !quantity) {
      alert("Please fill mandatory fields");
      return;
    }

    try {
      const saved = await addDispatch({
        client,
        po,
        code: item,
        quantity,
        location,
        status: status as "Need Confirmation" | "Closed" | "NIA",
        priority: priority.split(" ")[0] as "P1" | "P2" | "P3",
        date: date
          ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
          : "",
        time: time
          ? `${String(time.getHours()).padStart(2, "0")}:${String(time.getMinutes()).padStart(2, "0")}`
          : "",
      });

      alert("Dispatch saved successfully!");
      console.log("Saved dispatch:", saved);

      // ✅ Optional: Reset form
      setClient(""); setPo(""); setItem(""); setQuantity(""); setLocation("");
      setStatus("Need Confirmation"); setPriority("P1 - High"); setDate(new Date()); setTime(new Date());
    } catch (err) {
      console.error("Failed to save dispatch", err);
      alert("Failed to save dispatch. Please try again.");
    }
  };

  return (
    <div className="add-dispatch-page">
      <div className="add-dispatch-card">
        <div className="dispatch-card-header">
          <div className="back-arrow" onClick={() => window.history.back()}>
            <FiArrowLeft size={20} />
          </div>
          <h3 className="dispatch-card-title">Add New Dispatch</h3>
        </div>

        <div className="dispatch-card-form">
          <label>Client Name <span>*</span></label>
          <InputText value={client} onChange={e => setClient(e.target.value)} className="dispatch-input" />

          <label>PO Number <span>*</span></label>
          <InputText value={po} onChange={e => setPo(e.target.value)} className="dispatch-input" />

          <label>Item / Description</label>
          <InputText value={item} onChange={e => setItem(e.target.value)} className="dispatch-input" />

          <div className="form-row">
            <div ref={dateRef}>
              <label>Date</label>
              <DatePicker
                selected={date}
                onChange={setDate}
                dateFormat="dd/MM/yyyy"
                className="dispatch-input"
                placeholderText="Select Date"
                minDate={new Date()}
                showDisabledMonthNavigation
                popperPlacement={datePopper}
                onCalendarOpen={handleDateOpen}
              />
            </div>

            <div ref={timeRef}>
              <label>Time</label>
              <DatePicker
                selected={time}
                onChange={setTime}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="h:mm aa"
                className="dispatch-input"
                placeholderText="Select Time"
                minDate={new Date()}
                popperPlacement={timePopper}
                onCalendarOpen={handleTimeOpen}
              />
            </div>
          </div>

          <div className="form-row">
            <div>
              <label>Quantity <span>*</span></label>
              <InputText value={quantity} onChange={e => setQuantity(e.target.value)} className="dispatch-input" />
            </div>

            <div>
              <label>Location / Vehicle</label>
              <InputTextarea value={location} onChange={e => setLocation(e.target.value)} rows={1} autoResize className="dispatch-input" />
            </div>
          </div>

          <div className="form-row">
            <div ref={statusRef}>
              <label>Status</label>
              <div className="priority-dropdown" onClick={toggleStatusDropdown}>
                <div className="dropdown-header">
                  <span>{status}</span>
                  <FiChevronDown style={{ marginLeft: "auto", transform: statusOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "0.2s" }} size={14} />
                </div>
                {statusOpen && (
                  <div className="dropdown-options" style={{ top: statusUp ? "auto" : "100%", bottom: statusUp ? "100%" : "auto" }}>
                    {statusOptions.map(s => (
                      <div key={s} className="dropdown-option" onClick={() => { setStatus(s); setStatusOpen(false); }}>{s}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div ref={priorityRef}>
              <label>Priority</label>
              <div className="priority-dropdown" onClick={togglePriorityDropdown}>
                <div className="dropdown-header">
                  <span>{priority}</span>
                  <FiChevronDown style={{ marginLeft: "auto", transform: priorityOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "0.2s" }} size={14} />
                </div>
                {priorityOpen && (
                  <div className="dropdown-options" style={{ top: priorityUp ? "auto" : "100%", bottom: priorityUp ? "100%" : "auto" }}>
                    {priorityOptions.map(p => (
                      <div key={p} className="dropdown-option" onClick={() => { setPriority(p); setPriorityOpen(false); }}>{p}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Button label="Save Dispatch" className="save-dispatch-btn" onClick={handleSave} />
        </div>
      </div>
    </div>
  );
};

export default AddDispatch;
