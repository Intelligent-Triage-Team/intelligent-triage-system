import React, { useState, useRef } from 'react';
import API from '../api/api';
import './ImageAnalysis.css';

const ImageAnalysis = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const fileInputRef = useRef(null);

  // Load analysis history on component mount
  React.useEffect(() => {
    loadAnalysisHistory();
  }, []);

  const loadAnalysisHistory = async () => {
    try {
      const response = await API.get('/image-analysis/history', {
        headers: {
          Authorization: localStorage.getItem("token")
        }
      });
      setHistory(response.data.analyses || []);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, GIF, BMP, or TIFF)');
        return;
      }

      // Validate file size (16MB max)
      if (file.size > 16 * 1024 * 1024) {
        setError('File size must be less than 16MB');
        return;
      }

      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
      setError(null);
      setResult(null);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const response = await API.post('/image-analysis/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: localStorage.getItem("token")
        },
        timeout: 30000
      });

      setResult(response.data.analysis);
      loadAnalysisHistory(); // Refresh history

    } catch (error) {
      console.error('Analysis error:', error);
      setError(error.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getTriageColor = (level) => {
    switch (level) {
      case 'emergency': return 'var(--emergency)';
      case 'urgent': return 'var(--urgent)';
      case 'normal': return 'var(--normal)';
      default: return 'var(--gray-500)';
    }
  };

  const getConfidenceColor = (confidence) => {

    if (confidence >= 80) {
      return 'var(--secondary-color)';
    }
  
    if (confidence >= 60) {
      return 'var(--accent-color)';
    }
  
    return 'var(--emergency)';
  };

  return (
    <div className="image-analysis-container animate-fade-in">
      <div className="container">
        <div className="text-center mb-4">
          <h1>AI Injury Detection</h1>
          <p className="text-muted">Upload an image of your injury for AI-powered analysis</p>
        </div>

        <div className="row">
          {/* Upload Section */}
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h3>Upload Image</h3>
              </div>
              <div className="card-body">
                <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
                  {preview ? (
                    <div className="image-preview">
                      <img src={preview} alt="Preview" />
                      <button 
                        className="btn btn-sm btn-outline remove-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          resetAnalysis();
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <div className="upload-icon">+</div>
                      <p>Click to upload image</p>
                      <small className="text-muted">
                        JPEG, PNG, GIF, BMP, TIFF (max 16MB)
                      </small>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                />

                {error && (
                  <div className="alert alert-danger mt-3">
                    {error}
                  </div>
                )}

                {selectedImage && (
                  <div className="mt-3">
                    <button
                      className="btn btn-primary btn-lg btn-block"
                      onClick={analyzeImage}
                      disabled={analyzing}
                    >
                      {analyzing ? (
                        <>
                          <div className="loading-spinner me-2"></div>
                          Analyzing...
                        </>
                      ) : (
                        'Analyze Injury'
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="col-md-6">
            {result ? (
              <div className="card">
                <div className="card-header">
                  <h3>Analysis Results</h3>
                </div>
                <div className="card-body">
                  <div className="result-summary">
                    <div className="detected-injury">
                      <h4>Detected Injury:</h4>
                      <span className="injury-type">{result.detected_injury}</span>
                    </div>

                    <div className="confidence-meter">
                      <h4>Confidence:</h4>
                      <div className="progress">
                        <div 
                          className="progress-bar"
                          style={{
                            width: `${result.confidence}%`,
                            backgroundColor: getConfidenceColor(result.confidence)
                          }}
                        ></div>
                      </div>
                      <span className="confidence-text">
                      {Number(result.confidence).toFixed(1)}%
                      </span>
                    </div>

                    <div className="triage-level">
                      <h4>Triage Level:</h4>
                      <span 
                        className="badge"
                        style={{ 
                          backgroundColor: getTriageColor(result.triage_level),
                          color: 'white'
                        }}
                      >
                        {result.triage_level.toUpperCase()}
                      </span>
                    </div>

                    <div className="severity-assessment">
                      <h4>Severity Assessment:</h4>
                      <p>{result.severity_assessment}</p>
                    </div>
                  </div>

                  <div className="recommendations">
                    <h4>Medical Recommendations:</h4>
                    <ul>
                      {result.recommendations?.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>

                  {result.medical_guidance?.emergency_indicators && (
                    <div className="alert alert-danger">
                      <strong>EMERGENCY:</strong> This condition requires immediate medical attention!
                    </div>
                  )}

                  <button
                    className="btn btn-outline btn-block mt-3"
                    onClick={resetAnalysis}
                  >
                    Analyze Another Image
                  </button>
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="card-body text-center">
                  <div className="no-results">
                    <div className="no-results-icon">?</div>
                    <h4>No Analysis Yet</h4>
                    <p className="text-muted">
                      Upload an image to get AI-powered injury analysis
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <div className="mt-4">
            <div className="card">
              <div className="card-header">
                <h3>Analysis History</h3>
              </div>
              <div className="card-body">
                <div className="history-list">
                  {history.map((item) => (
                    <div key={item.id} className="history-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="injury-type">{item.detected_injury}</div>
                          <small className="text-muted">
                            {new Date(item.created_at).toLocaleDateString()}
                          </small>
                        </div>
                        <div className="text-end">
                          <span 
                            className="badge me-2"
                            style={{ 
                              backgroundColor: getTriageColor(item.triage_level),
                              color: 'white'
                            }}
                          >
                            {item.triage_level}
                          </span>
                          <div className="confidence-text">
                          {Number(item.confidence).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageAnalysis;
