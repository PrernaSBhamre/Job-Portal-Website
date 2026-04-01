const mockSMS = (phoneNumber, otp) => {
    console.log(`
    ========================================
    [MOCK SMS GATEWAY]
    To: ${phoneNumber}
    Message: Your Tools and Job verification code is: ${otp}. 
    It expires in 10 minutes.
    ========================================
    `);
};

module.exports = mockSMS;
