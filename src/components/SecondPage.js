import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "@fontsource/amatic-sc/700.css";
import logo from "./logo3.png";
import ClipLoader from "react-spinners/ClipLoader";
const IMGUR_UPLOAD_URL = "https://api.imgur.com/3/image";
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID; 

const SecondPage = ({ history }) => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [imgurUrl, setImgurUrl] = useState(null);
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
  const uploadToImgur = async (dataUrl) => {
    if (typeof dataUrl !== "string") {
      console.error(
        "Expected dataUrl to be a string, received:",
        typeof dataUrl,
      );
      alert("There was an issue with the image. Please try again.");
      return null;
    }
    const base64data = dataUrl.split(",")[1]; // Strip off the DataURL prefix
    const formData = new FormData();
    formData.append("image", base64data);

    try {
      const response = await axios.post(IMGUR_UPLOAD_URL, formData, {
        headers: {
          Authorization: `Client-ID ${CLIENT_ID}`,
        },
      });

      setImgurUrl(response.data.data.link);

      return response.data.data.link; // Returns the direct link to the uploaded image
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert("Failed to upload image to Imgur. Please try again.");
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
              setTimeout(checkStatus, 9000);
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
      const uploadedImgurUrl = await uploadToImgur(imageToUpload);

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
  const uploadBoxStyles = {
    ...styles.uploadBox,
    width: windowWidth <= 768 ? "310px" : "500px",
    height: windowWidth <= 768 ? "310px" : "500px",
  };

  return (
    <div style={styles.container}>
      <img src={logo} alt="Logo" style={styles.topLogo} />
      <h2 style={styles.title}>Пожалуйста используйте качественное фото</h2>
      {loading ? (
        <ClipLoader color={"#123abc"} loading={true} size={50} />
      ) : (
        <div style={uploadBoxStyles}>
          {image ? (
            <img
              src={image}
              alt="Uploaded Preview"
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

              <label htmlFor="fileInput" style={{ ...styles.uploadLabel }}>
                Загрузить
              </label>
              <div style={{ margin: "50px 0" }}></div>
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
            </div>
          )}
        </div>
      )}
      {image && (
        <div style={styles.buttonGroup}>
          <button
            onClick={() => handleUploadAndConfirm(image)}
            style={styles.button}
            disabled={loading}
          >
            Подтвердить
          </button>

          <button
            onClick={handleRetake}
            style={styles.button}
            disabled={loading}
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
        >
          Назад
        </button>
      </div>
      <div style={styles.navbar}>
        <img src={logo} alt="Logo" style={styles.bottomLogo} />
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
  uploadBox: {
    border: "5px solid #402750",
    borderRadius: "15px",
    width: "500px", // Desktop size
    height: "500px", // Desktop size
    margin: "20px auto",
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
    padding: "20px 40px",
    margin: "5px",
    marginTop: "20px",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginTop: "20px",
  },
  backButtonContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: "20px",
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

export default SecondPage;
