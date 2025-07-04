import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/LandingPage.css';
import { BookCheck, MessageCircleHeart } from 'lucide-react';

function SupportButton() {
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="floating-help-container">
      {!showHelpDialog && (
        <div
          className="help-bubble"
          onMouseEnter={() => setShowHelpDialog(true)}
        >
          ?
        </div>
      )}
      <div
        className={`help-dialog${showHelpDialog ? ' show' : ''}`}
        onMouseLeave={() => setShowHelpDialog(false)}
        onMouseEnter={() => setShowHelpDialog(true)}
      >
        <button
          className="help-dialog-btn"
          onClick={() => navigate('/ContactUs')}
        >
            <MessageCircleHeart /> {" "}
          Liên hệ với chúng tôi
        </button>
        <button
          className="help-dialog-btn"
          onClick={() => navigate('/user-manual')}
        >
            <BookCheck /> {" "}
          Hướng dẫn sử dụng
        </button>
      </div>
    </div>
  );
}

export default SupportButton; 