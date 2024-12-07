import React from 'react'
    


export default function Header({currentPage, openModal}) {

    return (
        <>
            <div className={`get_parts button ${currentPage === "Список" ? "active" : ""}`}>Список</div>
            <div className={`cutting_page button ${currentPage === "Крой" ? "active" : ""}`}>Крой</div>
            <div className={`materials_page button ${currentPage === "Материалы" ? "active" : ""}`}>Материалы</div>
            <div className="get_xml button">Отчет XML</div>
            <div onClick={openModal} className="settings button">Настройки</div>
        </>
    )
}