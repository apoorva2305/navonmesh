import rasterio

file = r"app/datasets/UP_VIIRS_2025.tif"

lat = 26.8467
lon = 80.9462

with rasterio.open(file) as src:
    row, col = src.index(lon, lat)
    value = src.read(1)[row, col]

    print("Row:", row)
    print("Column:", col)
    print("Light Value:", value)