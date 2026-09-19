using System.Collections.Generic;
using UnityEngine;

namespace GridGuard
{
    [ExecuteInEditMode]
    public class SmartCityBuilder : MonoBehaviour
    {
        public bool buildOnStart = true;

        private void Start()
        {
            if (buildOnStart && transform.childCount == 0)
            {
                BuildSmartCity();
            }
        }

        [ContextMenu("Build Smart City")]
        public void BuildSmartCity()
        {
            while (transform.childCount > 0)
            {
                DestroyImmediate(transform.GetChild(0).gameObject);
            }

            Debug.Log("[SmartCityBuilder] Building Presentation-Ready 3D Smart City Power Grid Digital Twin...");

            // 1. Terrain, Asphalt Roads, Sidewalks, Street Markings
            CreateRoadNetworkAndGround();

            // 2. Main Generation Plant (850 MW)
            GameObject powerPlant = CreatePowerPlantZone(new Vector3(-50f, 0f, -40f));

            // 3. 220 kV Lattice Transmission Towers
            GameObject tower1 = CreateLatticeTower(new Vector3(-35f, 0f, -28f), "Tower_220kV_A");
            GameObject tower2 = CreateLatticeTower(new Vector3(-24f, 0f, -18f), "Tower_220kV_B");

            // 4. Central 220kV/11kV Substation & Main Transformer T1
            GameObject substation = CreateSubstationZone(new Vector3(-18f, 0f, -8f));

            // 5. 11 kV Distribution Utility Poles
            CreateDistributionPoles();

            // 6. Hospital Medical Complex & Emergency Trauma Bay
            GameObject hospital = CreateHospitalComplex(new Vector3(28f, 0f, -5f));

            // 7. Commercial Zone & 24/7 Pharmacy / Medical Store
            GameObject commercial = CreateCommercialAndPharmacy(new Vector3(14f, 0f, 22f));

            // 8. Residential Neighborhood (Houses with Pitched Roofs, Villas, Smart Meters)
            GameObject residential = CreateResidentialNeighborhood(new Vector3(36f, 0f, 22f));

            // 9. Heavy Industrial Complex (Factories, Sawtooth Roofs, Smokestacks, Heavy Transformer, Cargo Trucks)
            GameObject industrial = CreateIndustrialZone(new Vector3(-28f, 0f, 26f));

            // 10. Hyperscale AI GPU Data Center (10 MW)
            GameObject dataCenter = CreateDataCenterZone(new Vector3(12f, 0f, 52f));

            // 11. Solar PV Farm with Angled Racks & Inverters
            GameObject solarFarm = CreateSolarFarmZone(new Vector3(-40f, 0f, -8f));

            // 12. Coastal Wind Turbine Farm (20 MW)
            GameObject windFarm = CreateWindTurbineFarm(new Vector3(-48f, 0f, 15f));

            // 13. BESS Battery Energy Storage Plaza (Megapack Containers)
            GameObject bess = CreateBESSZone(new Vector3(-8f, 0f, -38f));

            // 14. EV Fast-Charging Plaza (Canopy, Pedestals, Connected EVs)
            GameObject evPlaza = CreateEVPlazaZone(new Vector3(25f, 0f, -32f));

            // 15. Streetlights, Landscaping, Trees, Crosswalks
            CreateUrbanLandscapingAndStreetlights();

            // 16. Physical Electrical Pathway: Gen -> Towers -> Substation -> Xfmr T1 -> Feeders -> City Buildings
            WirePhysicalElectricalGrid(powerPlant, tower1, tower2, substation, hospital, commercial, residential, industrial, dataCenter, solarFarm, windFarm, bess, evPlaza);

            // 17. Dynamic Traffic & Pedestrians
            GameObject trafficObj = new GameObject("City_Traffic_System");
            trafficObj.transform.parent = transform;
            trafficObj.AddComponent<TrafficManager>();

            GameObject citizenObj = new GameObject("City_Citizen_System");
            citizenObj.transform.parent = transform;
            citizenObj.AddComponent<CitizenManager>();

            Debug.Log("[SmartCityBuilder] Full-Scale Realistic Smart City Digital Twin Complete.");
        }

        // ==========================================
        // 1. TERRAIN, ROADS, SIDEWALKS & MARKINGS
        // ==========================================
        private void CreateRoadNetworkAndGround()
        {
            GameObject ground = GameObject.CreatePrimitive(PrimitiveType.Plane);
            ground.name = "City_Ground_Terrain";
            ground.transform.parent = transform;
            ground.transform.localScale = new Vector3(15f, 1f, 15f);
            SetObjectColor(ground, new Color(0.11f, 0.20f, 0.13f), 0.9f); // Dark rich grass terrain

            // Main East-West Boulevard (Width 12m)
            CreateAsphaltRoad("Main_Boulevard_EW", new Vector3(0f, 0.03f, 0f), new Vector3(140f, 0.05f, 12f), true);

            // North-South Avenue (Width 12m)
            CreateAsphaltRoad("Avenue_NS", new Vector3(0f, 0.03f, 0f), new Vector3(12f, 0.05f, 140f), false);

            // Residential & Commercial Access Roads
            CreateAsphaltRoad("Residential_Drive", new Vector3(28f, 0.03f, 14f), new Vector3(8f, 0.05f, 65f), false);
            CreateAsphaltRoad("Commercial_Way", new Vector3(28f, 0.03f, 44f), new Vector3(65f, 0.05f, 8f), true);

            // Industrial Haul Road
            CreateAsphaltRoad("Industrial_Haul_Road", new Vector3(-28f, 0.03f, 14f), new Vector3(8f, 0.05f, 60f), false);

            // Substation Access Road
            CreateAsphaltRoad("Substation_Service_Road", new Vector3(-18f, 0.03f, -24f), new Vector3(8f, 0.05f, 35f), false);
        }

        private void CreateAsphaltRoad(string roadName, Vector3 pos, Vector3 size, bool isEastWest)
        {
            GameObject road = GameObject.CreatePrimitive(PrimitiveType.Cube);
            road.name = roadName;
            road.transform.parent = transform;
            road.transform.localPosition = pos;
            road.transform.localScale = size;
            SetObjectColor(road, new Color(0.12f, 0.14f, 0.16f), 0.2f); // Dark asphalt

            if (isEastWest)
            {
                CreateCurb(road.transform, new Vector3(0, 0.06f, (size.z * 0.5f) + 0.6f), new Vector3(size.x, 0.12f, 1.2f));
                CreateCurb(road.transform, new Vector3(0, 0.06f, -(size.z * 0.5f) - 0.6f), new Vector3(size.x, 0.12f, 1.2f));

                // Dashed Centerlines
                for (float x = -size.x * 0.45f; x <= size.x * 0.45f; x += 6f)
                {
                    GameObject stripe = GameObject.CreatePrimitive(PrimitiveType.Cube);
                    stripe.name = "Stripe";
                    stripe.transform.parent = road.transform;
                    stripe.transform.localPosition = new Vector3(x / size.x, 0.52f, 0f);
                    stripe.transform.localScale = new Vector3(3f / size.x, 0.05f, 0.25f / size.z);
                    SetObjectColor(stripe, Color.white, 0.1f);
                }
            }
            else
            {
                CreateCurb(road.transform, new Vector3((size.x * 0.5f) + 0.6f, 0.06f, 0), new Vector3(1.2f, 0.12f, size.z));
                CreateCurb(road.transform, new Vector3(-(size.x * 0.5f) - 0.6f, 0.06f, 0), new Vector3(1.2f, 0.12f, size.z));

                // Dashed Centerlines
                for (float z = -size.z * 0.45f; z <= size.z * 0.45f; z += 6f)
                {
                    GameObject stripe = GameObject.CreatePrimitive(PrimitiveType.Cube);
                    stripe.name = "Stripe";
                    stripe.transform.parent = road.transform;
                    stripe.transform.localPosition = new Vector3(0f, 0.52f, z / size.z);
                    stripe.transform.localScale = new Vector3(0.25f / size.x, 0.05f, 3f / size.z);
                    SetObjectColor(stripe, Color.white, 0.1f);
                }
            }
        }

