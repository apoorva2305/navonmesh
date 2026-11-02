from datetime import datetime


def get_time_score():
    """
    Returns a safety score based on the current hour.
    """

    current_hour = datetime.now().hour

    if 6 <= current_hour < 18:
        return 95

    elif 18 <= current_hour < 21:
        return 80

    elif 21 <= current_hour < 24:
        return 55

    else:
        return 30