if __name__ == '__main__':
    recipients = ['recipient1@example.com', 'recipient2@example.com']
    subject = 'Test Email'
    message = 'This is a test email.'
    sender_email = 'sender@example.com'
    smtp_server = 'smtp.example.com'
    port = 587
    success = send_email(recipients, subject, message, sender_email, smtp_server, port)
    print('Email sent successfully:', success)