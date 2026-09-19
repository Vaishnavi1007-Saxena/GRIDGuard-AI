using UnityEngine;

namespace GridGuard
{
    public class EVController : MonoBehaviour
    {
        public float demandKw = 180f;
        public bool isCurtailed = false;
        private FloatingLabel floatingLabel;
        private Light surgeLight;

        private void Awake()
        {
            floatingLabel = GetComponent<FloatingLabel>();
            surgeLight = GetComponentInChildren<Light>();
        }

        public void UpdateEVPlaza(float kw, bool curtailed)
        {
            demandKw = kw;
            isCurtailed = curtailed;

            Color statusColor = Color.green;
            string statusText = $"Demand: {kw:F0} kW";

            if (curtailed)
            {
                statusColor = Color.cyan;
                statusText = $"THROTTLED: {kw:F0} kW (-50%)";
                if (surgeLight != null) { surgeLight.enabled = true; surgeLight.color = Color.cyan; }
            }
            else if (kw > 350f)
            {
                statusColor = Color.red;
                statusText = $"SURGE: {kw:F0} kW (+150%)";
                if (surgeLight != null) { surgeLight.enabled = true; surgeLight.color = Color.red; }
            }
            else
            {
                if (surgeLight != null) surgeLight.enabled = false;
            }

            if (floatingLabel != null)
            {
                floatingLabel.UpdateText("EV Charging Plaza", statusText, statusColor);
            }
        }
    }
}