        private void CreateCurb(Transform parent, Vector3 localPos, Vector3 size)
        {
            GameObject curb = GameObject.CreatePrimitive(PrimitiveType.Cube);
            curb.name = "Sidewalk";
            curb.transform.parent = parent;
            curb.transform.localPosition = localPos;
            curb.transform.localScale = size;
            SetObjectColor(curb, new Color(0.48f, 0.50f, 0.52f), 0.3f);
        }

        // ==========================================
        // 2. GENERATION PLANT (850 MW)
        // ==========================================
        private GameObject CreatePowerPlantZone(Vector3 pos)
        {
            GameObject root = new GameObject("Main_Power_Plant_850MW");
            root.transform.parent = transform;
            root.transform.localPosition = pos;

            // Turbine & Generator Hall
            GameObject hall = GameObject.CreatePrimitive(PrimitiveType.Cube);
            hall.transform.parent = root.transform;
            hall.transform.localPosition = new Vector3(0, 7f, 0);
            hall.transform.localScale = new Vector3(22f, 14f, 16f);
            SetObjectColor(hall, new Color(0.26f, 0.30f, 0.36f));

            // GSU Step-Up Transformer
            GameObject gsu = GameObject.CreatePrimitive(PrimitiveType.Cube);
            gsu.name = "GSU_Transformer";
            gsu.transform.parent = root.transform;
            gsu.transform.localPosition = new Vector3(14f, 3.5f, 0);
            gsu.transform.localScale = new Vector3(5f, 7f, 6f);
            SetObjectColor(gsu, new Color(0.20f, 0.38f, 0.45f));

            // Twin Hyperbolic Cooling Towers
            for (int i = -1; i <= 1; i += 2)
            {
                GameObject tower = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
                tower.transform.parent = root.transform;
                tower.transform.localPosition = new Vector3(i * 7f, 10f, 14f);
                tower.transform.localScale = new Vector3(5.5f, 10f, 5.5f);
                SetObjectColor(tower, new Color(0.42f, 0.45f, 0.48f));
            }

            // Visible 3D Building Signboard
            CreateBuildingSign(root.transform, new Vector3(0, 15f, 8.2f), "MAIN GRID / GENERATOR 850 MW", Color.cyan);

            var insp = root.AddComponent<InspectableObject>();
            insp.objectName = "Main Power Plant (CCGT 850 MW)";
            insp.zoneType = "Generation Zone";
            insp.voltageLevel = "220 kV (via GSU Step-Up)";
            insp.powerRating = "850 MW Continuous";
            insp.feederCircuit = "220 kV Bulk Transmission";
            insp.operatingTemp = 58.2f;
            insp.operationalStatus = "100% ONLINE";
            insp.description = "Base-load combined cycle gas turbine generator supplying bulk electricity to central substation.";

            var fl = root.AddComponent<FloatingLabel>();
            fl.title = "Main Generator (850 MW)";
            fl.subtitle = "Grid Base: 220 kV";
            fl.titleColor = Color.cyan;
            fl.offset = new Vector3(0, 19f, 0);

            return root;
        }

        // ==========================================
        // 3. 220 kV LATTICE TRANSMISSION TOWERS
        // ==========================================
        private GameObject CreateLatticeTower(Vector3 pos, string name)
        {
            GameObject tower = new GameObject(name);
            tower.transform.parent = transform;
            tower.transform.localPosition = pos;

            GameObject mast = GameObject.CreatePrimitive(PrimitiveType.Cube);
            mast.transform.parent = tower.transform;
            mast.transform.localPosition = new Vector3(0, 11f, 0);
            mast.transform.localScale = new Vector3(2.2f, 22f, 2.2f);
            SetObjectColor(mast, new Color(0.60f, 0.65f, 0.70f), 0.5f);

            for (int y = 14; y <= 19; y += 5)
            {
                GameObject arm = GameObject.CreatePrimitive(PrimitiveType.Cube);
                arm.transform.parent = tower.transform;
                arm.transform.localPosition = new Vector3(0, y, 0);
                arm.transform.localScale = new Vector3(12f - (y - 14) * 0.6f, 0.7f, 1.2f);
                SetObjectColor(arm, new Color(0.52f, 0.56f, 0.60f));

                for (int side = -1; side <= 1; side += 2)
                {
                    GameObject insulator = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
                    insulator.transform.parent = tower.transform;
                    insulator.transform.localPosition = new Vector3(side * 5.2f, y - 1.2f, 0);
                    insulator.transform.localScale = new Vector3(0.4f, 1.2f, 0.4f);
                    SetObjectColor(insulator, new Color(0.85f, 0.88f, 0.90f));
                }
            }

            var insp = tower.AddComponent<InspectableObject>();
            insp.objectName = "220 kV Transmission Lattice Tower";
            insp.zoneType = "High-Voltage Transmission";
            insp.voltageLevel = "220 kV AC 3-Phase";
            insp.powerRating = "850 MVA Capacity";
            insp.feederCircuit = "Main Bulk Power Corridor";
            insp.operatingTemp = 36.4f;
            insp.operationalStatus = "NORMAL";
            insp.description = "Suspends 3-phase high-voltage bundle conductors linking generator to substation.";

            return tower;
        }

