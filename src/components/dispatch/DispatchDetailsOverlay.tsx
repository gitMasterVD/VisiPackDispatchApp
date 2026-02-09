import { FiCalendar, FiMapPin, FiPackage } from "react-icons/fi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faPen } from "@fortawesome/free-solid-svg-icons";
import type { Dispatch } from "../../data/mockDispatches";
import "../../styles/dispatch-details-overlay.css";

interface Props {
  dispatch: Dispatch;
  onClose: () => void;
  onEdit: () => void;
}

const DispatchDetailsOverlay: React.FC<Props> = ({
  dispatch,
  onClose,
  onEdit,
}) => {
  return (
    <div className="details-overlay" onClick={onClose}>
      <div
        className="details-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ===== HEADER: Only Item Code ===== */}
        <div className="details-header">
          <h2>{dispatch.code}</h2>

          <button className="close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <hr className="divider" />

        {/* ===== Scrollable Body ===== */}
        <div className="details-body">
          <div className="client-name">
            PO: <span>{dispatch.po}</span>
          </div>

          <div className="client-name">
            Client: <span>{dispatch.client}</span>
          </div>

          <div className="two-col">
            <div className="detail-block">
              <label><FiCalendar /> Date</label>
              <p>{dispatch.date}</p>
            </div>

            <div className="detail-block">
              <label>Time</label>
              <p>{dispatch.time}</p>
            </div>
          </div>

          <div className="detail-block">
            <label><FiPackage /> Quantity</label>
            <p>{dispatch.quantity}</p>
          </div>

          <div className="detail-block">
            <label><FiMapPin /> Location</label>
            <p>{dispatch.location}</p>
          </div>
        </div>

        {/* ===== Footer ===== */}
        <div className="details-footer">
          {/* Show Edit button only if dispatch is NOT Closed */}
          {dispatch.status !== "Closed" && (
            <button className="btn-edit" onClick={onEdit}>
              <FontAwesomeIcon icon={faPen} />
              Edit Details
            </button>
          )}

          <button className="btn-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DispatchDetailsOverlay;
