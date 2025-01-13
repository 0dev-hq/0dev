import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def send_email(recipient: str, subject: str, body: str,  smtp_server: str, smtp_port: int, smtp_username: str, smtp_password: str) -> dict:
    """
    Send an email using the provided SMTP server details.

    :param recipient: Email address of the recipient.
    :param subject: Subject of the email.
    :param body: Body of the email.
    :param sender: Email address of the sender.
    :param smtp_server: SMTP server address.
    :param smtp_port: SMTP server port.
    :param smtp_username: SMTP username for authentication.
    :param smtp_password: SMTP password for authentication.
    :return: A dictionary with the status of the email.
    """
    try:
        # Create the email message
        message = MIMEMultipart()
        message["From"] = sender
        message["To"] = recipient
        message["Subject"] = subject
        message.attach(MIMEText(body, "plain"))

        # Connect to the SMTP server and send the email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()  # Upgrade the connection to secure
            server.login(smtp_username, smtp_password)
            server.sendmail(sender, recipient, message.as_string())

        return {"status": "success", "message": "Email sent successfully."}

    except Exception as e:
        return {"status": "failure", "error": str(e)}