        // ==========================================
        // 4. CENTRAL SUBSTATION & TRANSFORMER T1
        // ==========================================
        private GameObject CreateSubstationZone(Vector3 pos)
        {
            GameObject root = new GameObject("Central_Substation_220kV_11kV");
            root.transform.parent = transform;
            root.transform.localPosition = pos;

            // Gravel Switchyard Base
            GameObject yard = GameObject.CreatePrimitive(PrimitiveType.Cube);
            yard.transform.parent = root.transform;
            yard.transform.localPosition = new Vector3(0, 0.1f, 0);
            yard.transform.localScale = new Vector3(26f, 0.2f, 22f);
            SetObjectColor(yard, new Color(0.24f, 0.26f, 0.28f), 0.1f);

            CreatePerimeterFence(root.transform, new Vector3(26f, 2f, 22f));

            // Main Transformer T1
            GameObject xfmr = new GameObject("Main_Transformer_T1");
            xfmr.transform.parent = root.transform;
            xfmr.transform.localPosition = new Vector3(0, 0f, 0);

            GameObject tank = GameObject.CreatePrimitive(PrimitiveType.Cube);
            tank.transform.parent = xfmr.transform;
            tank.transform.localPosition = new Vector3(0, 3f, 0);
            tank.transform.localScale = new Vector3(5f, 5.5f, 4.5f);
            SetObjectColor(tank, new Color(0.28f, 0.35f, 0.44f));

            // Radiator cooling fins
            for (int side = -1; side <= 1; side += 2)
            {
                GameObject fins = GameObject.CreatePrimitive(PrimitiveType.Cube);
                fins.transform.parent = xfmr.transform;
                fins.transform.localPosition = new Vector3(side * 3.1f, 3f, 0);
                fins.transform.localScale = new Vector3(1f, 4.5f, 4.2f);
                SetObjectColor(fins, new Color(0.20f, 0.24f, 0.30f));
            }

            // Conservator tank
            GameObject cons = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            cons.transform.parent = xfmr.transform;
            cons.transform.localPosition = new Vector3(0, 6.4f, -0.8f);
            cons.transform.localRotation = Quaternion.Euler(0, 0, 90);
            cons.transform.localScale = new Vector3(1.2f, 2f, 1.2f);
            SetObjectColor(cons, new Color(0.35f, 0.40f, 0.48f));

            // High Voltage Gantry
            GameObject gantry = GameObject.CreatePrimitive(PrimitiveType.Cube);
            gantry.transform.parent = root.transform;
            gantry.transform.localPosition = new Vector3(-8f, 6f, 0);
            gantry.transform.localScale = new Vector3(1.5f, 12f, 16f);
            SetObjectColor(gantry, new Color(0.50f, 0.55f, 0.60f));

            // 11 kV Switchgear House
            GameObject ctrlHouse = GameObject.CreatePrimitive(PrimitiveType.Cube);
            ctrlHouse.transform.parent = root.transform;
            ctrlHouse.transform.localPosition = new Vector3(9f, 2.5f, 0);
            ctrlHouse.transform.localScale = new Vector3(6f, 5f, 12f);
            SetObjectColor(ctrlHouse, new Color(0.30f, 0.34f, 0.40f));

            // Substation 3D Signboards
            CreateBuildingSign(root.transform, new Vector3(0, 12.5f, -8f), "CENTRAL 11 kV SUBSTATION", Color.cyan);
            CreateBuildingSign(xfmr.transform, new Vector3(0, 7.8f, 2f), "TRANSFORMER T1", Color.yellow);

            var fl = xfmr.AddComponent<FloatingLabel>();
            fl.title = "Substation Transformer T1";
            fl.subtitle = "220 kV -> 11 kV (Load: 62%)";
            fl.titleColor = Color.cyan;
            fl.offset = new Vector3(0, 9.5f, 0);

            var tc = xfmr.AddComponent<TransformerController>();
            tc.transformerId = "Main Transformer T1";
            if (GridManager.Instance != null) GridManager.Instance.mainTransformer = tc;

            var insp = xfmr.AddComponent<InspectableObject>();
            insp.objectName = "Main Power Transformer T1 (220kV / 11kV)";
            insp.zoneType = "Central Substation";
            insp.voltageLevel = "220 kV to 11 kV Step-Down";
            insp.powerRating = "60 MVA Continuous";
            insp.feederCircuit = "Substation 11 kV Busbar Header";
            insp.operatingTemp = 64.8f;
            insp.operationalStatus = "OPTIMAL";
            insp.description = "Primary step-down power transformer feeding 5 urban distribution circuits.";

            return root;
        }

        private void CreatePerimeterFence(Transform parent, Vector3 size)
        {
            GameObject fence = GameObject.CreatePrimitive(PrimitiveType.Cube);
            fence.name = "Security_Fence";
            fence.transform.parent = parent;
            fence.transform.localPosition = new Vector3(0, 1.2f, 0);
            fence.transform.localScale = new Vector3(size.x, 2.2f, size.z);
            SetObjectColor(fence, new Color(0.3f, 0.35f, 0.4f, 0.25f));
        }

        // ==========================================
        // 5. 11 kV DISTRIBUTION UTILITY POLES
        // ==========================================
        private void CreateDistributionPoles()
        {
            GameObject polesRoot = new GameObject("11kV_Distribution_Poles");
            polesRoot.transform.parent = transform;

            Vector3[] poleCoords = new Vector3[]
            {
                new Vector3(-6f, 0, 7f),
                new Vector3(10f, 0, 7f),
                new Vector3(25f, 0, 7f),
                new Vector3(25f, 0, 25f),
                new Vector3(-12f, 0, 14f),
                new Vector3(15f, 0, -18f)
            };

            foreach (var p in poleCoords)
            {
                GameObject pole = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
                pole.transform.parent = polesRoot.transform;
                pole.transform.localPosition = new Vector3(p.x, 4.5f, p.z);
                pole.transform.localScale = new Vector3(0.35f, 4.5f, 0.35f);
                SetObjectColor(pole, new Color(0.40f, 0.32f, 0.22f));

                GameObject arm = GameObject.CreatePrimitive(PrimitiveType.Cube);
                arm.transform.parent = pole.transform;
                arm.transform.localPosition = new Vector3(0, 0.88f, 0);
                arm.transform.localScale = new Vector3(6f, 0.2f, 0.6f);
                SetObjectColor(arm, new Color(0.5f, 0.4f, 0.3f));

                GameObject can = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
                can.transform.parent = pole.transform;
                can.transform.localPosition = new Vector3(0.6f, 0.4f, 0);
                can.transform.localScale = new Vector3(0.9f, 0.7f, 0.9f);
                SetObjectColor(can, new Color(0.45f, 0.50f, 0.55f));
            }
        }

        // ==========================================
        // 6. HOSPITAL MEDICAL COMPLEX & EMERGENCY BAY
        // ==========================================
        private GameObject CreateHospitalComplex(Vector3 pos)
        {
            GameObject root = new GameObject("Hospital_Medical_Complex");
            root.transform.parent = transform;
            root.transform.localPosition = pos;

            // Main Central Hospital Tower (6 Floors)
            GameObject mainTower = GameObject.CreatePrimitive(PrimitiveType.Cube);
            mainTower.transform.parent = root.transform;
            mainTower.transform.localPosition = new Vector3(0, 8f, 0);
            mainTower.transform.localScale = new Vector3(18f, 16f, 16f);
            SetObjectColor(mainTower, new Color(0.92f, 0.95f, 0.98f));

            // Windows
            for (float y = 2.5f; y <= 14.5f; y += 2.8f)
            {
                GameObject win = GameObject.CreatePrimitive(PrimitiveType.Cube);
                win.transform.parent = root.transform;
                win.transform.localPosition = new Vector3(0, y, 8.1f);
                win.transform.localScale = new Vector3(16f, 1.2f, 0.1f);
                SetObjectColor(win, new Color(0.18f, 0.36f, 0.55f));
            }

            // Emergency Trauma Wing
            GameObject erWing = GameObject.CreatePrimitive(PrimitiveType.Cube);
            erWing.transform.parent = root.transform;
            erWing.transform.localPosition = new Vector3(13f, 3.5f, 0);
            erWing.transform.localScale = new Vector3(10f, 7f, 12f);
            SetObjectColor(erWing, new Color(0.85f, 0.88f, 0.92f));

            // Ambulance Bay Canopy
            GameObject erCanopy = GameObject.CreatePrimitive(PrimitiveType.Cube);
            erCanopy.transform.parent = root.transform;
            erCanopy.transform.localPosition = new Vector3(18f, 4f, 0);
            erCanopy.transform.localScale = new Vector3(6f, 0.4f, 10f);
            SetObjectColor(erCanopy, new Color(0.9f, 0.2f, 0.2f));

            // Parked Emergency Ambulance
            CreateAmbulance(root.transform, new Vector3(18f, 0.7f, 0));

            // Helipad on Roof
            GameObject helipad = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            helipad.transform.parent = root.transform;
            helipad.transform.localPosition = new Vector3(0, 16.1f, 0);
            helipad.transform.localScale = new Vector3(10f, 0.15f, 10f);
            SetObjectColor(helipad, new Color(0.25f, 0.28f, 0.32f));

            // Red Cross Emblems
            CreateRedCross(root.transform, new Vector3(0, 17f, 7.8f), 4.5f);
            CreateRedCross(root.transform, new Vector3(0, 17f, -7.8f), 4.5f);

            // Large 3D Signboards
            CreateBuildingSign(root.transform, new Vector3(0, 19.5f, 8.2f), "HOSPITAL & EMERGENCY CENTER", Color.green);
            CreateBuildingSign(root.transform, new Vector3(18f, 4.6f, 5.2f), "AMBULANCE BAY", Color.red);

            var fl = root.AddComponent<FloatingLabel>();
            fl.title = "Hospital Medical Complex";
            fl.subtitle = "Feeder 1: PROTECTED (100% Online)";
            fl.titleColor = Color.green;
            fl.offset = new Vector3(0, 21f, 0);

            var hc = root.AddComponent<HospitalController>();
            if (GridManager.Instance != null) GridManager.Instance.hospital = hc;

            var insp = root.AddComponent<InspectableObject>();
            insp.objectName = "City General Hospital & Emergency Trauma";
            insp.zoneType = "Critical Life-Safety Zone";
            insp.voltageLevel = "11 kV Dedicated Dual-Feeder";
            insp.powerRating = "8.0 MW Critical Tier 1";
            insp.feederCircuit = "Feeder F1 (Hospital Priority Circuit)";
            insp.operatingTemp = 38.0f;
            insp.operationalStatus = "PROTECTED (SHEDDING-IMMUNE)";
            insp.description = "Life-safety medical center protected by deterministic PLC interlocks. Never load-shed.";

            return root;
        }

