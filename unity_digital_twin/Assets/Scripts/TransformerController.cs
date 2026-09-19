using UnityEngine;

namespace GridGuard
{
    public class TransformerController : MonoBehaviour
    {
        public string transformerId = "Transformer T1";
        public float currentLoading = 62.0f; // percentage
        private FloatingLabel floatingLabel;
        private Renderer meshRenderer;
        private Light warningLight;

        private void Awake()
        {
            floatingLabel = GetComponent<FloatingLabel>();
            meshRenderer = GetComponentInChildren<Renderer>();
            warningLight = GetComponentInChildren<Light>();
        }

        public void UpdateLoading(float loadingPct)
        {
            currentLoading = loadingPct;
            Color statusColor = Color.green;
            string statusText = $"Loading: {loadingPct:F0}%";

            if (loadingPct > 105f)
            {
                statusColor = Color.red;
                statusText = $"OVERLOAD: {loadingPct:F0}%";
                if (warningLight != null) { warningLight.enabled = true; warningLight.color = Color.red; }
            }
            else if (loadingPct > 85f)
            {
                statusColor = new Color(1f, 0.6f, 0f);
                statusText = $"High Load: {loadingPct:F0}%";
                if (warningLight != null) { warningLight.enabled = true; warningLight.color = Color.yellow; }
            }
            else
            {
                if (warningLight != null) warningLight.enabled = false;
            }

            if (floatingLabel != null)
            {
                floatingLabel.UpdateText(transformerId, statusText, statusColor);
            }
        }
    }
}
