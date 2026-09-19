using System.Collections.Generic;
using UnityEngine;

namespace GridGuard
{
    public class CitizenManager : MonoBehaviour
    {
        public int pedestrianCount = 18;
        public float walkBounds = 40f;
        public float speed = 1.8f;

        private struct Citizen
        {
            public GameObject obj;
            public Vector3 direction;
            public float speed;
        }

        private List<Citizen> citizens = new List<Citizen>();

        private void Start()
        {
            SpawnCitizens();
        }

        private void SpawnCitizens()
        {
            Color[] clothes = { new Color(0.1f, 0.5f, 0.8f), new Color(0.8f, 0.2f, 0.2f), new Color(0.2f, 0.7f, 0.3f), Color.white, new Color(0.9f, 0.6f, 0.1f) };

            for (int i = 0; i < pedestrianCount; i++)
            {
                GameObject ped = GameObject.CreatePrimitive(PrimitiveType.Capsule);
                ped.name = $"Citizen_{i}";
                ped.transform.parent = transform;

                // Position on sidewalks (near buildings)
                float x = Random.Range(-walkBounds, walkBounds);
                float z = (i % 2 == 0) ? Random.Range(10f, 25f) : Random.Range(-25f, -10f);

                ped.transform.localPosition = new Vector3(x, 0.9f, z);
                ped.transform.localScale = new Vector3(0.5f, 0.9f, 0.5f);

                Renderer r = ped.GetComponent<Renderer>();
                if (r != null)
                {
                    Material m = new Material(Shader.Find("Standard"));
                    m.color = clothes[i % clothes.Length];
                    r.material = m;
                }

                Vector3 dir = (Random.value > 0.5f) ? Vector3.right : Vector3.left;
                ped.transform.rotation = Quaternion.LookRotation(dir);

                citizens.Add(new Citizen
                {
                    obj = ped,
                    direction = dir,
                    speed = speed * Random.Range(0.8f, 1.3f)
                });
            }
        }

        private void Update()
        {
            for (int i = 0; i < citizens.Count; i++)
            {
                Citizen c = citizens[i];
                if (c.obj == null) continue;

                c.obj.transform.position += c.direction * (c.speed * Time.deltaTime);

                Vector3 pos = c.obj.transform.position;
                if (pos.x > walkBounds || pos.x < -walkBounds)
                {
                    c.direction = -c.direction;
                    c.obj.transform.rotation = Quaternion.LookRotation(c.direction);
                    citizens[i] = c;
                }
            }
        }
    }
}