        private void CreateAmbulance(Transform parent, Vector3 pos)
        {
            GameObject amb = new GameObject("Ambulance_Emergency");
            amb.transform.parent = parent;
            amb.transform.localPosition = pos;

            GameObject body = GameObject.CreatePrimitive(PrimitiveType.Cube);
            body.transform.parent = amb.transform;
            body.transform.localPosition = new Vector3(0, 0.6f, 0);
            body.transform.localScale = new Vector3(2.4f, 1.8f, 4.5f);
            SetObjectColor(body, Color.white);

            GameObject stripe = GameObject.CreatePrimitive(PrimitiveType.Cube);
            stripe.transform.parent = amb.transform;
            stripe.transform.localPosition = new Vector3(0, 0.6f, 0);
            stripe.transform.localScale = new Vector3(2.45f, 0.4f, 4.4f);
            SetObjectColor(stripe, Color.red);

            GameObject lightbar = GameObject.CreatePrimitive(PrimitiveType.Cube);
            lightbar.transform.parent = amb.transform;
            lightbar.transform.localPosition = new Vector3(0, 1.6f, 0.8f);
            lightbar.transform.localScale = new Vector3(1.2f, 0.25f, 0.4f);
            SetObjectColor(lightbar, Color.blue);
        }

        private void CreateRedCross(Transform parent, Vector3 pos, float size)
        {
            GameObject crossH = GameObject.CreatePrimitive(PrimitiveType.Cube);
            crossH.transform.parent = parent;
            crossH.transform.localPosition = pos;
            crossH.transform.localScale = new Vector3(size, size * 0.28f, 0.3f);
            SetObjectColor(crossH, Color.red);

            GameObject crossV = GameObject.CreatePrimitive(PrimitiveType.Cube);
            crossV.transform.parent = parent;
            crossV.transform.localPosition = pos;
            crossV.transform.localScale = new Vector3(size * 0.28f, size, 0.3f);
            SetObjectColor(crossV, Color.red);
        }

        // ==========================================
        // 7. COMMERCIAL ZONE & PHARMACY
        // ==========================================
        private GameObject CreateCommercialAndPharmacy(Vector3 pos)
        {
            GameObject root = new GameObject("Commercial_And_Pharmacy_Zone");
            root.transform.parent = transform;
            root.transform.localPosition = pos;

            // 24/7 Pharmacy
            GameObject pharmacy = new GameObject("PharmaCare_Medical_Store");
            pharmacy.transform.parent = root.transform;
            pharmacy.transform.localPosition = new Vector3(-6f, 0f, 0f);

            GameObject pBody = GameObject.CreatePrimitive(PrimitiveType.Cube);
            pBody.transform.parent = pharmacy.transform;
            pBody.transform.localPosition = new Vector3(0, 3f, 0);
            pBody.transform.localScale = new Vector3(9f, 6f, 8f);
            SetObjectColor(pBody, new Color(0.90f, 0.94f, 0.92f));

            // Green Awning
            GameObject pAwning = GameObject.CreatePrimitive(PrimitiveType.Cube);
            pAwning.transform.parent = pharmacy.transform;
            pAwning.transform.localPosition = new Vector3(0, 3.8f, 4.3f);
            pAwning.transform.localScale = new Vector3(8.5f, 0.3f, 1.8f);
            SetObjectColor(pAwning, new Color(0.1f, 0.65f, 0.35f));

            CreateGreenCross(pharmacy.transform, new Vector3(0, 5.2f, 4.2f), 2.2f);
            CreateBuildingSign(pharmacy.transform, new Vector3(0, 6.8f, 4.3f), "PHARMACY / 24-7 MEDICAL STORE", Color.green);

            // Office Complex
            GameObject office = GameObject.CreatePrimitive(PrimitiveType.Cube);
            office.name = "Commercial_Tower";
            office.transform.parent = root.transform;
            office.transform.localPosition = new Vector3(8f, 7f, 0);
            office.transform.localScale = new Vector3(12f, 14f, 12f);
            SetObjectColor(office, new Color(0.24f, 0.34f, 0.46f));
            CreateBuildingSign(office.transform, new Vector3(0, 14.5f, 6.2f), "COMMERCIAL CENTER (15 MW)", Color.cyan);

            var fl = pharmacy.AddComponent<FloatingLabel>();
            fl.title = "Pharmacy & Medical Store";
            fl.subtitle = "Feeder 2: 24/7 Cold Chain";
            fl.titleColor = Color.green;
            fl.offset = new Vector3(0, 8.5f, 0);

            var insp = pharmacy.AddComponent<InspectableObject>();
            insp.objectName = "PharmaCare 24/7 Medical Store";
            insp.zoneType = "Commercial Healthcare";
            insp.voltageLevel = "415 V (from 11 kV Feeder 2)";
            insp.powerRating = "65 kW Cold Storage";
            insp.feederCircuit = "Feeder F2 (Commercial Healthcare)";
            insp.operatingTemp = 23.8f;
            insp.operationalStatus = "100% ONLINE";
            insp.description = "Neighborhood medical store requiring continuous power for insulin and vaccine cold chain.";

            return root;
        }

        private void CreateGreenCross(Transform parent, Vector3 pos, float size)
        {
            GameObject crossH = GameObject.CreatePrimitive(PrimitiveType.Cube);
            crossH.transform.parent = parent;
            crossH.transform.localPosition = pos;
            crossH.transform.localScale = new Vector3(size, size * 0.32f, 0.2f);
            SetObjectColor(crossH, Color.green);

            GameObject crossV = GameObject.CreatePrimitive(PrimitiveType.Cube);
            crossV.transform.parent = parent;
            crossV.transform.localPosition = pos;
            crossV.transform.localScale = new Vector3(size * 0.32f, size, 0.2f);
            SetObjectColor(crossV, Color.green);
        }

