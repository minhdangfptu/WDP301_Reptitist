const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

// Load environment variables
dotenv.config();

console.log('=== EMAIL DEBUG SCRIPT ===\n');

// Check environment variables
console.log('1. Environment Variables:');
console.log(`   EMAIL_USER: ${process.env.EMAIL_USER || 'NOT SET'}`);
console.log(`   EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? 'SET (length: ' + process.env.EMAIL_PASSWORD.length + ')' : 'NOT SET'}`);
console.log('');

// Create transporter with detailed logging
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'reptitist.service@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  },
  debug: true, // Enable debug logging
  logger: true, // Log to console
  tls: {
    rejectUnauthorized: false
  }
});

// Test connection with detailed error handling
async function testConnection() {
  console.log('2. Testing email connection...');
  try {
    console.log('   Attempting to verify connection...');
    await transporter.verify();
    console.log('   ✅ Email server connection successful!');
    return true;
  } catch (error) {
    console.log('   ❌ Email server connection failed!');
    console.log('   Error details:');
    console.log(`   - Code: ${error.code}`);
    console.log(`   - Command: ${error.command}`);
    console.log(`   - Response: ${error.response}`);
    console.log(`   - ResponseCode: ${error.responseCode}`);
    console.log(`   - Message: ${error.message}`);
    
    // Provide specific troubleshooting advice
    if (error.code === 'EAUTH') {
      console.log('\n   🔧 AUTHENTICATION ERROR - Troubleshooting:');
      console.log('   1. Check if 2-Factor Authentication is enabled on Gmail');
      console.log('   2. Verify App Password is correct (16 characters)');
      console.log('   3. Make sure App Password is for "Mail" service');
      console.log('   4. Try generating a new App Password');
    } else if (error.code === 'ECONNECTION') {
      console.log('\n   🔧 CONNECTION ERROR - Troubleshooting:');
      console.log('   1. Check internet connection');
      console.log('   2. Check if port 587/465 is blocked by firewall');
      console.log('   3. Try using VPN if in restricted network');
    }
    
    return false;
  }
}

// Test sending email
async function testSendingEmail() {
  console.log('\n3. Testing email sending...');
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'reptitist.service@gmail.com',
      to: 'test@example.com',
      subject: 'Test Email from Reptitist',
      text: 'This is a test email to verify email configuration.',
      html: '<h1>Test Email</h1><p>This is a test email to verify email configuration.</p>'
    };

    console.log('   Attempting to send test email...');
    const result = await transporter.sendMail(mailOptions);
    console.log('   ✅ Email sent successfully!');
    console.log(`   Message ID: ${result.messageId}`);
    return true;
  } catch (error) {
    console.log('   ❌ Failed to send email!');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

// Main debug function
async function runDebug() {
  console.log('Starting email debug...\n');
  
  const connectionTest = await testConnection();
  
  if (connectionTest) {
    await testSendingEmail();
  }
  
  console.log('\n=== DEBUG SUMMARY ===');
  if (connectionTest) {
    console.log('✅ Email configuration is working correctly!');
  } else {
    console.log('❌ Email configuration needs to be fixed.');
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Go to https://myaccount.google.com/apppasswords');
    console.log('2. Make sure 2-Factor Authentication is enabled');
    console.log('3. Generate a new App Password for "Mail"');
    console.log('4. Update EMAIL_PASSWORD in .env file');
    console.log('5. Restart the server');
  }
}

// Run debug
runDebug().catch(console.error); 