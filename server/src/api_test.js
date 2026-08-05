import assert from "assert";
import bcrypt from "bcrypt";
import prisma from "./config/db.js";

const BASE_URL = "http://localhost:7000";

const test = async () => {
  console.log("Starting backend integration tests...");
  let userToken = "";
  let adminToken = "";
  let stationId = "";
  let reportId = "";
  let adminUserId = "";

  const uniqueId = Date.now();
  const userEmail = `user_${uniqueId}@test.com`;
  const adminEmail = `admin_${uniqueId}@test.com`;

  try {
    // 1. Root route check
    console.log("\n1. Testing Root Route...");
    const rootRes = await fetch(`${BASE_URL}/`);
    const rootData = await rootRes.json();
    console.log("Root Response:", rootData);
    assert.strictEqual(rootRes.status, 200);
    assert.strictEqual(rootData.success, true);

    // 2. Register USER
    console.log("\n2. Testing User Registration...");
    const regUserRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        email: userEmail,
        password: "password123"
      })
    });
    const regUserData = await regUserRes.json();
    console.log("Register User Response:", regUserData);
    assert.strictEqual(regUserRes.status, 201);
    assert.strictEqual(regUserData.success, true);

    // 3. Bootstrap ADMIN directly via Prisma (public register is locked to USER)
    console.log("\n3. Bootstrapping Admin via Prisma...");
    const adminHash = await bcrypt.hash("password123", 10);
    const adminUser = await prisma.user.create({
      data: {
        name: "Test Admin",
        email: adminEmail,
        password: adminHash,
        role: "ADMIN",
      },
    });
    console.log("Admin created:", adminUser.email);
    assert.ok(adminUser.id);

    // 3b. Attempt self-registration as ADMIN via the public API (should be rejected)
    console.log("\n3b. Testing Admin Self-Registration Block...");
    const roleSneakRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Role Sneak",
        email: `sneak_${uniqueId}@test.com`,
        password: "password123",
        role: "ADMIN"
      })
    });
    const roleSneakData = await roleSneakRes.json();
    console.log("Role sneak response:", roleSneakData);
    assert.strictEqual(roleSneakRes.status, 400);
    assert.strictEqual(roleSneakData.success, false);

    // 4. Login USER
    console.log("\n4. Testing User Login...");
    const loginUserRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: userEmail,
        password: "password123"
      })
    });
    const loginUserData = await loginUserRes.json();
    console.log("Login User Response:", loginUserData);
    assert.strictEqual(loginUserRes.status, 200);
    userToken = loginUserData.data.token;
    assert.ok(userToken);

    // 5. Login ADMIN
    console.log("\n5. Testing Admin Login...");
    const loginAdminRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: adminEmail,
        password: "password123"
      })
    });
    const loginAdminData = await loginAdminRes.json();
    console.log("Login Admin Response:", loginAdminData);
    assert.strictEqual(loginAdminRes.status, 200);
    adminToken = loginAdminData.data.token;
    assert.ok(adminToken);

    // 6. Get Profile
    console.log("\n6. Testing User Profile...");
    const profileRes = await fetch(`${BASE_URL}/api/auth/profile`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${userToken}`
      }
    });
    const profileData = await profileRes.json();
    console.log("Profile Response:", profileData);
    assert.strictEqual(profileRes.status, 200);
    assert.strictEqual(profileData.data.email, userEmail);

    // 7. Create Station as USER
    console.log("\n7. Testing Station Creation...");
    const createStationRes = await fetch(`${BASE_URL}/api/stations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${userToken}`
      },
      body: JSON.stringify({
        name: "Zeke Oando",
        brand: "Oando",
        address: "10 Herbert Macaulay Way",
        state: "Lagos",
        city: "Yaba",
        latitude: 6.5095,
        longitude: 3.3711
      })
    });
    const createStationData = await createStationRes.json();
    console.log("Create Station Response:", createStationData);
    assert.strictEqual(createStationRes.status, 201);
    stationId = createStationData.data.id;
    assert.ok(stationId);
    assert.strictEqual(createStationData.data.isVerified, false); // defaults to false

    // 8. Get Stations
    console.log("\n8. Testing Get Stations...");
    const getStationsRes = await fetch(`${BASE_URL}/api/stations`);
    const getStationsData = await getStationsRes.json();
    console.log(`Retrieved ${getStationsData.data.length} stations.`);
    assert.strictEqual(getStationsRes.status, 200);
    assert.ok(getStationsData.data.find(s => s.id === stationId));

    // 9. Get Stations by Nearby Geolocation (radius = 5km, central lat/lng = 6.5100, 3.3700)
    console.log("\n9. Testing Geolocation Query...");
    const geoRes = await fetch(`${BASE_URL}/api/stations?lat=6.5100&lng=3.3700&radius=5`);
    const geoData = await geoRes.json();
    console.log("Geo response data count:", geoData.data.length);
    assert.strictEqual(geoRes.status, 200);
    const nearbyStation = geoData.data.find(s => s.id === stationId);
    assert.ok(nearbyStation);
    console.log("Calculated distance (km):", nearbyStation.distance);

    // 10. Submit Fuel Report as USER
    console.log("\n10. Testing Submit Fuel Report...");
    const reportRes = await fetch(`${BASE_URL}/api/reports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${userToken}`
      },
      body: JSON.stringify({
        stationId: stationId,
        fuelType: "PMS",
        price: 650.00,
        available: true
      })
    });
    const reportData = await reportRes.json();
    console.log("Submit Report Response:", reportData);
    assert.strictEqual(reportRes.status, 201);
    reportId = reportData.data.id;
    assert.ok(reportId);

    // 11. Get reports for station
    console.log("\n11. Testing Get Station Reports...");
    const stationReportsRes = await fetch(`${BASE_URL}/api/reports/station/${stationId}`);
    const stationReportsData = await stationReportsRes.json();
    console.log(`Retrieved ${stationReportsData.data.length} reports for station.`);
    assert.strictEqual(stationReportsRes.status, 200);
    assert.strictEqual(stationReportsData.data[0].fuelType, "PMS");
    assert.strictEqual(stationReportsData.data[0].price, 650.00);

    // 12. Get Users as USER (should fail 403)
    console.log("\n12. Testing Get Users as USER (Should fail 403)...");
    const getUsersFailRes = await fetch(`${BASE_URL}/api/users`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${userToken}`
      }
    });
    const getUsersFailData = await getUsersFailRes.json();
    console.log("Get Users fail response:", getUsersFailData);
    assert.strictEqual(getUsersFailRes.status, 403);
    assert.strictEqual(getUsersFailData.success, false);

    // 13. Get Users as ADMIN (should succeed 200)
    console.log("\n13. Testing Get Users as ADMIN...");
    const getUsersSuccessRes = await fetch(`${BASE_URL}/api/users`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${adminToken}`
      }
    });
    const getUsersSuccessData = await getUsersSuccessRes.json();
    console.log(`Retrieved ${getUsersSuccessData.data.length} users.`);
    assert.strictEqual(getUsersSuccessRes.status, 200);
    assert.ok(getUsersSuccessData.data.find(u => u.email === userEmail));

    // 14. Verify Station as ADMIN (PUT request)
    console.log("\n14. Testing Verify Station as ADMIN...");
    const verifyRes = await fetch(`${BASE_URL}/api/stations/${stationId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        isVerified: true
      })
    });
    const verifyData = await verifyRes.json();
    console.log("Verify Station Response:", verifyData);
    assert.strictEqual(verifyRes.status, 200);
    assert.strictEqual(verifyData.data.isVerified, true);

    // 15. Delete Station as ADMIN
    console.log("\n15. Testing Delete Station as ADMIN...");
    const deleteRes = await fetch(`${BASE_URL}/api/stations/${stationId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${adminToken}`
      }
    });
    const deleteData = await deleteRes.json();
    console.log("Delete Station Response:", deleteData);
    assert.strictEqual(deleteRes.status, 200);

    // 16. Verify station is deleted
    const verifyDeletedRes = await fetch(`${BASE_URL}/api/stations/${stationId}`);
    console.log("Verify Deleted Station Status:", verifyDeletedRes.status);
    assert.strictEqual(verifyDeletedRes.status, 404);

    console.log("\nALL TESTS PASSED SUCCESSFULLY! ✅");
    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error("\nTEST FAILED! ❌");
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  }
};

test();