        // ==========================================
        // 8. RESIDENTIAL NEIGHBORHOOD
        // ==========================================
        private GameObject CreateResidentialNeighborhood(Vector3 pos)
        {
            GameObject root = new GameObject("Residential_Neighborhood");
            root.transform.parent = transform;
            root.transform.localPosition = pos;

            float[] posX = new float[] { -8f, 0f, 8f, -8f, 0f, 8f };
            float[] posZ = new float[] { -8f, -8f, -8f, 8f, 8f, 8f };
            Color[] houseColors = new Color[]
            {
                new Color(0.85f, 0.82f, 0.78f),
                new Color(0.76f, 0.80f, 0.84f),
                new Color(0.88f, 0.86f, 0.80f),
                new Color(0.80f, 0.82f, 0.80f),
                new Color(0.84f, 0.78f, 0.76f),
                new Color(0.78f, 0.82f, 0.86f)
            };

            for (int i = 0; i < 6; i++)
            {
                CreateHouse(root.transform, new Vector3(posX[i], 0, posZ[i]), houseColors[i], $"House_{i + 1}");
            }

            CreateBuildingSign(root.transform, new Vector3(0, 11f, 14f), "RESIDENTIAL DISTRICT (25 MW)", Color.cyan);

            var fl = root.AddComponent<FloatingLabel>();
            fl.title = "Residential Neighborhood";
            fl.subtitle = "Feeder 3: 25 MW Load";
            fl.titleColor = new Color(0.4f, 0.7f, 1f);
            fl.offset = new Vector3(0, 10.5f, 0);

            var insp = root.AddComponent<InspectableObject>();
            insp.objectName = "Residential Smart Grid District";
            insp.zoneType = "Residential Area";
            insp.voltageLevel = "240 V / 415 V (from 11 kV Feeder 3)";
            insp.powerRating = "25.0 MW Base Demand";
            insp.feederCircuit = "Feeder F3 (Residential)";
            insp.operatingTemp = 32.5f;
            insp.operationalStatus = "NORMAL";
            insp.description = "Suburban residential district equipped with IoT smart energy meters and rooftop PV integration.";

            return root;
        }

        private void CreateHouse(Transform parent, Vector3 localPos, Color wallCol, string name)
        {
            GameObject house = new GameObject(name);
            house.transform.parent = parent;
            house.transform.localPosition = localPos;

            GameObject lawn = GameObject.CreatePrimitive(PrimitiveType.Cube);
            lawn.transform.parent = house.transform;
            lawn.transform.localPosition = new Vector3(0, 0.05f, 0);
            lawn.transform.localScale = new Vector3(6.5f, 0.1f, 6.5f);
            SetObjectColor(lawn, new Color(0.18f, 0.35f, 0.20f));

            GameObject body = GameObject.CreatePrimitive(PrimitiveType.Cube);
            body.transform.parent = house.transform;
            body.transform.localPosition = new Vector3(0, 2f, 0);
            body.transform.localScale = new Vector3(4.8f, 3.8f, 4.8f);
            SetObjectColor(body, wallCol);

            // Pitched Gabled Roof
            GameObject roof = GameObject.CreatePrimitive(PrimitiveType.Cube);
            roof.transform.parent = house.transform;
            roof.transform.localPosition = new Vector3(0, 4.4f, 0);
            roof.transform.localRotation = Quaternion.Euler(45f, 0f, 0f);
            roof.transform.localScale = new Vector3(5.2f, 2.5f, 2.5f);
            SetObjectColor(roof, new Color(0.45f, 0.20f, 0.15f));

            GameObject door = GameObject.CreatePrimitive(PrimitiveType.Cube);
            door.transform.parent = house.transform;
            door.transform.localPosition = new Vector3(0, 1.2f, 2.45f);
            door.transform.localScale = new Vector3(1f, 2.2f, 0.1f);
            SetObjectColor(door, new Color(0.35f, 0.22f, 0.12f));

            // Smart Electricity Meter
            GameObject meter = GameObject.CreatePrimitive(PrimitiveType.Cube);
            meter.name = "Smart_Meter";
            meter.transform.parent = house.transform;
            meter.transform.localPosition = new Vector3(2.45f, 1.6f, 0);
            meter.transform.localScale = new Vector3(0.15f, 0.6f, 0.45f);
            SetObjectColor(meter, Color.cyan);
        }

        // ==========================================
        // 9. HEAVY INDUSTRIAL COMPLEX & TRUCKS
        // ==========================================
        private GameObject CreateIndustrialZone(Vector3 pos)
        {
            GameObject root = new GameObject("Industrial_Heavy_Zone");
            root.transform.parent = transform;
            root.transform.localPosition = pos;

            GameObject factory = GameObject.CreatePrimitive(PrimitiveType.Cube);
            factory.transform.parent = root.transform;
            factory.transform.localPosition = new Vector3(0, 5.5f, 0);
            factory.transform.localScale = new Vector3(20f, 11f, 16f);
            SetObjectColor(factory, new Color(0.32f, 0.35f, 0.38f));

            // Yellow Freight Loading Doors
            for (float x = -6f; x <= 6f; x += 6f)
            {
                GameObject bay = GameObject.CreatePrimitive(PrimitiveType.Cube);
                bay.transform.parent = root.transform;
                bay.transform.localPosition = new Vector3(x, 2.5f, 8.1f);
                bay.transform.localScale = new Vector3(4f, 5f, 0.1f);
                SetObjectColor(bay, new Color(0.85f, 0.70f, 0.15f));
            }

            // Cargo Delivery Truck
            GameObject truck = GameObject.CreatePrimitive(PrimitiveType.Cube);
            truck.name = "Industrial_Cargo_Truck";
            truck.transform.parent = root.transform;
            truck.transform.localPosition = new Vector3(-6f, 1.5f, 11.5f);
            truck.transform.localScale = new Vector3(3f, 3f, 7f);
            SetObjectColor(truck, new Color(0.15f, 0.45f, 0.75f));

            // Twin Smokestacks
            for (int i = -1; i <= 1; i += 2)
            {
                GameObject stack = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
                stack.transform.parent = root.transform;
                stack.transform.localPosition = new Vector3(i * 7f, 11f, -6f);
                stack.transform.localScale = new Vector3(1.8f, 11f, 1.8f);
                SetObjectColor(stack, new Color(0.48f, 0.44f, 0.40f));
            }

            // Industrial Transformer
            GameObject indXfmr = GameObject.CreatePrimitive(PrimitiveType.Cube);
            indXfmr.name = "Industrial_Transformer";
            indXfmr.transform.parent = root.transform;
            indXfmr.transform.localPosition = new Vector3(14f, 2.5f, 0);
            indXfmr.transform.localScale = new Vector3(4f, 5f, 5f);
            SetObjectColor(indXfmr, new Color(0.25f, 0.40f, 0.35f));

            CreateBuildingSign(root.transform, new Vector3(0, 13.5f, 8.3f), "INDUSTRIAL HEAVY ZONE (30 MW)", Color.yellow);

            var fl = root.AddComponent<FloatingLabel>();
            fl.title = "Industrial Heavy Facility";
            fl.subtitle = "Feeder 4: 30 MW Load";
            fl.titleColor = new Color(1f, 0.7f, 0.2f);
            fl.offset = new Vector3(0, 16.5f, 0);

            var insp = root.AddComponent<InspectableObject>();
            insp.objectName = "Heavy Industrial Manufacturing Facility";
            insp.zoneType = "Industrial Zone";
            insp.voltageLevel = "11 kV Dedicated Industrial Bus";
            insp.powerRating = "30.0 MW (Surges to 45.0 MW)";
            insp.feederCircuit = "Feeder F4 (Industrial Heavy)";
            insp.operatingTemp = 68.5f;
            insp.operationalStatus = "OPERATIONAL";
            insp.description = "Heavy arc furnaces and induction motors with dedicated step-down transformer and power factor correction.";

            return root;
        }

