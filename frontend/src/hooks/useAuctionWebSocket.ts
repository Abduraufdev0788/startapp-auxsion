import { useEffect, useRef, useState, useCallback } from 'react';

export interface BidEventData {
  auction_id: string;
  bid_id: string;
  amount: number; // in tiyin
  created_at: string;
  new_highest_bid: number; // in tiyin
  end_time?: string;
  bidder_name?: string;
}

export interface AuctionCompletedEventData {
  auction_id: string;
  status: string;
  highest_bid: number;
  winner_id?: string;
}

interface UseAuctionWebSocketOptions {
  auctionId: string | undefined;
  onBidCreated?: (data: BidEventData) => void;
  onAuctionCompleted?: (data: AuctionCompletedEventData) => void;
}

export const useAuctionWebSocket = ({
  auctionId,
  onBidCreated,
  onAuctionCompleted,
}: UseAuctionWebSocketOptions) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    if (!auctionId) return;

    // Build WS URL
    const envWsUrl = import.meta.env.VITE_WS_URL;
    let wsBase = envWsUrl || 'ws://localhost:8000/api/v1';
    // Remove trailing /ws or / to prevent duplicate /ws/ws/ paths
    wsBase = wsBase.replace(/\/ws\/?$/, '').replace(/\/$/, '');
    const socketUrl = `${wsBase}/ws/auctions/${auctionId}`;

    try {
      const ws = new WebSocket(socketUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.event === 'auction.bid.created' && onBidCreated) {
            onBidCreated(payload.data);
          } else if (payload.event === 'auction.completed' && onAuctionCompleted) {
            onAuctionCompleted(payload.data);
          }
        } catch {
          // ignore non-json ping/pongs
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Attempt reconnection after 3 seconds if component is still mounted
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      setIsConnected(false);
    }
  }, [auctionId, onBidCreated, onAuctionCompleted]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { isConnected };
};
