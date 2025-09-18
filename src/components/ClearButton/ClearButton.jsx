import { useState } from "react";
import "./ClearButton.css";
import { IoTrash } from "react-icons/io5";

export default function ClearButton({ handleClear }) {
    const [showModal, setShowModal] = useState(false);

    const confirmClear = () => {
        handleClear();
        setShowModal(false);
    };

    return (
        <div className="ClearButton">
            <button onClick={() => setShowModal(true)} className="clear-button">
                <IoTrash />
            </button>

            {showModal && (
                <div className="confirm-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>¿Estás seguro?</h3>
                        <p>Esto borrará toda la conversación y no podrás recuperarla.</p>
                        <div className="confirm-modal-buttons">
                            <button onClick={() => setShowModal(false)} className="confirm-modal-button cancel">
                                Cancelar
                            </button>
                            <button onClick={() => confirmClear()} className="confirm-modal-button confirm">
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}