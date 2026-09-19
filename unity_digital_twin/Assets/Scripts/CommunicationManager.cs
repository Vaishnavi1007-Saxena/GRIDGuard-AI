using System;
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;

namespace GridGuard
{
    public class CommunicationManager : MonoBehaviour
    {
        public static CommunicationManager Instance { get; private set; }

        [Header("Backend API Configuration")]
        public string backendBaseUrl = "http://127.0.0.1:8000";
        public string activeProjectId = "";
        public float pollingInterval = 1.5f;
        public bool connectToLiveBackend = false;
        public bool isConnected = false;

        private void Awake()
        {
            if (Instance == null) Instance = this;
            else Destroy(gameObject);
        }

        private void Start()
        {
            StartCoroutine(PollingRoutine());
        }

        public void ToggleLiveBackendConnection(bool enable)
        {
            connectToLiveBackend = enable;
        }

        private IEnumerator PollingRoutine()
        {
            while (true)
            {
                if (connectToLiveBackend)
                {
                    yield return FetchTelemetryFromBackend();
                }
                yield return new WaitForSeconds(pollingInterval);
            }
        }

        private IEnumerator FetchTelemetryFromBackend()
        {
            string url = $"{backendBaseUrl}/api/projects/{activeProjectId}/telemetry";
            if (string.IsNullOrEmpty(activeProjectId))
            {
                // Fallback to latest project
                url = $"{backendBaseUrl}/health";
            }

            using (UnityWebRequest req = UnityWebRequest.Get(url))
            {
                req.timeout = 2;
                yield return req.SendWebRequest();

                if (req.result == UnityWebRequest.Result.Success)
                {
                    isConnected = true;
                    string json = req.downloadHandler.text;
                    try
                    {
                        GridTelemetryData telem = JsonUtility.FromJson<GridTelemetryData>(json);
                        if (telem != null && GridManager.Instance != null && !GridManager.Instance.isRunningDemoScenario)
                        {
                            GridManager.Instance.ApplyTelemetry(telem);
                        }
                    }
                    catch (Exception ex)
                    {
                        Debug.LogWarning($"[GridGuard Comms] JSON parse warning: {ex.Message}");
                    }
                }
                else
                {
                    isConnected = false;
                }
            }
        }
    }
}
