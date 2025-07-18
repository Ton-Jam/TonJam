import { useState, useEffect } from "react";

const useInfiniteScroll = (initialData: any[], batchSize = 10) => {
  const [displayedData, setDisplayedData] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(batchSize);

  useEffect(() => {
    setDisplayedData(initialData.slice(0, visibleCount));
  }, [visibleCount, initialData]);

  const loadMore = () => {
    setVisibleCount(prev => prev + batchSize);
  };

  return { displayedData, loadMore };
};

export default useInfiniteScroll;
