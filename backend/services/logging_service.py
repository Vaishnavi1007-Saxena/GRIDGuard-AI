import logging
from datetime import datetime
from typing import List, Dict, Any
from backend.models.project_state import ActivityLogItem

logger = logging.getLogger(__name__)

class LoggingService:
    def __init__(self):
        self._logs: Dict[str, List[ActivityLogItem]] = {}

    def log(self, project_id: str, sender: str, receiver: str, action: str, details: str = "") -> ActivityLogItem:
        if project_id not in self._logs:
            self._logs[project_id] = []
        item = ActivityLogItem(
            timestamp=datetime.now().strftime("[%H:%M:%S]"),
            sender=sender,
            receiver=receiver,
            action=action,
            details=details
        )
        self._logs[project_id].append(item)
        logger.info(f"{item.timestamp} [{sender} -> {receiver}] {action} - {details}")
        return item

    def get_logs(self, project_id: str) -> List[ActivityLogItem]:
        return self._logs.get(project_id, [])

logging_service = LoggingService()