        // ==========================================
        // 10. HYPERSCALE AI GPU DATA CENTER (PDF Addition!)
        // ==========================================
        private GameObject CreateDataCenterZone(Vector3 pos)
        {
            GameObject root = new GameObject("Hyperscale_AI_DataCenter");
            root.transform.parent = transform;
            root.transform.localPosition = pos;

            GameObject hall = GameObject.CreatePrimitive(PrimitiveType.Cube);
            hall.transform.parent = root.transform;
            hall.transform.localPosition = new Vector3(0, 4.5f, 0);
            hall.transform.localScale = new Vector3(14f, 9f, 12f);
            SetObjectColor(hall, new Color(0.12f, 0.15f, 0.28f));

            // Liquid cooling chillers
            for (int i = -1; i <= 1; i += 2)
            {
                GameObject chiller = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
                chiller.transform.parent = root.transform;
                chiller.transform.localPosition = new Vector3(i * 4f, 10f, 0);
                chiller.transform.localScale = new Vector3(2.5f, 2.5f, 2.5f);
                SetObjectColor(chiller, new Color(0.35f, 0.40f, 0.55f));
            }

            CreateBuildingSign(root.transform, new Vector3(0, 10.5f, 6.2f), "AI DATA CENTER (10 MW GPU CLUSTER)", new Color(0.5f, 0.5f, 1f));

            var fl = root.AddComponent<FloatingLabel>();
            fl.title = "Hyperscale AI Data Center";
            fl.subtitle = "Feeder 2: 10 MW High Priority";
            fl.titleColor = new Color(0.5f, 0.5f, 1f);
            fl.offset = new Vector3(0, 13f, 0);

            var insp = root.AddComponent<InspectableObject>();
            insp.objectName = "Hyperscale AI GPU Data Center";
            insp.zoneType = "High-Tech Compute Zone";
            insp.voltageLevel = "11 kV High Priority Bus 2";
            insp.powerRating = "10.0 MW (Spikes to 22.0 MW on training)";
            insp.feederCircuit = "Feeder F2 (Commercial & High-Tech)";
            insp.operatingTemp = 36.5f;
            insp.operationalStatus = "ONLINE (LIQUID COOLED)";
            insp.description = "10,000+ liquid-cooled AI GPUs running distributed LLM training jobs requiring high-reliability power.";

            return root;
        }

        // ==========================================
        // 11. SOLAR PV FARM
        // ==========================================
        private GameObject CreateSolarFarmZone(Vector3 pos)
        {
            GameObject root = new GameObject("Solar_PV_Farm");
            root.transform.parent = transform;
            root.transform.localPosition = pos;

            GameObject bed = GameObject.CreatePrimitive(PrimitiveType.Cube);
            bed.transform.parent = root.transform;
            bed.transform.localPosition = new Vector3(0, 0.05f, 0);
            bed.transform.localScale = new Vector3(20f, 0.1f, 18f);
            SetObjectColor(bed, new Color(0.22f, 0.22f, 0.18f));

            for (int r = 0; r < 4; r++)
            {
                for (int c = -2; c <= 2; c++)
                {
                    GameObject rack = GameObject.CreatePrimitive(PrimitiveType.Cube);
                    rack.transform.parent = root.transform;
                    rack.transform.localPosition = new Vector3(c * 3.4f, 1.2f, (r - 1.5f) * 3.8f);
                    rack.transform.localRotation = Quaternion.Euler(30f, 0f, 0f);
                    rack.transform.localScale = new Vector3(2.8f, 0.1f, 2.0f);
                    SetObjectColor(rack, new Color(0.04f, 0.12f, 0.32f), 0.8f);
                }
            }

            GameObject inv = GameObject.CreatePrimitive(PrimitiveType.Cube);
            inv.name = "Central_Solar_Inverter";
            inv.transform.parent = root.transform;
            inv.transform.localPosition = new Vector3(9f, 1.5f, 0);
            inv.transform.localScale = new Vector3(1.8f, 3f, 3.5f);
            SetObjectColor(inv, new Color(0.85f, 0.88f, 0.90f));

            CreateBuildingSign(root.transform, new Vector3(0, 6f, 8f), "SOLAR PV FARM (35 MW PEAK)", Color.yellow);

            var fl = root.AddComponent<FloatingLabel>();
            fl.title = "Solar PV Farm";
            fl.subtitle = "Renewable: 35 MW Peak";
            fl.titleColor = Color.yellow;
            fl.offset = new Vector3(0, 7.5f, 0);

            var sc = root.AddComponent<SolarController>();
            if (GridManager.Instance != null) GridManager.Instance.solarFarm = sc;

            var insp = root.AddComponent<InspectableObject>();
            insp.objectName = "Grid-Scale Solar Photovoltaic Farm";
            insp.zoneType = "Renewable Generation";
            insp.voltageLevel = "690 V DC -> 11 kV AC Grid Tie";
            insp.powerRating = "35.0 MW Peak (Diurnal)";
            insp.feederCircuit = "Substation Renewable Feeder 5";
            insp.operatingTemp = 41.5f;
            insp.operationalStatus = "GENERATING (MPPT ACTIVE)";
            insp.description = "Bifacial monocrystalline solar arrays with smart inverters supplying zero-carbon generation.";

            return root;
        }

        // ==========================================
        // 12. COASTAL WIND TURBINE FARM (PDF Addition!)
        // ==========================================
        private GameObject CreateWindTurbineFarm(Vector3 pos)
        {
            GameObject root = new GameObject("Coastal_Wind_Farm");
            root.transform.parent = transform;
            root.transform.localPosition = pos;

            Vector3[] turbinePos = new Vector3[] { new Vector3(-6f, 0, -4f), new Vector3(6f, 0, 4f) };
            foreach (var tp in turbinePos)
            {
                GameObject tower = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
                tower.transform.parent = root.transform;
                tower.transform.localPosition = new Vector3(tp.x, 9f, tp.z);
                tower.transform.localScale = new Vector3(0.9f, 9f, 0.9f);
                SetObjectColor(tower, Color.white);

                GameObject nacelle = GameObject.CreatePrimitive(PrimitiveType.Cube);
                nacelle.transform.parent = root.transform;
                nacelle.transform.localPosition = new Vector3(tp.x, 18.2f, tp.z);
                nacelle.transform.localScale = new Vector3(1.4f, 1.2f, 3.2f);
                SetObjectColor(nacelle, Color.white);

                // Rotor blades
                GameObject hub = GameObject.CreatePrimitive(PrimitiveType.Sphere);
                hub.transform.parent = root.transform;
                hub.transform.localPosition = new Vector3(tp.x, 18.2f, tp.z + 1.7f);
                hub.transform.localScale = new Vector3(1.2f, 1.2f, 1.2f);
                SetObjectColor(hub, Color.gray);
            }

            CreateBuildingSign(root.transform, new Vector3(0, 19.5f, 0), "COASTAL WIND FARM (20 MW)", Color.cyan);

            var fl = root.AddComponent<FloatingLabel>();
            fl.title = "Coastal Wind Farm";
            fl.subtitle = "Generation: 20 MW Base";
            fl.titleColor = Color.cyan;
            fl.offset = new Vector3(0, 21f, 0);

            var insp = root.AddComponent<InspectableObject>();
            insp.objectName = "Coastal Wind Turbine Farm";
            insp.zoneType = "Renewable Generation";
            insp.voltageLevel = "690 V AC -> 11 kV Step-Up";
            insp.powerRating = "20.0 MW (15 - 25 MW Oscillating)";
            insp.feederCircuit = "Substation Renewable Feeder 6";
            insp.operatingTemp = 28.0f;
            insp.operationalStatus = "GENERATING (SYNCHRONIZED)";
            insp.description = "Offshore/coastal wind turbines delivering rotational synthetic inertia and active power.";

            return root;
        }

