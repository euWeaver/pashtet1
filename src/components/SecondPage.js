import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "@fontsource/amatic-sc/700.css";
import logo from "./logo3.png";
import ClipLoader from "react-spinners/ClipLoader";
import Webcam from "react-webcam";
const IMGUR_UPLOAD_URL = "https://api.imgur.com/3/image";
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID; 
const FILESTACK_API_KEY = process.env.REACT_APP_FILESTACK_API_KEY;
const FILESTACK_UPLOAD_URL = `https://www.filestackapi.com/api/store/S3?key=${FILESTACK_API_KEY}`;
import ReactGA from "react-ga";
const SecondPage = ({ history }) => {
    ReactGA.pageview(window.location.pathname + window.location.search);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [imgurUrl, setImgurUrl] = useState(null);
 const [loadingMessage, setLoadingMessage] = useState("");
  const [cameraMode, setCameraMode] = useState(false);
  const webcamRef = React.useRef(null);
    const [hasWebcam, setHasWebcam] = useState(true);
    const handleCapture = () => {
    const screenshot = webcamRef.current.getScreenshot();
    setImage(screenshot);
    setCameraMode(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setImage(reader.result);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

    useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        stream.getTracks().forEach((track) => track.stop());
        setHasWebcam(true);
      })
      .catch((error) => {
        console.log("No webcam detected:", error);
        setHasWebcam(false);
      });
  }, []);
  const uploadToFilestack = async (dataUrl) => {
    if (typeof dataUrl !== "string") {
      console.error(
        "Expected dataUrl to be a string, received:",
        typeof dataUrl,
      );
      alert("There was an issue with the image. Please try again.");
      return null;
    }

    const base64data = dataUrl.split(",")[1]; // Strip off the DataURL prefix
    const blob = new Blob(
      [
        new Uint8Array(
          atob(base64data)
            .split("")
            .map((char) => char.charCodeAt(0)),
        ),
      ],
      { type: "image/png" },
    );

    try {
      const response = await axios.post(FILESTACK_UPLOAD_URL, blob, {
        headers: {
          "Content-Type": "image/png",
        },
        params: {
          key: FILESTACK_API_KEY,
        },
      });

      // Assuming the direct link to the uploaded image is in the `url` property
      // of the response object (you might need to adjust this based on the
      // actual response from Filestack)
      setImgurUrl(response.data.url);
      return response.data.url;
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert("Failed to upload image. Please try again.");
      return null;
    }
  };
  const handleRetake = () => {
    setImage(null);
  };
  let shouldContinuePolling = useRef(true);
  const confirmImage = async (imgurUrl) => {
    setLoading(true);
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL + "/predict";
      const STATUS_CHECK_URL = process.env.REACT_APP_STATUS_CHECK_URL;

      const requestBody = {
        imageUrl: imgurUrl,
      };

      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const responseData = await response.json();
        const predictionId = responseData.predictionId;

        // Polling server to get the video URL
        let attemptCount = 0;
        const MAX_ATTEMPTS = parseInt(process.env.REACT_APP_MAX_ATTEMPTS);

        const checkStatus = async () => {
          if (attemptCount >= MAX_ATTEMPTS || !shouldContinuePolling.current) {
            console.error(
              "Max attempts reached or polling stopped. Stopping status checks.",
            );
            return;
          }
    switch (attemptCount) {
        case 0:
            setLoadingMessage("Идет загрузка фотографии!");
            break;
        case 1:
            setLoadingMessage("Идет загрузка фотографии!");
            break;
         case 2:
            setLoadingMessage("Идет загрузка фотографии!");
            break;
        case 3:
            setLoadingMessage("Ваше видео обрабатывается!");
            break;
        case 4:
            setLoadingMessage("Ваше видео обрабатывается!");
            break;
        case 5:
            setLoadingMessage("Ваше видео обрабатывается!");
            break;
          case 6:
            setLoadingMessage("Ваше видео обрабатывается!");
            break;
        case 7:
            setLoadingMessage("Почти готово!");
            break;
        case 8:
            setLoadingMessage("Почти готово!");
            break;
        case 9:
            setLoadingMessage("Почти готово!");
            break;
        default:
            setLoadingMessage("Не покидайте страницу!");
            break;
    }
          const statusResponse = await fetch(STATUS_CHECK_URL + predictionId);
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();

            if (statusData.videoUrl.status === "succeeded") {
              shouldContinuePolling.current = false;
              setLoading(false);
              localStorage.setItem("vidUrl", statusData.videoUrl.videoUrl); // <-- Add this line
              history.push("/third", {
                videoUrl: statusData.videoUrl.videoUrl,
              }); // Stop further polling
            } else if (statusData.videoUrl.status === "failed") {
              console.error("Prediction failed:", statusData.videoUrl.error);
              shouldContinuePolling.current = false;
              setIsLoading(false); // Stop further polling
            } else {
              attemptCount++;
              setTimeout(checkStatus, 5000);
              // Check every 15 seconds (noticed you changed this from 5s to 15s)
            }
          } else {
            console.error("Error fetching status:", statusResponse.statusText);
            setIsLoading(false);
          }
        };

        checkStatus();
      } else {
        console.error(
          "Failed to get a successful response:",
          response.status,
          response.statusText,
        );
      }
    } catch (error) {
      console.error("Error sending request to backend:", error.message);
    }
  };
  async function handleUploadAndConfirm(imageToUpload) {
    setLoading(true);
    try {
      const uploadedImgurUrl = await uploadToFilestack(imageToUpload);

      if (!uploadedImgurUrl) {
        console.error("Failed to fetch imgurUrl or it's null/undefined");
        return;
      }

      await confirmImage(uploadedImgurUrl);
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
   const webcamSize = windowWidth <= 768 ? 300 : 450;
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
      <h2 style={styles.title}>
        {loading ? loadingMessage : "Пожалуйста используйте качественное фото"}
      </h2>
      {loading ? (
        <ClipLoader color={"#402750"} loading={true} size={90} />
      ) : (
               <div style={uploadBoxStyles}>
          {image ? (
            <img
              src={image}
              alt="Captured Preview"
              style={styles.uploadedImage}
            />
          ) : cameraMode && windowWidth > 768 ? (
            <Webcam
              audio={false}
              height={webcamSize}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={webcamSize}
              videoConstraints={{
                width: webcamSize,
                height: webcamSize,
                facingMode: "user",
              }}
              style={styles.uploadedImage}
            />
          ) : (
            <div style={styles.uploadInstructions}>
              <input
                type="file"
                id="fileInput"
                accept="image/*"
                onChange={handleImageChange}
                style={styles.hiddenInput}
              />

              <label htmlFor="fileInput" style={styles.uploadLabel}>
                Загрузить
              </label>

              {/* Check if it's mobile (windowWidth <= 768) */}
              {windowWidth <= 768 ? (
                <>
                  <input
                    type="file"
                    id="cameraInput"
                    accept="image/*"
                    capture="user"
                    onChange={handleImageChange}
                    style={styles.hiddenInput}
                  />
                  <label htmlFor="cameraInput" style={styles.uploadLabel}>
                    Сделать фото
                  </label>
                </>
              ) : hasWebcam ? (
                <button
                  onClick={() => setCameraMode(true)}
                  style={styles.uploadLabel}
                >
                  Сделать фото
                </button>
              ) : (
                <label htmlFor="fileInput" style={styles.uploadLabel}>
                  Сделать фото
                </label>
              )}
            </div>
          )}
        </div>
      )}
      {cameraMode && (
        <div style={styles.buttonGroup}>
          <button onClick={handleCapture} style={styles.button}>
            Сделать фото
          </button>
        </div>
      )}
      {(image) && (
        <div style={styles.buttonGroup}>
          <button
            onClick={() => handleUploadAndConfirm(image)}
            style={styles.button}
            disabled={loading}
              hidden={loading}
          >
            Подтвердить
          </button>

          <button
            onClick={handleRetake}
            style={styles.button}
            disabled={loading}
              hidden={loading}
          >
            Переснять
          </button>
        </div>
      )}
      <div style={styles.backButtonContainer}>
        <button
          onClick={() => history.push("/")}
          style={styles.button}
          disabled={loading}
            hidden={loading}
        >
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
    marginBottom: "20px",
  },
  uploadBox: {
    border: "8px solid #402750",
    borderRadius: "15px",
    width: "450px", // Desktop size
    height: "450px", // Desktop size
   
    cursor: "pointer",
    overflow: "hidden", // This ensures the video doesn't spill outside the container
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  uploadInstructions: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    display: "flex",
    flexDirection: "column", // This will stack the buttons vertically
    alignItems: "center", // Center align the buttons
  },
  hiddenInput: {
    display: "none",
  },
  uploadLabel: {
    cursor: "pointer",
    backgroundColor: "#4bb150",
    fontFamily: '"Amatic SC", Helvetica',
    fontWeight: 700,
    color: "white",
    borderRadius: "20px",
    padding: "15px 30px",
    margin: "5px",
    marginTop: "20px",
    fontSize: "1.5em",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginTop: "12px",
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

export default SecondPage;
