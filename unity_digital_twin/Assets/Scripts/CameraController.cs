using UnityEngine;

namespace GridGuard
{
    public class CameraController : MonoBehaviour
    {
        public static CameraController Instance { get; private set; }

        public float moveSpeed = 22f;
        public float fastMoveFactor = 2.2f;
        public float rotateSpeed = 3f;
        public float zoomSpeed = 25f;

        private Vector3 targetPosition;
        private Quaternion targetRotation;
        private bool isTransitioning = false;
        private float transitionSpeed = 3.5f;

        public bool isStreetLevelMode = false;

        // 10 Camera Viewpoint Presets
        public readonly Vector3 posOverview       = new Vector3(0f, 52f, -62f);
        public readonly Quaternion rotOverview    = Quaternion.Euler(40f, 0f, 0f);

        public readonly Vector3 posSubstation     = new Vector3(-24f, 18f, -22f);
        public readonly Quaternion rotSubstation  = Quaternion.Euler(32f, 38f, 0f);

        public readonly Vector3 posTransformer    = new Vector3(-17f, 9f, -12f);
        public readonly Quaternion rotTransformer = Quaternion.Euler(24f, 25f, 0f);

        public readonly Vector3 posResidential    = new Vector3(36f, 16f, 14f);
        public readonly Quaternion rotResidential = Quaternion.Euler(28f, -25f, 0f);

        public readonly Vector3 posIndustrial     = new Vector3(-28f, 20f, 15f);
        public readonly Quaternion rotIndustrial  = Quaternion.Euler(30f, 42f, 0f);

        public readonly Vector3 posHospital       = new Vector3(26f, 16f, -10f);
        public readonly Quaternion rotHospital    = Quaternion.Euler(26f, -20f, 0f);

        public readonly Vector3 posPharmacy       = new Vector3(14f, 9f, 18f);
        public readonly Quaternion rotPharmacy    = Quaternion.Euler(20f, -30f, 0f);

        public readonly Vector3 posEVStation      = new Vector3(24f, 12f, -32f);
        public readonly Quaternion rotEVStation   = Quaternion.Euler(26f, -40f, 0f);

        public readonly Vector3 posSolarFarm      = new Vector3(-38f, 16f, -18f);
        public readonly Quaternion rotSolarFarm   = Quaternion.Euler(32f, 50f, 0f);

        public readonly Vector3 posBESS           = new Vector3(-6f, 12f, -40f);
        public readonly Quaternion rotBESS        = Quaternion.Euler(24f, 10f, 0f);

        public readonly Vector3 posStreetLevel    = new Vector3(4f, 2.2f, -10f);
        public readonly Quaternion rotStreetLevel = Quaternion.Euler(5f, 15f, 0f);

        private void Awake()
        {
            Instance = this;
        }

        private void Start()
        {
            SetViewPreset(posOverview, rotOverview);
        }

        private void Update()
        {
            // Keyboard hotkeys for presets
            if (Input.GetKeyDown(KeyCode.Alpha1)) SetViewPreset(posOverview, rotOverview);
            if (Input.GetKeyDown(KeyCode.Alpha2)) SetViewPreset(posSubstation, rotSubstation);
            if (Input.GetKeyDown(KeyCode.Alpha3)) SetViewPreset(posTransformer, rotTransformer);
            if (Input.GetKeyDown(KeyCode.Alpha4)) SetViewPreset(posResidential, rotResidential);
            if (Input.GetKeyDown(KeyCode.Alpha5)) SetViewPreset(posIndustrial, rotIndustrial);
            if (Input.GetKeyDown(KeyCode.Alpha6)) SetViewPreset(posHospital, rotHospital);
            if (Input.GetKeyDown(KeyCode.Alpha7)) SetViewPreset(posPharmacy, rotPharmacy);
            if (Input.GetKeyDown(KeyCode.Alpha8)) SetViewPreset(posEVStation, rotEVStation);
            if (Input.GetKeyDown(KeyCode.Alpha9)) SetViewPreset(posSolarFarm, rotSolarFarm);
            if (Input.GetKeyDown(KeyCode.Alpha0)) SetViewPreset(posBESS, rotBESS);
            if (Input.GetKeyDown(KeyCode.V)) ToggleStreetLevelView();

            if (isTransitioning)
            {
                transform.position = Vector3.Lerp(transform.position, targetPosition, Time.deltaTime * transitionSpeed);
                transform.rotation = Quaternion.Slerp(transform.rotation, targetRotation, Time.deltaTime * transitionSpeed);

                if (Vector3.Distance(transform.position, targetPosition) < 0.15f)
                {
                    isTransitioning = false;
                }
            }

            HandleMovement();
            HandleObjectClick();
        }