        // ==========================================
        // 13. BESS BATTERY STORAGE PLAZA
        // ==========================================
        private GameObject CreateBESSZone(Vector3 pos)
        {
            GameObject root = new GameObject("BESS_Battery_Plaza");
            root.transform.parent = transform;
            root.transform.localPosition = pos;

            for (int i = -1; i <= 1; i++)
            {
                GameObject pack = GameObject.CreatePrimitive(PrimitiveType.Cube);
                pack.transform.parent = root.transform;
                pack.transform.localPosition = new Vector3(i * 4.2f, 2.0f, 0);
                pack.transform.localScale = new Vector3(3.2f, 4.0f, 7.5f);
                SetObjectColor(pack, new Color(0.92f, 0.94f, 0.96f));

                GameObject vent = GameObject.CreatePrimitive(PrimitiveType.Cube);
                vent.transform.parent = pack.transform;
                vent.transform.localPosition = new Vector3(0, 0.3f, 0.51f);
                vent.transform.localScale = new Vector3(0.8f, 0.4f, 0.05f);
                SetObjectColor(vent, new Color(0.2f, 0.25f, 0.3f));
            }

            GameObject pcs = GameObject.CreatePrimitive(PrimitiveType.Cube);
            pcs.name = "PCS_Inverter";
            pcs.transform.parent = root.transform;
            pcs.transform.localPosition = new Vector3(7.5f, 2f, 0);
            pcs.transform.localScale = new Vector3(2.5f, 4f, 4.5f);
            SetObjectColor(pcs, new Color(0.18f, 0.55f, 0.40f));

            CreateBuildingSign(root.transform, new Vector3(0, 6.5f, 4.2f), "BESS / ENERGY STORAGE (50 MWh)", Color.green);

            var fl = root.AddComponent<FloatingLabel>();
            fl.title = "Battery Storage (BESS)";
            fl.subtitle = "50 MWh / 20 MW (SOC: 78%)";
            fl.titleColor = Color.cyan;
            fl.offset = new Vector3(0, 7.5f, 0);

            var bc = root.AddComponent<BatteryController>();
            if (GridManager.Instance != null) GridManager.Instance.bessBattery = bc;

            var insp = root.AddComponent<InspectableObject>();
            insp.objectName = "Central Utility BESS (Lithium Iron Phosphate)";
            insp.zoneType = "Energy Storage System";
            insp.voltageLevel = "11 kV Bi-Directional Grid Tie";
            insp.powerRating = "50.0 MWh / 20.0 MW Inverter";
            insp.feederCircuit = "Substation Fast-Response Storage Bus";
            insp.operatingTemp = 27.4f;
            insp.operationalStatus = "STANDBY / 78% SOC";
            insp.description = "Fast-frequency regulation and peak shaving battery storage system automatically dispatched by AI/PLC.";

            return root;
        }

        // ==========================================
        // 14. EV FAST-CHARGING PLAZA
        // ==========================================
        private GameObject CreateEVPlazaZone(Vector3 pos)
        {
            GameObject root = new GameObject("EV_Charging_Plaza");
            root.transform.parent = transform;
            root.transform.localPosition = pos;

            GameObject canopy = GameObject.CreatePrimitive(PrimitiveType.Cube);
            canopy.transform.parent = root.transform;
            canopy.transform.localPosition = new Vector3(0, 5.2f, 0);
            canopy.transform.localScale = new Vector3(18f, 0.4f, 10f);
            SetObjectColor(canopy, new Color(0.15f, 0.38f, 0.58f));

            for (int i = -2; i <= 2; i++)
            {
                GameObject charger = GameObject.CreatePrimitive(PrimitiveType.Cube);
                charger.transform.parent = root.transform;
                charger.transform.localPosition = new Vector3(i * 3.4f, 1.4f, 2.8f);
                charger.transform.localScale = new Vector3(0.6f, 2.8f, 0.6f);
                SetObjectColor(charger, Color.white);

                GameObject screen = GameObject.CreatePrimitive(PrimitiveType.Cube);
                screen.transform.parent = charger.transform;
                screen.transform.localPosition = new Vector3(0, 0.25f, -0.52f);
                screen.transform.localScale = new Vector3(0.6f, 0.35f, 0.1f);
                SetObjectColor(screen, Color.cyan);

                GameObject car = GameObject.CreatePrimitive(PrimitiveType.Cube);
                car.transform.parent = root.transform;
                car.transform.localPosition = new Vector3(i * 3.4f, 0.85f, -1.0f);
                car.transform.localScale = new Vector3(2.2f, 1.4f, 4.2f);
                SetObjectColor(car, (i % 2 == 0) ? new Color(0.1f, 0.6f, 0.9f) : new Color(0.9f, 0.2f, 0.2f));

                GameObject cable = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
                cable.transform.parent = root.transform;
                cable.transform.localPosition = new Vector3(i * 3.4f, 0.7f, 1.2f);
                cable.transform.localRotation = Quaternion.Euler(70f, 0, 0);
                cable.transform.localScale = new Vector3(0.08f, 0.9f, 0.08f);
                SetObjectColor(cable, Color.black);
            }

            CreateBuildingSign(root.transform, new Vector3(0, 5.8f, 5.2f), "EV CHARGING PLAZA (7 MW)", Color.cyan);

            var fl = root.AddComponent<FloatingLabel>();
            fl.title = "EV Fast Charging Plaza";
            fl.subtitle = "Feeder 4: 7 MW (Surge to 25 MW)";
            fl.titleColor = Color.cyan;
            fl.offset = new Vector3(0, 8.5f, 0);

            var evc = root.AddComponent<EVController>();
            if (GridManager.Instance != null) GridManager.Instance.evPlaza = evc;

            var insp = root.AddComponent<InspectableObject>();
            insp.objectName = "Commercial EV Fleet Fast-Charging Hub";
            insp.zoneType = "Transport Electrification";
            insp.voltageLevel = "11 kV to 480 V DC Fast Bus 4";
            insp.powerRating = "7.0 MW Base (Spikes to 25.0 MW on surge)";
            insp.feederCircuit = "Feeder F4 (EV Fast-Charging Hub)";
            insp.operatingTemp = 42.8f;
            insp.operationalStatus = "CHARGING ACTIVE";
            insp.description = "60+ commercial delivery vans and private EVs actively charging with smart dynamic throttling capability.";

            return root;
        }

