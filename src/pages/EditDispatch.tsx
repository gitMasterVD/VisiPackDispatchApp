import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { mockDispatches } from "../data/mockDispatches";
import type { Dispatch } from "../data/mockDispatches";


import "../styles/edit-dispatch.css";

const EditDispatch: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const dispatch = mockDispatches.find(
    (d) => d.id === Number(id)
  );

  if (!dispatch) {
    return <p style={{ padding: 16 }}>Dispatch not found</p>;
  }

  const [formData, setFormData] = useState<Dispatch>({ ...dispatch });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "quantity"
          ? value === "" ? "" : Number(value)
          : value,
    }));
  };

  const handleSave = () => {
    // Update mock data (demo only)
    const index = mockDispatches.findIndex((d) => d.id === formData.id);
    if (index !== -1) {
      mockDispatches[index] = formData;
    }

    navigate("/dispatches");
  };

  return (
    <div className="edit-dispatch-page">
      <div className="edit-dispatch-card">
        <h2>Edit Dispatch</h2>

        <label>Client</label>
        <input value={formData.client} disabled />

      <label>Item</label>
<input value={formData.code} disabled />


        <label>PO No</label>
        <input value={formData.po} disabled />

        <label>Date</label>
        <input
          name="date"
          value={formData.date}
          onChange={handleChange}
        />

        <label>Time</label>
        <input
          name="time"
          value={formData.time}
          onChange={handleChange}
        />

        <label>Quantity</label>
        <input
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
        />

        <label>Location</label>
        <input
          name="location"
          value={formData.location}
          onChange={handleChange}
        />

        <label>Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="Need Confirmation">Need Confirmation</option>
          <option value="Closed">Closed</option>
          <option value="NIA">NIA</option>
        </select>

        <label>Priority</label>
        <select
          name="priority"
          value={formData.priority}
          onChange={handleChange}
        >
          <option value="P1">P1</option>
          <option value="P2">P2</option>
          <option value="P3">P3</option>
        </select>

        <div className="edit-actions">
          <button onClick={() => navigate("/dispatches")}>Cancel</button>
          <button className="primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditDispatch;
