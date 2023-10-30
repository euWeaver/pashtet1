import React, { useState, useRef, useEffect, useContext } from "react";
import { Link } from "react-router-dom";//ho
import axios from "axios";
import logo from "./logo3.png"; // Import your logo here
import "@fontsource/amatic-sc/700.css";
import emailjs from "emailjs-com";
import EmailContext from "./EmailContext";
import ReactGA from "react-ga4";
ReactGA.send({
  hitType: "pageview",
  page: "/fourth", title: "Fourth" 
});
function FourthPage() {

const FILESTACK_UPLOAD_BASE_URL = process.env.REACT_APP_FILESTACK_UPLOAD_BASE_URL;
const EMAILJS_SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
const EMAILJS_USER_ID = process.env.REACT_APP_EMAILJS_USER_ID;
  const videoToBase64 = async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const { email, setEmail } = useContext(EmailContext);
  const VideoUrl = localStorage.getItem("vidUrl");

  const uploadToFS = async () => {
      const FILESTACK_API_KEY = process.env.REACT_APP_FILESTACK_API_KEY;
const FILESTACK_UPLOAD_URL = `${FILESTACK_UPLOAD_BASE_URL}?key=${FILESTACK_API_KEY}`;

    try {
      // Encode the data
      const params = new URLSearchParams();
      params.append("url", VideoUrl);

      const config = {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      };

      // Send the video URL to Filestack for uploading
      const response = await axios.post(FILESTACK_UPLOAD_URL, params, config);

      if (response.data && response.data.url) {

        localStorage.setItem("newUrl", response.data.url);
        return response.data.url;
      } else {
        console.error("Unexpected response from Filestack:", response.data);
      }
    } catch (error) {
      console.error("Failed to upload video to Filestack:", error);
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play(); // Autoplay the video on component mount
    }

    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      setEmail(storedEmail);
      localStorage.removeItem("userEmail"); // clear the email from localStorage
    }

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (email) {
      sendEmail(email);
    }
  }, [email]);
  const downloadVideo = async (videoUrl) => {
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = downloadUrl;
      a.download = "ShalnayaImperatrica.mp4";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (e) {
      console.error("Failed to download video:", e);
    }
  };

  const sendEmail = async (email) => {
    try {
      // First, upload the video to Filestack and wait for its completion
      await uploadToFS();

      // Then, proceed to send the email
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
        {
          recipient_email: email,
          from_name: "Your Company Name",
          message: localStorage.getItem("newUrl"),
        },
       EMAILJS_USER_ID,
      );

     
    } catch (error) {
      console.error("Error occurred:", error);
    }
  };

  const handleVideoToggleMute = () => {
    if (videoRef.current.muted) {
      setIsMuted(false);
      videoRef.current.muted = false;
    } else {
      setIsMuted(true);
      videoRef.current.muted = true;
    }
  };

  const videoContainerStyles = {
    ...styles.videoContainer,
    width: windowWidth <= 768 ? "300px" : "450px",
    height: windowWidth <= 768 ? "300px" : "450px",
  };

  return (
    <div style={styles.container}>
      <div style={styles.navbar1}>
        <img src={logo} alt="Logo" style={styles.topLogo} />
      </div>
      <h1 style={styles.title}>Ваше видео!</h1>
      <div style={videoContainerStyles} onClick={handleVideoToggleMute}>
        <video
          id="videoElement"
          style={styles.video}
          ref={videoRef}
          muted={isMuted}
          playsInline
          autoPlay
          loop
        >
          <source src={VideoUrl || "/assets/vid.mp4"} type="video/mp4" />
          {/* ^^ Use videoUrl if available, fallback to static URL otherwise */}
          Your browser does not support the video tag.
        </video>
      </div>
      <div>
        <button
          onClick={() => downloadVideo(VideoUrl)}
          style={{ ...styles.button, marginRight: "20px" }}
        >
          Cкачать
        </button>
        <Link to="/">
          <button style={styles.button}>Домой</button>
        </Link>
      </div>
         <div style={styles.navbar}>
        <img src={logo} alt="Logo" style={styles.bottomLogo} />
        <a href="mailto:pifpaf.pifpaf.eu@gmail.com" style={styles.mailLink}>
          pifpaf.pifpaf.eu@gmail.com
        </a>
      </div>
    </div>
  );
}
const styles = {
  container: {
    fontFamily: '"Amatic SC", Helvetica',
    fontWeight: 700,
    color: "#402750",
    background: "linear-gradient(15deg, #D2B8E3 50%, transparent 50%)", // Adjusted gradient
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    textAlign: "center",
  },
    mailLink: {
    color: "#402750", // Or any desired color
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    marginLeft: "40px", // Margin as specified
    fontFamily: '"Amatic SC", Helvetica',
    fontWeight: 700,
    fontSize: "1.2em",
    marginRight: "20px", // You can adjust the size as needed
  },
  videoContainer: {
    border: "8px solid #402750",
    borderRadius: "15px",
    width: "450px", // Desktop size
    height: "450px", // Desktop size
   
    cursor: "pointer",
    overflow: "hidden", // This ensures the video doesn't spill outside the container
  },

  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  button: {
    backgroundColor: "#4bb150",
    fontFamily: '"Amatic SC", Helvetica',
    fontWeight: 700,
    color: "white",
    borderRadius: "20px",
    border: "none",
    padding: "15px 30px", // Double the padding
    cursor: "pointer",
    fontSize: "2em",
    marginTop: "12px",// This will make the font size bigger if needed
  },
  topLogo: {
    marginLeft: "20px", // Added 15px margin
    width: "50px", // or whatever size you want
  },
  navbar: {
    position: "fixed",
    bottom: "0",
    width: "100%",
    backgroundColor: "white",
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 20px",
    height:"15px",
  },
  
  navbar1: {
    position: "fixed",
    top: "0",
    width: "100%",
    backgroundColor: "white",
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 20px",
    height:"15px",
  },
  bottomLogo: {
    marginLeft: "20px", // Added 15px margin
    width: "50px", // or whatever size you want
  },
};
export default FourthPage;
