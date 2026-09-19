using UnityEngine;

namespace GridGuard
{
    public class HospitalController : MonoBehaviour
    {
        public bool isProtected = true;
        private FloatingLabel floatingLabel;
        private Light priorityBeacon;

        private void Awake()
        {
            floatingLabel = GetComponent<FloatingLabel>();
            priorityBeacon = GetComponentInChildren<Light>();
        }

        private void Start()
        {
            UpdateStatus(true);
        }

        public void UpdateStatus(bool safe)
        {
            isProtected = safe;
            Color statusColor = safe ? new Color(0f, 1f, 0.5f) : Color.red;
            string statusText = safe ? "PRIORITY FEEDER (PROTECTED)" : "UNSAFE CONDITION";

            if (priorityBeacon != null)
            {
                priorityBeacon.enabled = true;
                priorityBeacon.color = safe ? Color.green : Color.red;
                priorityBeacon.intensity = 2.5f;
            }

            if (floatingLabel != null)
            {
                floatingLabel.UpdateText("Metropolitan Hospital", statusText, statusColor);
            }
        }
    }
}
