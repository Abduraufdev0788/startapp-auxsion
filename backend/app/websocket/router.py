from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.logging import logger
from app.websocket.manager import manager

router = APIRouter()


@router.websocket("/ws/auctions/{auction_id}")
async def websocket_auction_endpoint(websocket: WebSocket, auction_id: str):
    """WebSocket endpoint for receiving real-time live auction bidding events."""
    await manager.connect_auction(websocket, auction_id)
    try:
        while True:
            # Keep connection alive; clients primarily listen to server events
            data = await websocket.receive_text()
            logger.debug(f"Received WS message from client in auction {auction_id}: {data}")
    except WebSocketDisconnect:
        manager.disconnect_auction(websocket, auction_id)
    except Exception as e:
        logger.error(f"Unexpected WebSocket error: {e}")
        manager.disconnect_auction(websocket, auction_id)

