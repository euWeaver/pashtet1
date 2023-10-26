import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "./logo3.png"; // Import your logo here
import "@fontsource/amatic-sc/700.css";
import ReactGA from "react-ga";
function HomePage() {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  ReactGA.pageview(window.location.pathname + window.location.search);
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play(); // Autoplay the video on component mount
    }
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      <h1 style={styles.title}>Добро пожаловать!</h1>
      <div style={videoContainerStyles} onClick={handleVideoToggleMute}>
        <video
          id="videoElement"
          style={styles.video}
          ref={videoRef}
          muted={isMuted}
          playsInline
          autoPlay
          loop // Ensure the video loops
        >
          <source src="/assets/vid.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <Link to="/second">
        <button style={styles.button}>Начать</button>
      </Link>
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
  title: {
    textAlign: "center",
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

export default HomePage;
