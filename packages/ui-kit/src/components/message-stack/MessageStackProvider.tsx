import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { BluredContainer } from "../blured-container/BluredContainer";
import { InfoMessage } from "../message/InfoMessage";
import type { Message } from "../../types/Message";
import "./message-stack.css";

type MessageEntry = { id: string; message: Message };

export type MessageStackContextValue = {
  pushMessage: (message: Message) => void;
  clearMessages: () => void;
};

const MessageStackContext = createContext<MessageStackContextValue | null>(
  null,
);

const defaultDockStyle: CSSProperties = {
  position: "absolute",
  left: "1rem",
  bottom: "20%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "start",
  alignItems: "end",
  overflow: "hidden",
  maxHeight: "40vh",
};

const HIDE_AFTER_MS = 5000;

export type MessageStackProviderProps = {
  children: ReactNode;
  /** Сколько сообщений одновременно; при переполнении удаляются самые старые. */
  maxMessages?: number;
  className?: string;
  style?: CSSProperties;
};

function MessageStackDock({
  entries,
  className,
  style,
}: {
  entries: MessageEntry[];
  className?: string;
  style?: CSSProperties;
}) {
  const mergedStyle = { ...defaultDockStyle, ...style };

  return (
    <BluredContainer 
    className={`fins-message-stack-dock ph-mid pv-min gap-min ${className}`} 
    style={mergedStyle}>
      <div
        className="fins-message-stack-dock-inner ph-min rounded"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {entries.map(({ id, message }) => (
          <InfoMessage key={id} {...message} />
        ))}
      </div>
    </BluredContainer>
  );
}

export function MessageStackProvider({
  children,
  maxMessages = 50,
  className,
  style,
}: MessageStackProviderProps) {
  const [entries, setEntries] = useState<MessageEntry[]>([]);
  const [dockVisible, setDockVisible] = useState(true);
  const idRef = useRef(0);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleHide = useCallback(() => {
    if (hideTimeoutRef.current !== null) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      setDockVisible(false);
      hideTimeoutRef.current = null;
    }, HIDE_AFTER_MS);
  }, []);

  useEffect(
    () => () => {
      if (hideTimeoutRef.current !== null) {
        clearTimeout(hideTimeoutRef.current);
      }
    },
    [],
  );

  const pushMessage = useCallback(
    (message: Message) => {
      setDockVisible(true);
      if (hideTimeoutRef.current !== null) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      const id = `${++idRef.current}`;
      setEntries((prev) => {
        const next = [...prev, { id, message }];
        if (next.length > maxMessages) {
          return next.slice(next.length - maxMessages);
        }
        return next;
      });
      scheduleHide();
    },
    [maxMessages, scheduleHide],
  );

  const clearMessages = useCallback(() => {
    if (hideTimeoutRef.current !== null) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setEntries([]);
    setDockVisible(true);
  }, []);

  const value = useMemo(
    () => ({ pushMessage, clearMessages }),
    [pushMessage, clearMessages],
  );

  const dock =
    typeof document !== "undefined" && entries.length > 0 ? (
      createPortal(
        <div
          className={
            dockVisible
              ? "fins-message-stack-anim fins-message-stack-anim--visible"
              : "fins-message-stack-anim fins-message-stack-anim--hidden"
          }
        >
          <MessageStackDock
            entries={entries}
            className={`ph-max pv-mid gap-mid ${className ?? ""}`}
            style={style}
          />
        </div>,
        document.body,
      )
    ) : null;

  return (
    <MessageStackContext.Provider value={value}>
      {children}
      {dock}
    </MessageStackContext.Provider>
  );
}

export function useMessageStack(): MessageStackContextValue {
  const ctx = useContext(MessageStackContext);
  if (ctx === null) {
    throw new Error(
      "useMessageStack must be used within MessageStackProvider",
    );
  }
  return ctx;
}
