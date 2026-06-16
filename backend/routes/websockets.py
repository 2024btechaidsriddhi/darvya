from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Request

router = APIRouter()

@router.websocket("/ws/live-transactions")
async def websocket_endpoint(websocket: WebSocket):
    manager = websocket.app.state.ws_manager
    await manager.connect(websocket)
    try:
        while True:
            # We don't generate mock data here. We wait for events pushed from /predict
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
