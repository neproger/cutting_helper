import { FaXmark } from "react-icons/fa6";
import React from 'react'

export default function Modal({ isOpen, onClose, children }) {
    if (!isOpen) return null;

    function onClick(e) {
        // Проверяем, что клик произошел по модальному оверлею, а не по его дочерним элементам
        if (e.target.classList.contains("modal-overlay")) {
            onClose(); // Вызываем функцию onClose для закрытия модального окна
        }
    }

    return (
        <div className="modal-overlay cursor-pointer" onClick={onClick}>
            <div className="modal">
                <div className="modal-content">
                    {children}
                </div>
                <div className="modal-close-button" onClick={onClose}><FaXmark size={20} /></div>
            </div>
        </div>
    );
};