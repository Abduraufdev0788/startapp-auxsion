import json
from typing import Dict, List, Set
from fastapi import WebSocket
from app.core.logging import logger
from app.websocket.events import WSEvent


class ConnectionManager:
    """Manages active WebSocket connections grouped by auction rooms and users."""

    def __init__(self):
        # auction_id -> set of WebSocket connections
        self.auction_rooms: Dict[str, Set[WebSocket]] = {}
        # user_id -> set of WebSocket connections
        self.user_connections: Dict[str, Set[WebSocket]] = {}

    async def connect_auction(self, websocket: WebSocket, auction_id: str) -> None:
        await websocket.accept()
        if auction_id not in self.auction_rooms:
            self.auction_rooms[auction_id] = set()
        self.auction_rooms[auction_id].add(websocket)
        logger.info(f"WebSocket client connected to auction {auction_id}")

    def disconnect_auction(self, websocket: WebSocket, auction_id: str) -> None:
        if auction_id in self.auction_rooms:
            self.auction_rooms[auction_id].discard(websocket)
            if not self.auction_rooms[auction_id]:
                del self.auction_rooms[auction_id]
        logger.info(f"WebSocket client disconnected from auction {auction_id}")

    async def broadcast_to_auction(self, auction_id: str, event: WSEvent) -> None:
        if auction_id not in self.auction_rooms:
            return

        payload = event.model_dump_json()
        disconnected: List[WebSocket] = []

        for connection in list(self.auction_rooms[auction_id]):
            try:
                await connection.send_text(payload)
            except Exception as e:
                logger.warning(f"Error sending WS event to client: {e}")
                disconnected.append(connection)

        for conn in disconnected:
            self.auction_rooms[auction_id].discard(conn)


manager = ConnectionManager()

