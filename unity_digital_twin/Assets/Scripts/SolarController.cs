using UnityEngine;

namespace GridGuard
{
    public class SolarController : MonoBehaviour
    {
        public float generationKw = 520f;
        private FloatingLabel floatingLabel;
        private Light sunGlow;

        private void Awake()
        {
            floatingLabel = GetComponent<FloatingLabel>();
            sunGlow = GetComponentInChildren<Light>();
        }

        public void UpdateGeneration(float kw)
        {
            generationKw = kw;
            Color statusColor = Color.yellow;
            string statusText = $"Output: {kw:F0} kW";

            if (kw < 200f)
            {
                statusColor = new Color(1f, 0.4f, 0f);
                statusText = $"DROP: {kw:F0} kW (-65%)";
                if (sunGlow != null) sunGlow.intensity = 0.3f;
            }
            else
            {
                if (sunGlow != null) sunGlow.intensity = 1.2f;
            }

            if (floatingLabel != null)
            {
                floatingLabel.UpdateText("Solar PV Farm", statusText, statusColor);
            }
        }
    }
}
