import React, { useState, useRef, useEffect } from "react";
import { Box, Card, IconButton } from "@mui/material";
import { Mic, MicOff } from "@mui/icons-material";

const App: React.FC = () => {
  const [isMuted, setIsMuted] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    if (!isMuted) {
      startMicProcessing();
    } else {
      stopMicProcessing();
    }
    return () => stopMicProcessing();
  }, [isMuted]);

  const startMicProcessing = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      const audioSource =
        audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      dataArrayRef.current = new Uint8Array(
        analyserRef.current.frequencyBinCount
      );
      audioSource.connect(analyserRef.current);
      processAudio();
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopMicProcessing = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    dataArrayRef.current = null;
  };

  const processAudio = () => {
    if (!analyserRef.current || !dataArrayRef.current) return;
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);

    const avgAmplitude =
      dataArrayRef.current.reduce((a, b) => a + b, 0) /
      dataArrayRef.current.length;

    console.log("Mic Input Amplitude:", avgAmplitude);

    if (avgAmplitude > 60) {
      setIsSpeaking(true);
    } else {
      setIsSpeaking(false);
    }

    requestAnimationFrame(processAudio);
  };
  return (
    <Box width="100vw">
      <Card
        sx={{
          width: "30vw",
          height: "44vh",
          position: "relative",
          left: "35%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: "250px",
            height: "250px",
            borderRadius: "100%",
            overflow: "hidden",
            border: isSpeaking ? "8px solid transparent" : "none",
            animation: isSpeaking ? "pulse 1.8s infinite ease-in-out" : "none",
            "@keyframes pulse": {
              "0%": {
                borderColor: "rgba(243, 245, 39, 0.67)",
              },
              "50%": {
                borderColor: "rgba(220, 130, 0, 0.87)",
              },
              "100%": {
                borderColor: "rgba(243, 245, 39, 0.67)",
              },
            },
          }}
        >
          <img
            src="../public/9434619.jpg"
            alt=""
            width="100%"
            style={{ borderRadius: "100%" }}
          />
          <IconButton
            onClick={() => setIsMuted((prev) => !prev)}
            sx={{
              position: "absolute",
              bottom: "5vh",
              right: "8vw",
              color: "black",
              backgroundColor: "white",
            }}
          >
            {isMuted ? <MicOff fontSize="large" /> : <Mic fontSize="large" />}
          </IconButton>
        </Box>
      </Card>
    </Box>
  );
};

export default App;
