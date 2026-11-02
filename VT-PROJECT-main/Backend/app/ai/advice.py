def generate_advice(safety_score, lighting_score):

    advice = []

    if lighting_score < 40:
        advice.append("Poor lighting detected. Prefer well-lit roads.")

    if safety_score >= 80:
        advice.append("This route is considered relatively safe.")

    elif safety_score >= 50:
        advice.append("Use caution while traveling on this route.")

    else:
        advice.append("Avoid this route if possible.")

    advice.append("Share your live location with a trusted contact.")
    advice.append("Keep emergency contacts easily accessible.")

    return advice