import bcrypt from "bcrypt";
import prisma from "../src/config/db.js";

const stations = [
  {
    name: "Mobil — Lekki Phase 1",
    brand: "Mobil",
    address: "Lekki–Epe Expressway, Lekki",
    state: "Lagos",
    city: "Lekki",
    latitude: 6.4478,
    longitude: 3.4723,
    reports: [
      { fuelType: "PMS", price: 915, available: true },
      { fuelType: "AGO", price: 1210, available: true },
    ],
  },
  {
    name: "Total — Victoria Island",
    brand: "TotalEnergies",
    address: "Adetokunbo Ademola Street, Victoria Island",
    state: "Lagos",
    city: "Victoria Island",
    latitude: 6.4281,
    longitude: 3.4219,
    reports: [
      { fuelType: "PMS", price: 925, available: true },
      { fuelType: "LPG", price: 750, available: true },
    ],
  },
  {
    name: "NNPC — Ajah Roundabout",
    brand: "NNPC",
    address: "Ajah Roundabout, Ajah",
    state: "Lagos",
    city: "Ajah",
    latitude: 6.4667,
    longitude: 3.5933,
    reports: [
      { fuelType: "PMS", price: 890, available: false },
      { fuelType: "DPK", price: 1105, available: true },
    ],
  },
  {
    name: "Oando — Gbagada",
    brand: "Oando",
    address: "Gbagada Expressway, Gbagada",
    state: "Lagos",
    city: "Gbagada",
    latitude: 6.5549,
    longitude: 3.392,
    reports: [
      { fuelType: "PMS", price: 935, available: true },
      { fuelType: "AGO", price: 1225, available: true },
    ],
  },
  {
    name: "Conoil — Ikeja",
    brand: "Conoil",
    address: "Obafemi Awolowo Way, Ikeja",
    state: "Lagos",
    city: "Ikeja",
    latitude: 6.5965,
    longitude: 3.3423,
    reports: [
      { fuelType: "PMS", price: 905, available: true },
      { fuelType: "LPG", price: 735, available: true },
    ],
  },
  {
    name: "Eterna — Yaba",
    brand: "Eterna",
    address: "Herbert Macaulay Way, Yaba",
    state: "Lagos",
    city: "Yaba",
    latitude: 6.508,
    longitude: 3.383,
    reports: [
      { fuelType: "PMS", price: 960, available: true },
      { fuelType: "DPK", price: 1120, available: false },
    ],
  },
];

const run = async () => {
  const password = await bcrypt.hash("Admin@1234", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@fuellex.app" },
    update: {},
    create: {
      name: "FuelLex Admin",
      email: "admin@fuellex.app",
      password,
      role: "ADMIN",
    },
  });

  for (const s of stations) {
    let station = await prisma.fuelStation.findFirst({
      where: { name: s.name },
    });

    if (!station) {
      station = await prisma.fuelStation.create({
        data: {
          name: s.name,
          brand: s.brand,
          address: s.address,
          state: s.state,
          city: s.city,
          latitude: s.latitude,
          longitude: s.longitude,
          isVerified: true,
        },
      });
    }

    for (const r of s.reports) {
      await prisma.fuelReport.create({
        data: {
          stationId: station.id,
          userId: admin.id,
          fuelType: r.fuelType,
          price: r.price,
          available: r.available,
        },
      });
    }
  }

  console.log(`Admin seeded: admin@fuellex.app (password: Admin@1234)`);
  console.log(`Seeded ${stations.length} stations with fuel reports.`);
};

run()
  .catch((error) => {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
