import prisma from "../config/db.js";

export const getReports = async (req, res, next) => {
  try {
    const { fuelType, available } = req.query;

    const where = {};
    if (fuelType) {
      where.fuelType = fuelType;
    }
    if (available !== undefined && available !== "") {
      where.available = available === "true";
    }

    const reports = await prisma.fuelReport.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        station: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Reports retrieved successfully",
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

export const createReport = async (req, res, next) => {
  try {
    const { stationId, fuelType, price, available } = req.body;
    const userId = req.user.id;

    // Check if station exists
    const station = await prisma.fuelStation.findUnique({
      where: { id: stationId },
    });

    if (!station) {
      return res.status(404).json({
        success: false,
        message: "Station not found",
      });
    }

    // Create the fuel report
    const report = await prisma.fuelReport.create({
      data: {
        stationId,
        userId,
        fuelType,
        price,
        available: available !== undefined ? available : true,
      },
      include: {
        station: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Report created successfully",
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

export const getReportsByStation = async (req, res, next) => {
  try {
    const { stationId } = req.params;

    // Check if station exists
    const station = await prisma.fuelStation.findUnique({
      where: { id: stationId },
    });

    if (!station) {
      return res.status(404).json({
        success: false,
        message: "Station not found",
      });
    }

    const reports = await prisma.fuelReport.findMany({
      where: { stationId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Station reports retrieved successfully",
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};
