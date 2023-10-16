import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "./logo3.png"; // Import your logo here
import "@fontsource/amatic-sc/700.css";

function HomePage() {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

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
    width: windowWidth <= 768 ? "310px" : "500px",
    height: windowWidth <= 768 ? "310px" : "500px",
  };

  return (
    <div style={styles.container}>
      <img src={logo} alt="Logo" style={styles.topLogo} />
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
  videoContainer: {
    border: "5px solid #402750",
    borderRadius: "15px",
    width: "500px", // Desktop size
    height: "500px", // Desktop size
    margin: "20px auto",
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
    padding: "20px 40px", // Double the padding
    cursor: "pointer",
    fontSize: "2em", // This will make the font size bigger if needed
  },
  topLogo: {
    position: "absolute",
    top: "20px",
    left: "20px", // Added 15px margin
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
  },
  bottomLogo: {
    marginLeft: "20px", // Added 15px margin
    width: "50px", // or whatever size you want
  },
};

export default HomePage;
