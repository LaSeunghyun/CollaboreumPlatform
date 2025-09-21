import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

interface HistoryEntry {
  view: string;
  params?: {
    selectedArtistId?: number | null;
    selectedProjectId?: number | null;
    selectedEventId?: string | null;
    selectedPostId?: string | null;
    searchQuery?: string;
  };
  timestamp: number;
}

interface HistoryContextType {
  history: HistoryEntry[];
  currentIndex: number;
  canGoBack: boolean;
  canGoForward: boolean;
  navigateTo: (view: string, params?: HistoryEntry['params']) => void;
  goBack: () => void;
  goForward: () => void;
  clearHistory: () => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

interface HistoryProviderProps {
  children: ReactNode;
}

export const HistoryProvider: React.FC<HistoryProviderProps> = ({
  children,
}) => {
  const [history, setHistory] = useState<HistoryEntry[]>([
    { view: 'home', params: {}, timestamp: Date.now() },
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < history.length - 1;

  const navigateTo = (view: string, params?: HistoryEntry['params']) => {
    const newEntry: HistoryEntry = {
      view,
      params: params || {},
      timestamp: Date.now(),
    };

    // 현재 인덱스 이후의 히스토리를 제거하고 새 엔트리 추가
    const newHistory = (Array.isArray(history) ? history : []).slice(
      0,
      currentIndex + 1,
    );
    newHistory.push(newEntry);

    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  };

  const goBack = () => {
    if (canGoBack) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goForward = () => {
    if (canGoForward) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const clearHistory = () => {
    setHistory([{ view: 'home', params: {}, timestamp: Date.now() }]);
    setCurrentIndex(0);
  };

  // 브라우저의 뒤로가기/앞으로가기 버튼 처리
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && typeof event.state.index === 'number') {
        setCurrentIndex(event.state.index);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 히스토리 변경 시 브라우저 히스토리 업데이트
  useEffect(() => {
    const currentEntry = history[currentIndex];
    if (currentEntry) {
      // 브라우저 히스토리에 상태 저장
      window.history.replaceState(
        {
          index: currentIndex,
          view: currentEntry.view,
          params: currentEntry.params,
        },
        '',
        window.location.href,
      );
    }
  }, [currentIndex, history]);

  const value: HistoryContextType = {
    history,
    currentIndex,
    canGoBack,
    canGoForward,
    navigateTo,
    goBack,
    goForward,
    clearHistory,
  };

  return (
    <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>
  );
};

export const useHistory = (): HistoryContextType => {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};
