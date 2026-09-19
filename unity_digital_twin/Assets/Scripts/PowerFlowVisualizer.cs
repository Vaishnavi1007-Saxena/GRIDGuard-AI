using UnityEngine;

namespace GridGuard
{
    [RequireComponent(typeof(LineRenderer))]
    public class PowerFlowVisualizer : MonoBehaviour
    {
        public enum FlowState { Normal, Warning, Critical, Fault }
        public FlowState currentState = FlowState.Normal;
        public float scrollSpeed = 2.0f;

        private LineRenderer lineRenderer;
        private Material lineMaterial;
        private float textureOffset = 0f;

        private Color colorNormal = new Color(0f, 0.95f, 1f, 0.9f);    // Cyan
        private Color colorWarning = new Color(1f, 0.7f, 0f, 0.9f);    // Amber
        private Color colorCritical = new Color(1f, 0.2f, 0.1f, 1f);   // Red
        private Color colorFault = new Color(0.3f, 0.3f, 0.3f, 0.5f);  // Dim / Tripped

        private void Awake()
        {
            lineRenderer = GetComponent<LineRenderer>();
            // Create a dedicated material instance so we don't modify shared assets
            lineMaterial = new Material(Shader.Find("Sprites/Default"));
            lineRenderer.material = lineMaterial;
            lineRenderer.startWidth = 0.25f;
            lineRenderer.endWidth = 0.25f;
            SetFlowState(FlowState.Normal);
        }

        private void Update()
        {
            if (currentState == FlowState.Fault) return;

            textureOffset -= Time.deltaTime * scrollSpeed;
            if (lineMaterial != null)
            {
                lineMaterial.mainTextureOffset = new Vector2(textureOffset, 0);
            }
        }

        public void SetFlowState(FlowState newState)
        {
            currentState = newState;
            Color targetColor = colorNormal;
            float pulseWidth = 0.25f;

            switch (newState)
            {
                case FlowState.Normal:
                    targetColor = colorNormal;
                    scrollSpeed = 2.0f;
                    pulseWidth = 0.22f;
                    break;
                case FlowState.Warning:
                    targetColor = colorWarning;
                    scrollSpeed = 3.5f;
                    pulseWidth = 0.35f;
                    break;
                case FlowState.Critical:
                    targetColor = colorCritical;
                    scrollSpeed = 5.0f;
                    pulseWidth = 0.45f;
                    break;
                case FlowState.Fault:
                    targetColor = colorFault;
                    scrollSpeed = 0f;
                    pulseWidth = 0.15f;
                    break;
            }

            if (lineRenderer != null)
            {
                lineRenderer.startColor = targetColor;
                lineRenderer.endColor = targetColor;
                lineRenderer.startWidth = pulseWidth;
                lineRenderer.endWidth = pulseWidth;
            }
        }
    }
}