        private void HandleMovement()
        {
            float speed = moveSpeed * (Input.GetKey(KeyCode.LeftShift) ? fastMoveFactor : 1f);
            if (isStreetLevelMode) speed = 8f * (Input.GetKey(KeyCode.LeftShift) ? 1.8f : 1f);

            float h = Input.GetAxis("Horizontal"); // A/D
            float v = Input.GetAxis("Vertical");   // W/S
            float elevation = 0f;

            if (Input.GetKey(KeyCode.E)) elevation += 1f;
            if (Input.GetKey(KeyCode.Q)) elevation -= 1f;

            Vector3 move = (transform.forward * v + transform.right * h + Vector3.up * elevation) * (speed * Time.deltaTime);

            if (move.sqrMagnitude > 0.0001f)
            {
                isTransitioning = false;
                transform.position += move;
                if (isStreetLevelMode && transform.position.y < 1.8f)
                {
                    Vector3 p = transform.position;
                    p.y = 1.8f;
                    transform.position = p;
                }
            }

            // Mouse Look (Right Mouse Button held)
            if (Input.GetMouseButton(1))
            {
                isTransitioning = false;
                float mouseX = Input.GetAxis("Mouse X") * rotateSpeed;
                float mouseY = -Input.GetAxis("Mouse Y") * rotateSpeed;
                transform.eulerAngles += new Vector3(mouseY, mouseX, 0f);
            }

            // Mouse Wheel Zoom
            float scroll = Input.GetAxis("Mouse ScrollWheel");
            if (Mathf.Abs(scroll) > 0.01f && !isStreetLevelMode)
            {
                isTransitioning = false;
                transform.position += transform.forward * (scroll * zoomSpeed);
            }
        }

        private void HandleObjectClick()
        {
            if (Input.GetMouseButtonDown(0))
            {
                // Raycast from camera to inspect objects
                Ray ray = Camera.main != null ? Camera.main.ScreenPointToRay(Input.mousePosition) : GetComponent<Camera>().ScreenPointToRay(Input.mousePosition);
                RaycastHit hit;
                if (Physics.Raycast(ray, out hit, 300f))
                {
                    InspectableObject info = hit.collider.GetComponentInParent<InspectableObject>();
                    if (info != null && HUDManager.Instance != null)
                    {
                        HUDManager.Instance.SelectObject(info);
                    }
                }
            }
        }

        public void SetViewPreset(Vector3 pos, Quaternion rot)
        {
            targetPosition = pos;
            targetRotation = rot;
            isTransitioning = true;
            isStreetLevelMode = false;
        }

        public void ToggleStreetLevelView()
        {
            if (!isStreetLevelMode)
            {
                isStreetLevelMode = true;
                SetViewPreset(posStreetLevel, rotStreetLevel);
            }
            else
            {
                isStreetLevelMode = false;
                SetViewPreset(posOverview, rotOverview);
            }
        }

        public void SetViewByName(string viewName)
        {
            switch (viewName.ToLower())
            {
                case "overview":     SetViewPreset(posOverview, rotOverview); break;
                case "substation":   SetViewPreset(posSubstation, rotSubstation); break;
                case "transformer":  SetViewPreset(posTransformer, rotTransformer); break;
                case "residential":  SetViewPreset(posResidential, rotResidential); break;
                case "industrial":   SetViewPreset(posIndustrial, rotIndustrial); break;
                case "hospital":     SetViewPreset(posHospital, rotHospital); break;
                case "pharmacy":     SetViewPreset(posPharmacy, rotPharmacy); break;
                case "ev":           SetViewPreset(posEVStation, rotEVStation); break;
                case "solar":        SetViewPreset(posSolarFarm, rotSolarFarm); break;
                case "bess":         SetViewPreset(posBESS, rotBESS); break;
                case "street":       ToggleStreetLevelView(); break;
            }
        }
    }
}
