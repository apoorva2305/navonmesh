from pathlib import Path

try:
    import rasterio
except Exception:
    rasterio = None

TIFF_FILE = r"app/datasets/CG_VIIRS_2025.2.tif"

src = None
if rasterio is not None:
    dataset_path = Path(__file__).resolve().parents[1] / "datasets" / "CG_VIIRS_2025.2.tif"
    if dataset_path.exists():
        src = rasterio.open(dataset_path)

# Dataset range
MIN_LIGHT = 0.0
MAX_LIGHT = 169.59734


def get_streetlight_score(lat: float, lon: float):
    """
    Returns raw light intensity at one location.
    """

    try:
        if src is None:
            return 50.0

        row, col = src.index(lon, lat)
        value = src.read(1)[row, col]

        return float(value)

    except Exception:
        return 0.0


def get_route_streetlight_score(route_points):
    """
    Calculates average street-light score
    for the entire route.
    """

    total = 0.0
    count = 0

    for lat, lon in route_points:

        score = get_streetlight_score(lat, lon)

        total += score
        count += 1

    if count == 0:
        return 0.0

    average_light = total / count

    normalized_score = (
        (average_light - MIN_LIGHT)
        / (MAX_LIGHT - MIN_LIGHT)
    ) * 100

    normalized_score = max(
        0.0,
        min(normalized_score, 100.0)
    )

    return round(normalized_score, 2)