using UnityEngine;

namespace GridGuard
{
    public class InspectableObject : MonoBehaviour
    {
        public string objectName = "Power Grid Node";
        public string zoneType = "Infrastructure";
        public string voltageLevel = "11 kV";
        public string powerRating = "500 kW";
        public string operationalStatus = "NORMAL";
        public string feederCircuit = "Feeder F1";
        public float operatingTemp = 48.5f;
        public string description = "Essential electrical infrastructure component.";

        private void OnMouseDown()
        {
            if (HUDManager.Instance != null)
            {
                HUDManager.Instance.SelectObject(this);
            }
        }
    }
}
