using UnityEngine;

namespace GridGuard
{
    public class BatteryController : MonoBehaviour
    {
        public float socPct = 82f;
        public bool isDischarging = false;
        private FloatingLabel floatingLabel;
        private Light chargeGlow;

        private void Awake()
        {
            floatingLabel = GetComponent<FloatingLabel>();
            chargeGlow = GetComponentInChildren<Light>();
        }

        public void UpdateBattery(float soc, bool discharging)
        {
            socPct = soc;
            isDischarging = discharging;

            Color statusColor = isDischarging ? Color.cyan : Color.green;
            string statusText = isDischarging ? $"DISCHARGING (SOC: {soc:F0}%)" : $"Standby (SOC: {soc:F0}%)";

            if (chargeGlow != null)
            {
                chargeGlow.enabled = isDischarging;
                chargeGlow.color = Color.cyan;
                chargeGlow.intensity = isDischarging ? 2.0f : 0.5f;
            }

            if (floatingLabel != null)
            {
                floatingLabel.UpdateText("BESS Battery Storage", statusText, statusColor);
            }
        }
    }
}
