import smtplib
from email.mime.text import MIMEText


def send_email(recipients, subject, message, sender_email, smtp_server, port):
    try:
        # Create the email
        msg = MIMEText(message)
        msg['Subject'] = subject
        msg['From'] = sender_email
        msg['To'] = ', '.join(recipients)

        # Connect to the SMTP server
        with smtplib.SMTP(smtp_server, port) as server:
            server.starttls()  # Upgrade to secure connection if possible
            server.login(sender_email, 'your_password')  # Replace with actual sender's password
            server.sendmail(sender_email, recipients, msg.as_string())
        return True
    except Exception as e:
        print(f'An error occurred: {e}')  # Log the error for troubleshooting
        return False