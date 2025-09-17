import React, { useState, useRef, useEffect, useMemo } from 'react';

/**
 * VirtualList Component for efficient rendering of large lists
 * Only renders visible items + buffer to improve performance
 */
const VirtualList = ({
  items = [],
  itemHeight = 100,
  containerHeight = 400,
  renderItem,
  buffer = 5,
  className = '',
  ...props
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };

  const visibleItems = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + buffer
    );

    const visible = [];
    for (let i = startIndex; i <= endIndex; i++) {
      visible.push({
        index: i,
        item: items[i],
        top: i * itemHeight
      });
    }

    return {
      items: visible,
      startIndex,
      endIndex,
      totalHeight: items.length * itemHeight
    };
  }, [items, itemHeight, scrollTop, containerHeight, buffer]);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
      {...props}
    >
      <div style={{ height: visibleItems.totalHeight, position: 'relative' }}>
        {visibleItems.items.map(({ index, item, top }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: top,
              left: 0,
              right: 0,
              height: itemHeight,
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VirtualList;