from app.service.police_dataset_service import (
    count_nearby_police,
    get_nearest_police
)

from app.service.hospital_dataset_service import (
    count_nearby_hospitals,
    get_nearest_hospital
)



def get_police_features(lat, lon):

    count = count_nearby_police(
        lat,
        lon
    )

    nearest = get_nearest_police(
        lat,
        lon
    )


    if count >= 3:
        score = 100

    elif count == 2:
        score = 80

    elif count == 1:
        score = 60

    else:
        score = 30



    return {

        "police_score": score,

        "police_station_count": count,

        "nearest_police_distance":
            nearest["distance"]
            if nearest
            else None
    }




def get_hospital_features(lat, lon):

    count = count_nearby_hospitals(
        lat,
        lon
    )


    nearest = get_nearest_hospital(
        lat,
        lon
    )


    if count >= 5:
        score = 100

    elif count >= 3:
        score = 80

    elif count >= 1:
        score = 60

    else:
        score = 30



    return {


        "hospital_score": score,


        "hospital_count": count,


        "nearest_hospital_distance":
            nearest["distance"]
            if nearest
            else None

    }