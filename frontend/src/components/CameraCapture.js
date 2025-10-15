import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Check } from 'lucide-react';

const CameraCapture = ({ onCapture, onClose }) => {
  const [mode, setMode] = useState('select'); // select, camera, preview
  const [capturedImage, setCapturedImage] = useState(null);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Cleanup stream on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setMode('camera');
    } catch (error) {
      console.error('Camera access error:', error);
      alert('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageData);
      stopCamera();
      setMode('preview');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result);
        setMode('preview');
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmCapture = () => {
    if (capturedImage) {
      // Remove data URL prefix
      const base64 = capturedImage.split(',')[1];
      onCapture(base64);
      onClose();
    }
  };

  const retake = () => {
    setCapturedImage(null);
    setMode('select');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Capture Meal</h3>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {mode === 'select' && (
            <div className="space-y-4">
              <button
                onClick={startCamera}
                className="w-full flex items-center justify-center gap-3 p-6 bg-black text-white rounded-xl hover:bg-gray-800 transition"
              >
                <Camera className="w-6 h-6" />
                <span className="text-lg font-medium">Take Photo</span>
              </button>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="w-full flex items-center justify-center gap-3 p-6 border-2 border-gray-300 rounded-xl hover:border-gray-400 cursor-pointer transition"
                >
                  <Upload className="w-6 h-6 text-gray-700" />
                  <span className="text-lg font-medium text-gray-700">Upload Photo</span>
                </label>
              </div>
            </div>
          )}

          {mode === 'camera' && (
            <div className="space-y-4">
              <div className="relative bg-black rounded-xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                  style={{ display: 'block' }}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    stopCamera();
                    setMode('select');
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={capturePhoto}
                  className="flex-1 px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition"
                >
                  Capture
                </button>
              </div>
            </div>
          )}

          {mode === 'preview' && capturedImage && (
            <div className="space-y-4">
              <div className="relative bg-gray-100 rounded-xl overflow-hidden">
                <img src={capturedImage} alt="Captured meal" className="w-full h-auto" />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={retake}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition"
                >
                  Retake
                </button>
                <button
                  onClick={confirmCapture}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition"
                >
                  <Check className="w-5 h-5" />
                  Use Photo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default CameraCapture;
