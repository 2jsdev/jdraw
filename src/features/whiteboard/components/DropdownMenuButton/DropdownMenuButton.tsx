import React, { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux';
import { resetCanvas } from '../../slices/whiteboardSlice';

import menuIcon from "../../../../assets/menu.svg";
import exportImageIcon from "../../../../assets/export-image.svg";
import peopleIcon from "../../../../assets/people.svg";
import resetIcon from "../../../../assets/reset.svg";

import "./DropdownMenuButton.css"
import ConfirmModal from '../ConfirmModal/ConfirmModal';

interface DropdownMenuButtonProps {
    canvasRef: React.RefObject<HTMLCanvasElement>;
}

const DropdownMenuButton: React.FC<DropdownMenuButtonProps> = ({ canvasRef }) => {
    const dispatch = useDispatch();
    const downloadLinkRef = useRef<HTMLAnchorElement>(null);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isResetConfirmationModalOpen, setIsResetConfirmationModalOpen] = useState<boolean>(false);

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

    const toggleMenu = () => setIsMenuOpen(prev => !prev);

    const exportCanvasAsImage = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const image = canvas.toDataURL("image/png");
            if (downloadLinkRef.current) {
                downloadLinkRef.current.href = image;
                downloadLinkRef.current.click();
            }
        }
    };

    const resetCanvasWithConfirmation = () => {
        dispatch(resetCanvas());
        setIsResetConfirmationModalOpen(false);
    };

    return (
        <>
            <button className="dropdown_menu_button" onClick={toggleMenu}>
                <img src={menuIcon} alt="" width="80%" height="80%" />
            </button>
            {isMenuOpen && (
                <ul className="menu">
                    <button onClick={exportCanvasAsImage}>
                        <img src={exportImageIcon} alt="Export Image" className="menu-icon" />
                        Export image...
                    </button>
                    <button disabled>
                        <img src={peopleIcon} alt="Live Collaboration" className="menu-icon disabled" />
                        Live collaboration...
                    </button>
                    <button onClick={() => setIsResetConfirmationModalOpen(true)}>
                        <img src={resetIcon} alt="Reset Canvas" className="menu-icon" />
                        Reset the canvas
                    </button>
                </ul>
            )}
            <a ref={downloadLinkRef} download="canvas.png" style={{ display: 'none' }} />
            <ConfirmModal
                isOpen={isResetConfirmationModalOpen}
                onClose={() => setIsResetConfirmationModalOpen(false)}
                onConfirm={resetCanvasWithConfirmation}
                title="Clear canvas"
                description="This will clear the whole canvas. Are you sure?"
            />
        </>
    );
}

export default DropdownMenuButton;