const express = require('express');
const router = express.Router();
const { sendProductReportNotification, testEmailConnection } = require('../config/email');

// Route test kết nối email
router.get('/test-connection', async (req, res) => {
  try {
    const isConnected = await testEmailConnection();
    if (isConnected) {
      res.status(200).json({ 
        success: true, 
        message: 'Email server connection successful' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Email server connection failed' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error testing email connection', 
      error: error.message 
    });
  }
});

// Route test gửi email
router.post('/test-send', async (req, res) => {
  try {
    const { email, shopName, productName, reason, adminNote } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    const result = await sendProductReportNotification(
      email,
      shopName || 'Test Shop',
      productName || 'Test Product',
      reason || 'spam',
      adminNote || 'Test admin note'
    );

    if (result.success) {
      res.status(200).json({ 
        success: true, 
        message: 'Test email sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send test email',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error sending test email', 
      error: error.message 
    });
  }
});

module.exports = router; 