import os
from send_email import send_email

def test_send_email():
    """
    Test the send_email_v1 action with dummy data.
    """
    # Dummy SMTP configuration
    smtp_config = {
        "recipient": "dummy-recipient@example.com",
        "subject": "Test Email",
        "body": "<h1>This is a test email</h1><p>Sent from the send_email_v1 action.</p>",
        "sender": "dummy-sender@example.com",
        "smtp_server": "smtp.dummyserver.com",
        "smtp_port": 587,
        "smtp_username": "dummy-sender@example.com",
        "smtp_password": "dummy-password"
    }

    print("Starting test for send_email_v1...")

    try:
        # Run the send_email function with dummy data
        status, message = send_email(
            recipient=smtp_config["recipient"],
            subject=smtp_config["subject"],
            body=smtp_config["body"],
            sender=smtp_config["sender"],
            smtp_server=smtp_config["smtp_server"],
            smtp_port=smtp_config["smtp_port"],
            smtp_username=smtp_config["smtp_username"],
            smtp_password=smtp_config["smtp_password"]
        )

        # Assert expected behavior
        assert status == "failure", "Expected failure with dummy data but got success."
        print(f"Test passed. Received message: {message}")

    except Exception as e:
        print(f"Test failed with error: {e}")

if __name__ == "__main__":
    test_send_email()
