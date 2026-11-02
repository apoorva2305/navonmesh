import polyline


def sample_route_points(encoded_geometry, sample_every=20):
    """
    Decode the route and return sampled points.
    """

    points = polyline.decode(encoded_geometry)

    if len(points) <= sample_every:
        return points

    sampled = points[::sample_every]

    # Ensure destination is included
    if sampled[-1] != points[-1]:
        sampled.append(points[-1])

    return sampled