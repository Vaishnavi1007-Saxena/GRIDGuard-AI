using System.Collections.Generic;
using UnityEngine;

namespace GridGuard
{
    public class TrafficManager : MonoBehaviour
    {
        public int carCount = 12;
        public float roadBounds = 45f;
        public float speed = 8f;

        private struct Vehicle
        {
            public GameObject obj;
            public Vector3 direction;
            public float speed;
            public bool isAmbulance;
        }

        private List<Vehicle> vehicles = new List<Vehicle>();

        private void Start()
        {
            SpawnVehicles();
        }

        private void SpawnVehicles()
        {
            Color[] colors = { Color.cyan, Color.red, Color.yellow, Color.white, new Color(0.2f, 0.6f, 1f) };

            for (int i = 0; i < carCount; i++)
            {
                bool isEastWest = (i % 2 == 0);
                bool isAmbulance = (i == 0);

                GameObject car = GameObject.CreatePrimitive(PrimitiveType.Cube);
                car.name = isAmbulance ? "Emergency_Ambulance" : $"City_Vehicle_{i}";
                car.transform.parent = transform;

                float x = isEastWest ? Random.Range(-roadBounds, roadBounds) : (i % 4 == 0 ? 5f : -5f);
                float z = !isEastWest ? Random.Range(-roadBounds, roadBounds) : (i % 4 == 2 ? 8f : -8f);

                car.transform.localPosition = new Vector3(x, 0.6f, z);
                car.transform.localScale = isAmbulance ? new Vector3(1.8f, 1.4f, 3.8f) : new Vector3(1.6f, 1.0f, 3.2f);

                Renderer r = car.GetComponent<Renderer>();
                if (r != null)
                {
                    Material m = new Material(Shader.Find("Standard"));
                    m.color = isAmbulance ? Color.white : colors[i % colors.Length];
                    r.material = m;
                }

                // Add ambulance beacon
                if (isAmbulance)
                {
                    GameObject beacon = new GameObject("Ambulance_Beacon");
                    beacon.transform.parent = car.transform;
                    beacon.transform.localPosition = new Vector3(0, 1.2f, 0);
                    Light l = beacon.AddComponent<Light>();
                    l.type = LightType.Point;
                    l.range = 8f;
                    l.color = Color.red;
                    l.intensity = 2f;
                }

                Vector3 dir = isEastWest ? Vector3.right : Vector3.forward;
                if (Random.value > 0.5f) dir = -dir;

                car.transform.rotation = Quaternion.LookRotation(dir);

                vehicles.Add(new Vehicle
                {
                    obj = car,
                    direction = dir,
                    speed = isAmbulance ? speed * 1.4f : speed * Random.Range(0.8f, 1.2f),
                    isAmbulance = isAmbulance
                });
            }
        }

        private void Update()
        {
            for (int i = 0; i < vehicles.Count; i++)
            {
                Vehicle v = vehicles[i];
                if (v.obj == null) continue;

                v.obj.transform.position += v.direction * (v.speed * Time.deltaTime);

                // Wrap around road bounds
                Vector3 pos = v.obj.transform.position;
                if (pos.x > roadBounds) pos.x = -roadBounds;
                else if (pos.x < -roadBounds) pos.x = roadBounds;

                if (pos.z > roadBounds) pos.z = -roadBounds;
                else if (pos.z < -roadBounds) pos.z = roadBounds;

                v.obj.transform.position = pos;
            }
        }
    }
}
