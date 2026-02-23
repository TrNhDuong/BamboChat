const axios = require('axios');

/**
 * Send email using Brevo API
 * @param {string|string[]} to - Recipient email(s)
 * @param {string} subject - Email subject
 * @param {string} htmlContent - Email HTML content
 */
async function sendMail(to, subject, htmlContent) {
    // 🔥 Chuẩn hoá to thành array
    const toArray = Array.isArray(to)
        ? to
        : typeof to === 'string'
            ? to.split(',').map(e => e.trim())
            : [];

    if (toArray.length === 0) {
        throw new Error("Invalid recipient email(s)");
    }

    const emailData = {
        sender: {
            name: "BamboChat",
            email: "nhatduong01012005@gmail.com",
        },
        to: toArray.map(email => ({ email })),
        subject,
        htmlContent,
    };

    try {
        const response = await axios.post(
            process.env.BREVO_URL || 'https://api.brevo.com/v3/smtp/email',
            emailData,
            {
                headers: {
                    "Content-Type": "application/json",
                    "api-key": process.env.BREVO_API_KEY,
                },
            }
        );

        console.log("✅ Email sent:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Brevo error:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
}

module.exports = { sendMail };
