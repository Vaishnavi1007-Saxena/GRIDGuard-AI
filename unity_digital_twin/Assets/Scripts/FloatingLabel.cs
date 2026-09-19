using UnityEngine;

namespace GridGuard
{
    public class FloatingLabel : MonoBehaviour
    {
        public string title = "Component";
        public string subtitle = "Status: OK";
        public Color titleColor = Color.cyan;
        public Color subtitleColor = Color.white;
        public Vector3 offset = new Vector3(0, 3.5f, 0);

        private Camera mainCamera;
        private GUIStyle titleStyle;
        private GUIStyle subStyle;

        private void Start()
        {
            mainCamera = Camera.main;
        }

        public void UpdateText(string newTitle, string newSubtitle, Color statusColor)
        {
            title = newTitle;
            subtitle = newSubtitle;
            subtitleColor = statusColor;
        }

        private void OnGUI()
        {
            if (mainCamera == null) mainCamera = Camera.main;
            if (mainCamera == null) return;

            Vector3 worldPos = transform.position + offset;
            float distance = Vector3.Distance(mainCamera.transform.position, worldPos);

            // Don't draw if behind camera or too far
            if (Vector3.Dot(mainCamera.transform.forward, worldPos - mainCamera.transform.position) <= 0 || distance > 85f)
                return;

            Vector3 screenPos = mainCamera.WorldToScreenPoint(worldPos);
            float screenY = Screen.height - screenPos.y;

            if (titleStyle == null)
            {
                titleStyle = new GUIStyle(GUI.skin.label);
                titleStyle.fontStyle = FontStyle.Bold;
                titleStyle.fontSize = 11;
                titleStyle.alignment = TextAnchor.MiddleCenter;
            }

            if (subStyle == null)
            {
                subStyle = new GUIStyle(GUI.skin.label);
                subStyle.fontSize = 10;
                subStyle.alignment = TextAnchor.MiddleCenter;
            }

            titleStyle.normal.textColor = titleColor;
            subStyle.normal.textColor = subtitleColor;

            // Background box
            Rect boxRect = new Rect(screenPos.x - 70, screenY - 22, 140, 36);
            GUI.Box(boxRect, GUIContent.none);
            GUI.Label(new Rect(screenPos.x - 70, screenY - 22, 140, 18), title, titleStyle);
            GUI.Label(new Rect(screenPos.x - 70, screenY - 6, 140, 18), subtitle, subStyle);
        }
    }
}
