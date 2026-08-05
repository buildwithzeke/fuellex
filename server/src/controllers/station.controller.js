import prisma from "../config/db.js";

// Helper function to calculate distance using Haversine formula
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const getStations = async (req, res, next) => {
  try {
    const { search, city, state, brand, isVerified, lat, lng, radius } = req.query;

    // Build filter object
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { state: { contains: search, mode: "insensitive" } },
      ];
    }

    if (city) {
      where.city = { equals: city, mode: "insensitive" };
    }

    if (state) {
      where.state = { equals: state, mode: "insensitive" };
    }

    if (brand) {
      where.brand = { equals: brand, mode: "insensitive" };
    }

    if (isVerified !== undefined && isVerified !== "") {
      where.isVerified = isVerified === "true";
    }

    // Geolocation Bounding Box Optimization (only apply spatial bounding box when no explicit search term is active)
    let latitudeCenter = parseFloat(lat);
    let longitudeCenter = parseFloat(lng);
    let searchRadius = parseFloat(radius) || 10; // Default 10km radius
    const hasCoordinates = !isNaN(latitudeCenter) && !isNaN(longitudeCenter);

    if (hasCoordinates) {
      latitudeCenter = Math.max(-90, Math.min(90, latitudeCenter));
      longitudeCenter = Math.max(-180, Math.min(180, longitudeCenter));

      if (!search) {
        // 1 degree latitude is approx 111km
        const latDelta = searchRadius / 111;
        // 1 degree longitude is approx 111km * cos(latitude)
        const lngDelta = searchRadius / (111 * Math.cos(latitudeCenter * (Math.PI / 180)));

        where.latitude = {
          gte: latitudeCenter - latDelta,
          lte: latitudeCenter + latDelta,
        };
        where.longitude = {
          gte: longitudeCenter - lngDelta,
          lte: longitudeCenter + lngDelta,
        };
      }
    }

    // Fetch stations along with their latest report of each fuel type
    let stations = await prisma.fuelStation.findMany({
      where,
      include: {
        reports: {
          orderBy: { createdAt: "desc" },
          take: 10, // Pull latest 10 reports to calculate prices
        },
      },
    });

    // Calculate distance and sort if lat/lng are provided
    if (hasCoordinates) {
      stations = stations
        .map((station) => {
          const distance = getDistance(
            latitudeCenter,
            longitudeCenter,
            station.latitude,
            station.longitude
          );
          return { ...station, distance };
        })
        .filter((station) => (search ? true : station.distance <= searchRadius))
        .sort((a, b) => a.distance - b.distance);
    }

    res.status(200).json({
      success: true,
      message: "Stations retrieved successfully",
      data: stations,
    });
  } catch (error) {
    next(error);
  }
};

export const getStationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const station = await prisma.fuelStation.findUnique({
      where: { id },
      include: {
        reports: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!station) {
      return res.status(404).json({
        success: false,
        message: "Station not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Station retrieved successfully",
      data: station,
    });
  } catch (error) {
    next(error);
  }
};

export const createStation = async (req, res, next) => {
  try {
    const { name, brand, address, state, city, latitude, longitude } = req.body;

    const station = await prisma.fuelStation.create({
      data: {
        name,
        brand,
        address,
        state,
        city,
        latitude,
        longitude,
        isVerified: false, // Default false, must be updated by Admin
      },
    });

    res.status(201).json({
      success: true,
      message: "Station created successfully",
      data: station,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Prevent non-admin users from changing isVerified
    if (updateData.isVerified !== undefined && req.user.role !== "ADMIN") {
      delete updateData.isVerified;
    }

    const station = await prisma.fuelStation.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      message: "Station updated successfully",
      data: station,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteStation = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Restricted to Admin
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete fuel stations",
      });
    }

    await prisma.fuelStation.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Station deleted successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
