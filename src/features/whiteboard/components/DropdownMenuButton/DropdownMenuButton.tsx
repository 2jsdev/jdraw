import React, { useEffect, useState } from 'react'
import menuIcon from "../../../../assets/menu.svg";

import exportImageIcon from "../../../../assets/export-image.svg";
import peopleIcon from "../../../../assets/people.svg";
import resetIcon from "../../../../assets/reset.svg";

import "./DropdownMenuButton.css"

const DropdownMenuButton: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleButtonClick = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    useEffect(() => {
        const handleDocumentClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest(".dropdown_menu_button")) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener("click", handleDocumentClick);

        return () => {
            document.removeEventListener("click", handleDocumentClick);
        };
    }, []);

    return (
        <>
            <button className="dropdown_menu_button" onClick={handleButtonClick}>
                <img src={menuIcon} alt="" width="80%" height="80%" />
            </button>
            {isMenuOpen && (
                <ul className="menu">
                    <li>
                        <img src={exportImageIcon} alt="Export Image" className="menu-icon" />
                        Export image...
                    </li>
                    <li>
                        <img src={peopleIcon} alt="Live Collaboration" className="menu-icon" />
                        Live collaboration...
                    </li>
                    <li>
                        <img src={resetIcon} alt="Reset Canvas" className="menu-icon" />
                        Reset the canvas
                    </li>
                </ul>
            )}
        </>

    );
}

export default DropdownMenuButton