        // ==========================================
        // 15. URBAN LANDSCAPING, TREES & STREETLIGHTS
        // ==========================================
        private void CreateUrbanLandscapingAndStreetlights()
        {
            GameObject detailsRoot = new GameObject("Landscaping_And_Streetlights");
            detailsRoot.transform.parent = transform;

            for (float x = -40f; x <= 40f; x += 20f)
            {
                CreateStreetlight(detailsRoot.transform, new Vector3(x, 0, 7.5f));
                CreateStreetlight(detailsRoot.transform, new Vector3(x, 0, -7.5f));
            }

            for (int i = 0; i < 30; i++)
            {
                float x = Random.Range(-50f, 50f);
                float z = Random.Range(-50f, 50f);
                if (Mathf.Abs(x) < 7f || Mathf.Abs(z) < 7f) continue;
                if (Mathf.Abs(x - 28f) < 5f && z > 0) continue;

                GameObject tree = new GameObject($"Tree_{i}");
                tree.transform.parent = detailsRoot.transform;
                tree.transform.localPosition = new Vector3(x, 0, z);

                GameObject trunk = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
                trunk.transform.parent = tree.transform;
                trunk.transform.localPosition = new Vector3(0, 1.2f, 0);
                trunk.transform.localScale = new Vector3(0.35f, 1.2f, 0.35f);
                SetObjectColor(trunk, new Color(0.35f, 0.22f, 0.12f));

                GameObject foliage = GameObject.CreatePrimitive(PrimitiveType.Sphere);
                foliage.transform.parent = tree.transform;
                foliage.transform.localPosition = new Vector3(0, 3.2f, 0);
                foliage.transform.localScale = new Vector3(2.4f, 2.6f, 2.4f);
                SetObjectColor(foliage, new Color(0.12f, 0.45f, 0.18f));
            }
        }

        private void CreateStreetlight(Transform parent, Vector3 pos)
        {
            GameObject post = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            post.name = "Streetlight";
            post.transform.parent = parent;
            post.transform.localPosition = new Vector3(pos.x, 3.5f, pos.z);
            post.transform.localScale = new Vector3(0.2f, 3.5f, 0.2f);
            SetObjectColor(post, new Color(0.4f, 0.45f, 0.5f));

            GameObject lamp = GameObject.CreatePrimitive(PrimitiveType.Cube);
            lamp.transform.parent = post.transform;
            lamp.transform.localPosition = new Vector3(0, 0.95f, 0.8f);
            lamp.transform.localScale = new Vector3(0.8f, 0.2f, 2.0f);
            SetObjectColor(lamp, Color.yellow);
        }

        // ==========================================
        // 16. PHYSICAL ELECTRICAL PATHWAY (ANIMATED)
        // ==========================================
        private void WirePhysicalElectricalGrid(GameObject gen, GameObject t1, GameObject t2, GameObject sub, GameObject hosp, GameObject com, GameObject res, GameObject ind, GameObject dc, GameObject sol, GameObject wind, GameObject bess, GameObject ev)
        {
            List<PowerFlowVisualizer> lines = new List<PowerFlowVisualizer>();

            Vector3 pGen = gen.transform.position + new Vector3(0, 10f, 0);
            Vector3 pT1 = t1.transform.position + new Vector3(0, 15f, 0);
            Vector3 pT2 = t2.transform.position + new Vector3(0, 15f, 0);
            Vector3 pSub = sub.transform.position + new Vector3(0, 6f, 0);

            // 1. High Voltage 220 kV Pathway: Gen -> Towers -> Substation
            lines.Add(CreatePowerLine("Trans_Gen_To_T1", pGen, pT1, 0.45f, Color.cyan));
            lines.Add(CreatePowerLine("Trans_T1_To_T2", pT1, pT2, 0.45f, Color.cyan));
            lines.Add(CreatePowerLine("Trans_T2_To_Sub", pT2, pSub, 0.45f, Color.cyan));

            // 2. Medium Voltage 11 kV Feeders: Substation -> City Loads
            lines.Add(CreatePowerLine("Feeder_Hospital_F1", pSub, hosp.transform.position + new Vector3(0, 6f, 0), 0.35f, Color.green));
            lines.Add(CreatePowerLine("Feeder_Commercial_F2", pSub, com.transform.position + new Vector3(0, 5f, 0), 0.28f, Color.cyan));
            lines.Add(CreatePowerLine("Feeder_Residential_F3", pSub, res.transform.position + new Vector3(0, 4f, 0), 0.28f, Color.cyan));
            lines.Add(CreatePowerLine("Feeder_Industrial_F4", pSub, ind.transform.position + new Vector3(0, 6f, 0), 0.38f, Color.cyan));
            lines.Add(CreatePowerLine("Feeder_DataCenter_F2B", pSub, dc.transform.position + new Vector3(0, 5f, 0), 0.30f, Color.cyan));
            lines.Add(CreatePowerLine("Feeder_EVPlaza_F4B", pSub, ev.transform.position + new Vector3(0, 4.5f, 0), 0.35f, Color.cyan));

            // 3. Renewable & Storage Interconnects
            lines.Add(CreatePowerLine("Interconnect_Solar", sol.transform.position + new Vector3(0, 3f, 0), pSub, 0.28f, Color.yellow));
            lines.Add(CreatePowerLine("Interconnect_Wind", wind.transform.position + new Vector3(0, 5f, 0), pSub, 0.28f, Color.cyan));
            lines.Add(CreatePowerLine("Interconnect_BESS", bess.transform.position + new Vector3(0, 3.5f, 0), pSub, 0.38f, Color.green));

            if (GridManager.Instance != null)
            {
                GridManager.Instance.powerLines = lines;
            }
        }

        private PowerFlowVisualizer CreatePowerLine(string lineName, Vector3 start, Vector3 end, float width, Color initialColor)
        {
            GameObject lineObj = new GameObject(lineName);
            lineObj.transform.parent = transform;

            LineRenderer lr = lineObj.AddComponent<LineRenderer>();
            lr.positionCount = 3;

            Vector3 mid = (start + end) * 0.5f + Vector3.up * 2.2f;
            lr.SetPosition(0, start);
            lr.SetPosition(1, mid);
            lr.SetPosition(2, end);

            lr.startWidth = width;
            lr.endWidth = width;

            PowerFlowVisualizer pfv = lineObj.AddComponent<PowerFlowVisualizer>();
            return pfv;
        }

        private void CreateBuildingSign(Transform parent, Vector3 localPos, string text, Color color)
        {
            GameObject signObj = GameObject.CreatePrimitive(PrimitiveType.Cube);
            signObj.name = "Sign_" + text.Replace(" ", "_");
            signObj.transform.parent = parent;
            signObj.transform.localPosition = localPos;
            signObj.transform.localScale = new Vector3(Mathf.Max(6f, text.Length * 0.45f), 1.2f, 0.3f);
            SetObjectColor(signObj, new Color(0.08f, 0.12f, 0.18f));
        }

        private void SetObjectColor(GameObject obj, Color col, float smoothness = 0.4f)
        {
            Renderer r = obj.GetComponent<Renderer>();
            if (r != null)
            {
                Material m = new Material(Shader.Find("Standard"));
                m.color = col;
                m.SetFloat("_Glossiness", smoothness);
                r.material = m;
            }
        }
    }
}
