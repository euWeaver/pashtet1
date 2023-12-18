import React, { useState, useRef, useEffect, useContext } from "react";
import logo from "./logo3.png";
import "@fontsource/amatic-sc/700.css";
import EmailContext from "./EmailContext";
import ReactGA from "react-ga4";
ReactGA.send({
  hitType: "pageview",
  page: "/third", title: "Third" 
});
const ThirdPage = ({ history, location }) => {
  // <-- Add location prop here gffgf

  const videoUrl = location.state?.videoUrl;
  const videoRef = useRef(null);
  const [showPopup, setShowPopup] = useState(false);
  const [email1, setEmail1] = useState("");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const { setEmail } = useContext(EmailContext);
  const STRIPE_LINK = process.env.REACT_APP_STRIPE_LINK;


  useEffect(() => {
    // Check if videoUrl exists
    if (!videoUrl) {
      alert(
        "Лицо на фотографии не обнаружено, пожалуйста используйте качественное фото!",
      );
      history.push("/second");
      return;
    }

    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.addEventListener("timeupdate", handleTimeUpdate);
    }

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (videoRef.current) {
        videoRef.current.removeEventListener("timeupdate", handleTimeUpdate);
      }
    };
  }, [videoUrl, history]);
  const handleTimeUpdate = () => {
    if (videoRef.current.currentTime >= 3 && !showPopup) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setShowPopup(true);
    }
  };

  const handleProceed = () => {
    if (email1) {
      setEmail(email1);
      localStorage.setItem("userEmail", email1); // store email in localStorage
      window.location.replace(STRIPE_LINK);
    }
  };
  const uploadBoxStyles = {
    ...styles.uploadBox,
    width: windowWidth <= 768 ? "300px" : "450px",
    height: windowWidth <= 768 ? "300px" : "450px",
  };

  return (
    <div style={styles.container}>
        <div style={styles.navbar1}>
      <img src={logo} alt="Logo" style={styles.topLogo} />
      </div>
      <h1 style={styles.title}>Мы уже у цели!</h1>
      <div style={uploadBoxStyles}>
        <video
          id="videoElement"
          style={styles.uploadedImage}
          ref={videoRef}
          muted={true}
          autoPlay
          playsInline
          loop
        >
          <source src={videoUrl || "/assets/vid.mp4"} type="video/mp4" />
          {/* ^^ Use videoUrl if available, fallback to static URL otherwise */}
          Your browser does not support the video tag.
        </video>

        {showPopup && (
          <div style={styles.popup}>
            <div style={styles.priceSection}>
       
            </div>
            <input
              type="email"
              value={email1}
              onChange={(e) => setEmail1(e.target.value)}
              placeholder="Ваша эл. почта"
              style={styles.emailInput}
            />
            <button
              onClick={handleProceed}
              style={styles.button}
              disabled={!email1}
            >
              Хочу полную версию!
            </button>
          </div>
        )}
      </div>

      <div style={styles.backButtonContainer}>
        <button onClick={() => history.push("/second")} style={styles.button}>
          Назад
        </button>
      </div>

      <div style={styles.navbar}>
        <img src={logo} alt="Logo" style={styles.bottomLogo} />
        <a href="mailto:pifpaf.pifpaf.eu@gmail.com" style={styles.mailLink}>
          pifpaf.pifpaf.eu@gmail.com
        </a>
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: '"Amatic SC", Helvetica',
    fontWeight: 700,
    color: "#402750",
    background: "linear-gradient(15deg, #D2B8E3 50%, transparent 50%)",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
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
  uploadBox: {
    border: "8px solid #402750",
    borderRadius: "15px",
    position: "relative",
    overflow: "hidden",
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  backButtonContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: "12px",
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
    fontSize: "2em", // This will make the font size bigger if needed
  },
  popup: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    zIndex: 10,
    height: "295px",
    width: "295px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  priceSection: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
    fontFamily: '"Amatic SC", Helvetica',
    fontWeight: 700,
    color: "#402750",
    fontSize: "2em",
  },
  price: {
    fontSize: "36px",
    marginLeft: "10px",
  },
  crossedPrice: {
    textDecoration: "line-through",
  },
  emailInput: {
    width: "90%",
    padding: "10px",
    marginBottom: "20px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontFamily: '"Amatic SC", Helvetica',
    fontWeight: 700,
    color: "#402750",
    fontSize: "2em",
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

export default ThirdPage;
