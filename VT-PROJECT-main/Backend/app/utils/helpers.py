from datetime import datetime


# -----------------------------
# Current Timestamp
# -----------------------------
def get_current_timestamp():
    return datetime.now()


# -----------------------------
# Format GPS Coordinates
# -----------------------------
def format_location(latitude: float, longitude: float):
    return f"{latitude:.6f}, {longitude:.6f}"


# -----------------------------
# Notification Placeholder
# -----------------------------
def send_notification(recipient: str, message: str):
    print(f"[NOTIFICATION]")
    print(f"Recipient : {recipient}")
    print(f"Message   : {message}")
    return True


# -----------------------------
# Event Logger
# -----------------------------
def log_event(event: str):
    print(f"[{datetime.now()}] {event}")


# -----------------------------
# Success Response
# -----------------------------
def success_response(message: str, data=None):
    return {
        "success": True,
        "message": message,
        "data": data
    }


# -----------------------------
# Error Response
# -----------------------------
def error_response(message: str):
    return {
        "success": False,
        "message": message
    }