import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import Toast from "../Toast/Toast"; // The imported component
import "./Contribute.css";
import contri from "../../images/contribute.png";
import book from "../../images/book.png"; // The imported image for the file drop area
export default function Contribute() {
    // --- State Management ---
    const [file, setFile] = useState(null);
    const [allSubjects, setAllSubjects] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Using 'toastData' as the state name to avoid conflict with 'Toast' component
    const [toastData, setToastData] = useState({ 
        show: false, 
        type: "success", 
        msg: "" 
    });

    const [formData, setFormData] = useState({
        year: "",
        type: "",
        subject: "",
        contributorName: "",
    });

    // --- Effects ---
    useEffect(() => {
        const savedUsername = Cookies.get("username");
        if (savedUsername) {
            setFormData((prev) => ({ ...prev, contributorName: savedUsername }));
        }

        const fetchSubjects = async () => {
            try {
                const response = await axios.get("https://synergic-backend.onrender.com/api/subjects");
                setAllSubjects(response.data);
            } catch (error) {
                console.error("Error fetching subjects:", error);
            }
        };
        fetchSubjects();
    }, []);

    // --- Handlers ---
    const triggerToast = (type, msg) => {
        setToastData({ show: true, type, msg });
    };

    const handleCloseToast = () => {
        setToastData((prev) => ({ ...prev, show: false }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (event) => setFile(event.target.files[0]);

    const handleUpload = async () => {
        const { year, type, subject, contributorName } = formData;

        if (!file || !year || !type || !subject || !contributorName) {
            triggerToast("error", "Please fill all fields!");
            return;
        }

        setIsLoading(true);

        const formDataToSend = new FormData();
        formDataToSend.append("file", file);
        formDataToSend.append("year", year);
        formDataToSend.append("type", type);
        formDataToSend.append("subject", subject.replace(/\s+/g, "_"));
        formDataToSend.append("contributorName", contributorName);

        try {
            const response = await axios.post(
                "https://synergic-backend.onrender.com/upload", 
                formDataToSend, 
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            if (response.data.success) {
                triggerToast("success", "File uploaded successfully!");
                setFile(null);
                setFormData(prev => ({ ...prev, subject: "", type: "" }));
            } else {
                triggerToast("error", response.data.error || "Upload failed");
            }
        } catch (error) {
            triggerToast("error", "Server error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="all">
            {/* We use the imported Toast component here. 
                The 'toastData' state controls it. 
            */}
            {toastData.show && (
                <Toast 
                    type={toastData.type} 
                    message={toastData.msg} 
                    onClose={handleCloseToast} 
                />
            )}
            <img src={contri} className="con_img" alt="Contribute" />
            
            <div className="main23">
                <h1 className="heading23">Contribute</h1>

                <input 
                    list="subject-hints"
                    name="subject"
                    placeholder="Search Subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="dropdownss"
                    autoComplete="off"
                />
                <datalist id="subject-hints">
                    {allSubjects.map((subj) => (
                        <option key={subj._id} value={subj.name}>{subj.code}</option>
                    ))}
                </datalist>
                <select name="year" value={formData.year} onChange={handleChange} className="dropdownss">
                    <option value="">Year of Study</option>
                    {Array.from({ length: 9 }, (_, i) => {
                        const start = 2017 + i;
                        const range = `${start}-${start + 1}`;
                        return <option key={range} value={range}>{range}</option>;
                    })}
                </select>

                <select name="type" value={formData.type} onChange={handleChange} className="dropdownss">
                    <option value="">Select Type</option>
                    <option value="Mid Sem">Mid Sem</option>
                    <option value="End Sem">End Sem</option>
                    <option value="Class Test">Class Test</option>
                    <option value="Others">Others</option>
                </select>


<div className="file-drop-area" onClick={() => document.getElementById("fileInput").click()}>
    {file ? (
        <div className="drop-zone-content">
            <img src={book} alt="book" className="custom-book-icon" />
            <p className="file-name">{file.name}</p>
        </div>
    ) : (
        <div className="drop-zone-content">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
</svg>

            <p>Drag your files here</p>
        </div>
    )}
    <input id="fileInput" type="file" onChange={handleFileChange} style={{display: 'none'}} />
</div>

                <button onClick={handleUpload} className="upload" disabled={isLoading}>
                    {isLoading ? "Uploading..." : "Contribute"}
                </button>
            </div>
        </div>
    );
}