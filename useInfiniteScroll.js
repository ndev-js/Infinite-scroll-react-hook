import { useState, useEffect, useRef } from "react";

const useInfiniteScroll = (apiEndpoint) => {
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const lastDivRef = useRef(null);
  const currentPageRef = useRef(1);
  const isFetchingRef = useRef(false);

  const loadMoreItems = async () => {
    if (!hasMore || isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;

    try {
      setIsLoading(true);
      const response = await fetch(`${apiEndpoint}${currentPageRef.current}`);
      const data = await response.json();

      setItems((prevItems) => [...prevItems, ...data?.matches]);
      setHasMore(data.matches.length > 0);
      currentPageRef.current += 1;
    } catch (error) {
      console.error("Error loading more items:", error);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingRef.current) {
          loadMoreItems();
        }
      },
      { threshold: 0.1 }
    );

    if (lastDivRef.current && hasMore) {
      observer.observe(lastDivRef.current);
    }

    return () => {
      if (lastDivRef.current) {
        observer.disconnect();
      }
    };
  }, [lastDivRef, hasMore, isFetchingRef]);

  const handleScroll = () => {
    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    const clientHeight = window.innerHeight;

    if (scrollHeight - scrollTop <= clientHeight && !isFetchingRef.current) {
      loadMoreItems();
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  return { items, hasMore, isLoading, lastDivRef };
};

export default useInfiniteScroll;
